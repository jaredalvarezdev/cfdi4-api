# cfdi4-api

Una API REST construida con TypeScript, Node.js y Express que transforma peticiones JSON estructuradas en documentos XML de CFDI 4.0 conformes al SAT, los firma a través de un PAC (proveedor autorizado de certificación) y regresa el CFDI ya timbrado. Soporta los 3 tipos de comprobante principales que exige el Servicio de Administración Tributaria (SAT) de México: **Ingreso**, **Egreso** (Nota de Crédito) y **Pago** (Complemento de Pago 2.0).

Desarrollado como parte de un proyecto de estadía profesional en **SIDETEC**, en colaboración con la **Universidad Tecnológica de León (UTL)**.

**API en producción:** `https://cfdi4-api.onrender.com`

---

## Tabla de contenido

- [Descripción general](#descripción-general)
- [Características](#características)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Primeros pasos](#primeros-pasos)
- [Variables de entorno](#variables-de-entorno)
- [Autenticación](#autenticación)
- [Referencia de la API](#referencia-de-la-api)
- [Arquitectura](#arquitectura)
- [Reglas de validación](#reglas-de-validación)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Despliegue](#despliegue)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Historial de cambios](#historial-de-cambios)
- [Roadmap](#roadmap)
- [Licencia](#licencia)

---

## Descripción general

`cfdi4-api` recibe una petición JSON estructurada que describe una factura, una nota de crédito o un complemento de pago, la valida contra los catálogos y reglas de negocio del SAT, normaliza los datos de entrada, genera un documento XML de CFDI 4.0 bien formado, y lo envía a un PAC (*Proveedor Autorizado de Certificación*) para su timbrado — regresando el CFDI ya firmado y válido ante el SAT, junto con su UUID.

El proyecto sigue una **arquitectura por dominios y en capas**, separando responsabilidades entre el manejo de peticiones HTTP, la lógica de negocio, la generación de XML, la integración con el PAC, y las utilidades compartidas de validación/normalización.

## Características

- Genera XML de CFDI 4.0 conforme al SAT para:
  - **Ingreso (I)** — facturas estándar
  - **Egreso (E)** — notas de crédito, con referencia a CFDI relacionado
  - **Pago (P)** — Complemento de Pago 2.0
- Endpoint único de timbrado que despacha al builder correcto según el campo `type` del documento, y envía el XML generado a un PAC para su firma
- Autenticación por token en todas las rutas bajo `/api`
- Valida los datos de emisor y receptor, incluyendo:
  - Formato de RFC (incluyendo los RFC genéricos `XAXX010101000` / `XEXX010101000` para receptores de público en general o extranjeros)
  - Régimen fiscal, forma de pago, método de pago, uso de CFDI y moneda contra los catálogos oficiales del SAT
- **Soporte multimoneda con tipo de cambio (`exchangeRate`/`TipoCambio`)** en Ingreso, Egreso y Pago — obligatorio y validado cuando `currency` es distinta de `MXN`
- Exige y genera de forma condicional el nodo **InformacionGlobal** para Ingreso y Egreso — solo cuando el receptor es un RFC genérico (ventas a público en general); se omite automáticamente para cualquier otro receptor, y nunca aplica a Pago
- Valida los conceptos de la factura (claves de producto/unidad, cantidades, precios, impuestos)
- Valida las tasas de traslado y retención de IVA, ISR e IEPS por separado contra los catálogos oficiales del SAT (ver [Reglas de validación](#reglas-de-validación))
- Exige que cada impuesto declare explícitamente su tasa y si es traslado o retención — ya no se asume IVA 16% por default cuando el arreglo `taxes` viene incompleto
- Resta correctamente las retenciones del subtotal al calcular el total de Ingreso y Egreso
- Reporta los totales de retención (`TotalRetencionesIVA`/`ISR`/`IEPS`) en el Complemento de Pago 2.0, además de los totales de traslado ya existentes
- Ordena los nodos de impuestos (`Traslados`/`Retenciones`, y sus variantes `DR`/`P`) conforme a lo que exige el XSD del SAT en cada nivel del documento — el orden es distinto entre CFDI normal y Complemento de Pago
- Valida que el método de pago de un documento relacionado sea PPD antes de aceptarlo en un Complemento de Pago, y valida también los impuestos de cada documento relacionado
- Fuerza el uso de CFDI `CP01` en el receptor de todo Complemento de Pago, conforme lo exige el SAT
- Normaliza y sanea los datos de entrada antes de construir el XML (emisor, receptor, conceptos, impuestos, documentos relacionados) — incluyendo la corrección automática de régimen fiscal/uso de CFDI para RFC genéricos
- Escapa caracteres especiales de XML para evitar salidas mal formadas
- Distingue entre un rechazo del PAC (sello inválido, nodo obligatorio faltante, etc.) y un timbrado exitoso — nunca regresa un timbrado rechazado como si fuera exitoso
- Prioriza el mensaje de error real y específico devuelto por el PAC sobre el mensaje genérico del catálogo interno, para facilitar el diagnóstico de rechazos
- Middleware centralizado de manejo de errores con respuestas JSON consistentes
- Consolidación automática de impuestos y cálculo de subtotal/total con el redondeo correcto a 2 decimales, evitando errores de precisión de punto flotante

## Tecnologías utilizadas

| Capa                        | Tecnología    |
|------------------------------|---------------|
| Entorno de ejecución         | Node.js       |
| Lenguaje                     | TypeScript    |
| Framework web                | Express 5     |
| Configuración de entorno     | dotenv        |
| Herramientas de desarrollo   | ts-node-dev   |
| Despliegue                   | Render        |

## Estructura del proyecto

```
src/
├── app.ts                         # Configuración de la app de Express (middlewares, rutas)
├── server.ts                      # Punto de entrada — levanta el servidor HTTP
├── routes.ts                      # Montaje de rutas de nivel superior
├── config/
│   └── environment.ts             # PORT, TIME_ZONE, credenciales del PAC y de autenticación
├── domains/
│   └── cfdi-builder/
│       ├── cfdi-builder.routes.ts # POST /invoice, /credit-note, /payment, /stamping
│       ├── models/
│       │   ├── invoice/           # Ingreso: modelo, controller, service, builder, validador de InformacionGlobal
│       │   ├── credit-note/       # Egreso: modelo, controller, service, builder, validador de CFDI relacionado
│       │   ├── payment/           # Pago: modelo, controller, service, builder, validador del complemento
│       │   └── stamping/          # Despacha al builder correcto según el tipo, y envía al PAC
│       └── xml/                   # Generadores de fragmentos de XML por sección del CFDI
│           ├── issuer/            # <cfdi:Emisor>
│           ├── receiver/          # <cfdi:Receptor>
│           ├── concepts/          # <cfdi:Conceptos>
│           ├── taxes/             # <cfdi:Impuestos>
│           ├── related-cfdi/      # <cfdi:CfdiRelacionados>
│           ├── global-info/       # <cfdi:InformacionGlobal>
│           ├── payments20/        # Complemento de Pago 2.0
│           ├── voucher/           # Elemento raíz <cfdi:Comprobante>
│           └── xml-generator.ts   # Ensamblaje final del XML
├── integrations/
│   └── pac/                       # Cliente del PAC, catálogo de códigos de error, decodificación base64 del XML timbrado
├── middlewares/
│   ├── api-key.middleware.ts      # Autenticación por token en todas las rutas bajo /api
│   ├── cors.middleware.ts         # Encabezados CORS
│   └── error.middleware.ts        # Manejo centralizado de errores
└── shared/
    ├── catalogs/                  # Catálogos oficiales del SAT (regímenes fiscales, formas/métodos de pago, usos de CFDI, monedas, tipos de impuesto, tipos de relación, periodicidad)
    ├── models/                    # Interfaces de TypeScript compartidas
    ├── normalizers/               # Saneamiento de datos de entrada (emisor, receptor, conceptos, impuestos, documentos relacionados)
    ├── utils/                     # Formateo de fechas, redondeo a 2 decimales, escape de XML
    └── validators/                # Validación de reglas de negocio generales, de conceptos e impuestos
```

## Primeros pasos

### Requisitos previos

- Node.js 18 o superior
- npm

### Instalación

```bash
git clone https://github.com/Jared77zz/cfdi4-api.git
cd cfdi4-api
npm install
```

### Ejecución en desarrollo

```bash
npm run dev
```

El servidor arranca en `http://localhost:3000` por defecto (configurable con `PORT`).

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000

# Credenciales del PAC de pruebas — obligatorias para que /stamping pueda timbrar
TESTER_API_USER=your_pac_test_user
TESTER_API_TOKEN=your_pac_test_token

# Credenciales de autenticación de esta API — quien consuma /api debe presentarlas
API_USER=your_api_user
API_TOKEN=your_api_token
```

> `.env` está excluido del control de versiones mediante `.gitignore`. Nunca subas secretos o tokens reales al repositorio.
> `TESTER_API_USER` / `TESTER_API_TOKEN` son obligatorios para que el endpoint `/stamping` pueda comunicarse con el PAC — los otros tres endpoints (`/invoice`, `/credit-note`, `/payment`) generan XML sin firmar y no los necesitan.
> `API_USER` / `API_TOKEN` protegen todas las rutas bajo `/api` — sin ellas, el servidor responde `500` en lugar de dejar pasar peticiones sin autenticar.

## Autenticación

Todas las rutas bajo `/api` requieren dos headers en cada petición:

```http
Authorization: Bearer <API_TOKEN>
x-api-user: <API_USER>
```

Este es el mismo esquema (RFC 6750, Bearer Token) que esta API usa internamente para autenticarse contra el PAC, aplicado ahora hacia sus propios consumidores.

Si falta el header `Authorization`, no viene con el prefijo `Bearer `, o las credenciales no coinciden con las configuradas en el servidor, la API responde `401 Unauthorized`:

```json
{
  "ok": false,
  "message": "Credenciales de API inválidas o faltantes"
}
```

## Referencia de la API

Todos los endpoints aceptan `application/json`, requieren autenticación (ver arriba), y están montados bajo `/api/cfdi-builder`.

### `POST /api/cfdi-builder/invoice`

Construye un CFDI de tipo **Ingreso (I)**.

Si `receiver.rfc` es `XAXX010101000` (público en general), la petición también debe incluir un objeto `globalInfo`:

```json
"globalInfo": { "periodicity": "04", "months": "07", "year": 2026 }
```

Para cualquier otro RFC de receptor, `globalInfo` no es obligatorio y se ignora si se manda.

Si `currency` es distinta de `MXN`, el documento debe incluir `exchangeRate` con el tipo de cambio correspondiente.

**Respuesta:** `200 OK` con `Content-Type: application/xml` — el XML del CFDI generado (sin firmar). Si falla la validación, regresa `400` con un cuerpo de error en JSON.

### `POST /api/cfdi-builder/credit-note`

Construye un CFDI de tipo **Egreso (E)**. Requiere un objeto `relatedCfdi` (`uuid`, `relationType`) que referencie la factura original que se está acreditando. Aplica la misma regla condicional de `globalInfo` y `exchangeRate` que en Ingreso para receptores genéricos y monedas distintas de `MXN`, respectivamente.

### `POST /api/cfdi-builder/payment`

Construye un CFDI de tipo **Pago (P)** usando el Complemento de Pago 2.0, referenciando uno o más documentos relacionados y sus pagos correspondientes. `InformacionGlobal` no aplica a este tipo de documento, sin importar el RFC del receptor. El uso de CFDI del receptor siempre se fuerza a `CP01`. Cada documento relacionado debe declarar método de pago `PPD` — el CFDI original que se está pagando tuvo que haberse emitido con ese método — y sus propios impuestos son validados individualmente. Si `payment.currency` es distinta de `MXN`, se exige `exchangeRate` en el pago.

### `POST /api/cfdi-builder/stamping`

Acepta el mismo formato de petición que `/invoice`, `/credit-note` o `/payment` (distinguido por el campo `type`, incluyendo las reglas condicionales de `globalInfo` y `exchangeRate` mencionadas arriba), construye el XML correspondiente, y lo envía al PAC para su timbrado.

**Respuesta:** `200 OK` con un cuerpo JSON:

```json
{
  "ok": true,
  "data": {
    "stampedXml": "<?xml version=\"1.0\" ...>...</cfdi:Comprobante>",
    "uuid": "45A1AE99-106F-4F08-A72B-549D77643818",
    "stampedAt": "2026-07-27T23:58:55",
    "pacCode": 0,
    "pacMessage": "*** generado en modo de pruebas ***"
  }
}
```

Si falla la validación o el PAC rechaza el timbrado, regresa `400` con:

```json
{
  "ok": false,
  "message": "..."
}
```

El campo `message` refleja el detalle real devuelto por el PAC cuando el rechazo ocurre en esa etapa (por ejemplo, un error de esquema XSD), en lugar de un mensaje genérico.

Ver [EXAMPLES.md](./EXAMPLES.md) para payloads completos y listos para usar de los 3 tipos de comprobante, incluyendo el caso de receptor genérico con `InformacionGlobal` y el caso de moneda extranjera con `exchangeRate`.

## Arquitectura

Cada tipo de CFDI sigue el mismo flujo por capas:

```
Controller → Service → Builder → XML Generator
```

El endpoint `/stamping` agrega un paso adicional sobre este flujo:

```
Controller → Service → (despacha por tipo al Service correspondiente de arriba) → PAC → XML timbrado y decodificado
```

- **Controller** — procesa la petición HTTP y regresa la respuesta HTTP correspondiente.
- **Service** — orquesta la validación, normalización y cálculo de totales.
- **Builder** — calcula los campos financieros derivados (subtotal, monto de impuestos, total) con el redondeo correcto.
- **XML Generator** — ensambla el string final del XML del CFDI a partir de los datos ya validados y normalizados, usando los namespaces y referencias de esquema que exige el SAT, respetando el orden de nodos que exige cada esquema.
- **Integración con el PAC** (solo en `stamping`) — envía el XML generado al proveedor de certificación, verifica que el timbrado realmente se haya completado (no solo que la petición se haya recibido), y decodifica el XML en base64 que regresa.
- **Middleware de autenticación** — corre antes de llegar a cualquier controller bajo `/api`, validando las credenciales del consumidor.

La lógica compartida (catálogos del SAT, validadores, normalizadores y utilidades) vive en `src/shared/` y se reutiliza entre los 3 tipos de CFDI para evitar duplicación y mantener las reglas de negocio consistentes.

## Reglas de validación

| Regla | Aplica a |
|---|---|
| Autenticación | Todas las rutas `/api` |
| Formato de RFC | Emisor y Receptor |
| Régimen fiscal | Emisor y Receptor |
| Código postal | Emisor y Receptor |
| Forma de pago / método de pago / uso de CFDI / moneda | Ingreso, Egreso |
| Tipo de cambio (`exchangeRate`) | Ingreso, Egreso, Pago |
| Conceptos | Ingreso, Egreso |
| Tasas de impuestos | Impuestos de cualquier concepto/documento |
| InformacionGlobal | Ingreso, Egreso |
| Uso de CFDI del receptor | Pago |
| Método de pago del documento relacionado | Pago |
| Cuadre de saldos | Pago |
| Orden de nodos de impuestos | XML de todos los tipos |

**Detalle de cada regla:**

- **Autenticación** — Header `Authorization: Bearer <token>` + `x-api-user`, comparados contra `API_TOKEN` / `API_USER`.
- **Formato de RFC** — Debe coincidir con el formato que emite el SAT, o ser uno de los 2 RFC genéricos para receptores de público en general/extranjeros.
- **Régimen fiscal** — Debe existir en el catálogo oficial del SAT. Para RFC de receptor genéricos, el régimen fiscal y el uso de CFDI se normalizan automáticamente (`616`, y `S01` o `CP01` según el tipo de documento).
- **Código postal** — Debe tener exactamente 5 dígitos.
- **Forma de pago / método de pago / uso de CFDI / moneda** — Validados contra los catálogos del SAT; no se exigen en los Complementos de Pago, conforme a las reglas del SAT.
- **Tipo de cambio (`exchangeRate`)** — Obligatorio cuando `currency` no es `MXN`; se rechaza si falta, o si la moneda es `MXN` pero se manda un tipo de cambio distinto de 1.
- **Conceptos** — Al menos un concepto; cantidad y valor unitario positivos; las claves de producto/unidad deben cumplir la longitud que exige el SAT; `taxes` debe ser un arreglo (vacío si no aplica), y cada impuesto debe declarar explícitamente su tasa y si es traslado o retención.
- **Tasas de impuestos:**
  - IVA traslado: 0%, 8% o 16%
  - IVA retención: 4% o 10.6667%
  - ISR: 10% (régimen general) o 1.25% (RESICO)
  - IEPS: mayor a 0% y hasta 160%
- **InformacionGlobal** — Obligatorio **únicamente** cuando `receiver.rfc === "XAXX010101000"`; se omite por completo, y no se valida, para cualquier otro receptor. Cuando es obligatorio: `periodicity` debe existir en `c_Periodicidad`, `months` debe ser un código válido de `c_Meses` (`01`–`12` meses, `13`–`17` bimestres, `18` todo el ejercicio), y `year` debe estar entre 2022 y el año actual. **Nunca aplica a Pago**, sin importar el receptor.
- **Uso de CFDI del receptor (Pago)** — Se fuerza siempre a `CP01`, sin importar lo que se envíe en la petición.
- **Método de pago del documento relacionado (Pago)** — Debe ser `PPD`; un CFDI emitido como `PUE` no puede recibir un Complemento de Pago posterior. Los impuestos de cada documento relacionado se validan individualmente contra las mismas tasas permitidas.
- **Cuadre de saldos (Pago)** — `remainingBalance` debe ser exactamente `previousBalance - amountPaid`, y la suma de `amountPaid` de todos los documentos debe coincidir con `payment.amount`.
- **Orden de nodos de impuestos** — `Traslados` antes de `Retenciones` en CFDI de Ingreso/Egreso; `Retenciones` antes de `Traslados` dentro de `ImpuestosDR`/`ImpuestosP` en el Complemento de Pago 2.0. El orden inverso entre ambos esquemas es intencional y exigido por el XSD del SAT.

## Ejemplos de uso

Ver [EXAMPLES.md](./EXAMPLES.md) para payloads JSON completos de Postman/cURL de los 3 tipos de comprobante (Ingreso, Egreso, Pago), incluyendo el caso de receptor genérico con `InformacionGlobal`, moneda extranjera con `exchangeRate`, impuestos mezclados (traslado + retención), y la tabla de errores más comunes.

## Despliegue

La API está desplegada en **Render** (plan gratuito), conectado directamente al branch `main` de este repositorio — cada `git push` a `main` dispara un redeploy automático.

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **URL de producción:** `https://cfdi4-api.onrender.com`

Variables de entorno configuradas en el dashboard de Render (no viven en el repositorio): `TESTER_API_USER`, `TESTER_API_TOKEN`, `API_USER`, `API_TOKEN`.

> El plan gratuito de Render pone el servicio en reposo tras ~15 minutos sin tráfico. La primera petición después de ese periodo de inactividad puede tardar 30–60 segundos en responder mientras la instancia despierta — no es un error, es el comportamiento esperado del plan. El proyecto no requiere más de las 750 horas/mes incluidas en el free tier, ya que corre de forma continua dentro de ese límite.

## Limitaciones conocidas

- Las notas de crédito (Egreso) actualmente solo soportan un único UUID de CFDI relacionado.
- Los descuentos todavía no están soportados.
- La integración con el PAC actualmente apunta a un servicio de timbrado de prueba/sandbox — no a un contrato de PAC de producción.
- La autenticación usa un único usuario/token compartido — no distingue entre distintos consumidores ni permite revocar credenciales de forma individual.
- El plan gratuito de Render no ofrece autoescalado ni garantiza tiempos de respuesta bajos ante tráfico concurrente alto.

## Historial de cambios

Durante la etapa final de estadía se realizó una auditoría completa del código y se corrigieron más de 20 inconsistencias de conformidad con el XSD del SAT y errores de lógica de negocio, entre ellas:

- Separación de los catálogos de tasas de traslado y retención de IVA, y corrección de la tasa de ISR para RESICO (1.25%, antes registrada incorrectamente como 11.25%)
- Eliminación del valor por default de IVA 16% cuando el arreglo de impuestos venía incompleto, exigiendo ahora que el cliente declare explícitamente cada impuesto
- Corrección del cálculo de totales en Ingreso y Egreso para restar correctamente las retenciones
- Corrección del orden de los nodos `Traslados`/`Retenciones` (y sus variantes `DR`/`P`) conforme al XSD de CFDI 4.0 y de Pagos 2.0 respectivamente
- Adición de los totales de retención (`TotalRetencionesIVA`/`ISR`/`IEPS`) al Complemento de Pago 2.0
- Adición de soporte de moneda extranjera y tipo de cambio (`exchangeRate`/`TipoCambio`) a Ingreso, Egreso y Pago
- Validación de los impuestos de cada documento relacionado dentro de un Complemento de Pago
- Corrección de errores de redondeo de punto flotante en los cálculos financieros
- Priorización del mensaje de error real del PAC sobre el mensaje genérico del catálogo interno, para facilitar el diagnóstico de rechazos de timbrado

Todos estos cambios fueron validados en producción (Render) contra el PAC de pruebas, cubriendo los escenarios de Egreso con IVA+ISR, IVA retenido al 10.6667%, ISR retenido sin IVA, y Pago con traslado y retención de IVA mezclados en el mismo documento relacionado.

## Roadmap

- [x] Endpoint de integración con el PAC: recibir un JSON, construir el XML, enviarlo a timbrar, y regresar el CFDI firmado
- [x] Middleware de autenticación por token para restringir el acceso a clientes autorizados
- [x] Despliegue en producción (Render)
- [x] Soporte de moneda extranjera y tipo de cambio
- [x] Totales de retención en el Complemento de Pago 2.0
- [ ] Autenticación por múltiples API keys, con revocación individual por consumidor
- [ ] Soporte para múltiples CFDI relacionados en notas de crédito
- [ ] Soporte de descuentos a nivel concepto

## Licencia

Proyecto académico — Universidad Tecnológica de León (UTL) / SIDETEC.