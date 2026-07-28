# cfdi4-api

Una API REST construida con TypeScript, Node.js y Express que transforma peticiones JSON estructuradas en documentos XML de CFDI 4.0 conformes al SAT, los firma a través de un PAC (proveedor autorizado de certificación) y regresa el CFDI ya timbrado. Soporta los 3 tipos de comprobante principales que exige el Servicio de Administración Tributaria (SAT) de México: **Ingreso**, **Egreso** (Nota de Crédito) y **Pago** (Complemento de Pago 2.0).

Desarrollado como parte de un proyecto de estadía profesional en **SIDETEC**, en colaboración con la **Universidad Tecnológica de León (UTL)**.

---

## Tabla de contenido

- [Descripción general](#descripción-general)
- [Características](#características)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Primeros pasos](#primeros-pasos)
- [Variables de entorno](#variables-de-entorno)
- [Referencia de la API](#referencia-de-la-api)
- [Arquitectura](#arquitectura)
- [Reglas de validación](#reglas-de-validación)
- [Limitaciones conocidas](#limitaciones-conocidas)
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
- Valida los datos de emisor y receptor, incluyendo:
  - Formato de RFC (incluyendo los RFC genéricos `XAXX010101000` / `XEXX010101000` para receptores de público en general o extranjeros)
  - Régimen fiscal, forma de pago, método de pago, uso de CFDI y moneda contra los catálogos oficiales del SAT
- Exige y genera de forma condicional el nodo **InformacionGlobal** para Ingreso y Egreso — solo cuando el receptor es un RFC genérico (ventas a público en general); se omite automáticamente para cualquier otro receptor, y nunca aplica a Pago
- Valida los conceptos de la factura (claves de producto/unidad, cantidades, precios, impuestos)
- Valida las tasas de impuestos de IVA, ISR e IEPS contra los valores permitidos por el SAT
- Normaliza y sanea los datos de entrada antes de construir el XML (emisor, receptor, conceptos, impuestos, documentos relacionados) — incluyendo la corrección automática de régimen fiscal/uso de CFDI para RFC genéricos
- Escapa caracteres especiales de XML para evitar salidas mal formadas
- Distingue entre un rechazo del PAC (sello inválido, nodo obligatorio faltante, etc.) y un timbrado exitoso — nunca regresa un timbrado rechazado como si fuera exitoso
- Middleware centralizado de manejo de errores con respuestas JSON consistentes
- Consolidación automática de impuestos y cálculo de subtotal/total con el redondeo correcto a 2 decimales

## Tecnologías utilizadas

| Capa                  | Tecnología    |
|-----------------------|---------------|
| Entorno de ejecución  | Node.js       |
| Lenguaje              | TypeScript    |
| Framework web         | Express 5     |
| Configuración de entorno | dotenv     |
| Herramientas de desarrollo | ts-node-dev |

## Estructura del proyecto

```
src/
├── app.ts                         # Configuración de la app de Express (middlewares, rutas)
├── server.ts                      # Punto de entrada — levanta el servidor HTTP
├── routes.ts                      # Montaje de rutas de nivel superior
├── config/
│   └── environment.ts             # PORT, TIME_ZONE, credenciales de prueba del PAC, y demás configuración
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
│   ├── cors.middleware.ts         # Encabezados CORS
│   └── error.middleware.ts        # Manejo centralizado de errores
└── shared/
    ├── catalogs/                  # Catálogos oficiales del SAT (regímenes fiscales, formas/métodos de pago, usos de CFDI, monedas, tipos de impuesto, tipos de relación, periodicidad)
    ├── models/                    # Interfaces de TypeScript compartidas
    ├── normalizers/                # Saneamiento de datos de entrada (emisor, receptor, conceptos, impuestos, documentos relacionados)
    ├── utils/                      # Formateo de fechas, redondeo a 2 decimales, escape de XML
    └── validators/                 # Validación de reglas de negocio generales, de conceptos e impuestos
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
TESTER_API_USER=your_pac_test_user
TESTER_API_TOKEN=your_pac_test_token
```

> `.env` está excluido del control de versiones mediante `.gitignore`. Nunca subas secretos o tokens reales al repositorio.
> `TESTER_API_USER` / `TESTER_API_TOKEN` son obligatorios para que el endpoint `/stamping` pueda comunicarse con el PAC — los otros tres endpoints (`/invoice`, `/credit-note`, `/payment`) generan XML sin firmar y no los necesitan.

## Referencia de la API

Todos los endpoints aceptan `application/json` y están montados bajo `/api/cfdi-builder`.

### `POST /api/cfdi-builder/invoice`

Construye un CFDI de tipo **Ingreso (I)**.

Si `receiver.rfc` es `XAXX010101000` (público en general), la petición también debe incluir un objeto `globalInfo`:

```json
"globalInfo": { "periodicity": "04", "months": "07", "year": 2026 }
```

Para cualquier otro RFC de receptor, `globalInfo` no es obligatorio y se ignora si se manda.

**Respuesta:** `200 OK` con `Content-Type: application/xml` — el XML del CFDI generado (sin firmar). Si falla la validación, regresa `400` con un cuerpo de error en JSON.

### `POST /api/cfdi-builder/credit-note`

Construye un CFDI de tipo **Egreso (E)**. Requiere un objeto `relatedCfdi` (`uuid`, `relationType`) que referencie la factura original que se está acreditando. Aplica la misma regla condicional de `globalInfo` que en Ingreso para receptores genéricos.

### `POST /api/cfdi-builder/payment`

Construye un CFDI de tipo **Pago (P)** usando el Complemento de Pago 2.0, referenciando uno o más documentos relacionados y sus pagos correspondientes. `InformacionGlobal` no aplica a este tipo de documento, sin importar el RFC del receptor.

### `POST /api/cfdi-builder/stamping`

Acepta el mismo formato de petición que `/invoice`, `/credit-note` o `/payment` (distinguido por el campo `type`, incluyendo las reglas condicionales de `globalInfo` mencionadas arriba), construye el XML correspondiente, y lo envía al PAC para su timbrado.

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
- **XML Generator** — ensambla el string final del XML del CFDI a partir de los datos ya validados y normalizados, usando los namespaces y referencias de esquema que exige el SAT.
- **Integración con el PAC** (solo en `stamping`) — envía el XML generado al proveedor de certificación, verifica que el timbrado realmente se haya completado (no solo que la petición se haya recibido), y decodifica el XML en base64 que regresa.

La lógica compartida (catálogos del SAT, validadores, normalizadores y utilidades) vive en `src/shared/` y se reutiliza entre los 3 tipos de CFDI para evitar duplicación y mantener las reglas de negocio consistentes.

## Reglas de validación

| Regla | Aplica a | Detalle |
|---|---|---|
| Formato de RFC | Emisor y Receptor | Debe coincidir con el formato que emite el SAT, o ser uno de los 2 RFC genéricos para receptores de público en general/extranjeros |
| Régimen fiscal | Emisor y Receptor | Debe existir en el catálogo oficial del SAT. Para RFC de receptor genéricos, el régimen fiscal y el uso de CFDI se normalizan automáticamente (`616`, y `S01` o `CP01` según el tipo de documento) |
| Código postal | Emisor y Receptor | Debe tener exactamente 5 dígitos |
| Forma de pago / método de pago / uso de CFDI / moneda | Ingreso, Egreso | Validados contra los catálogos del SAT — no se exigen en los Complementos de Pago, conforme a las reglas del SAT |
| Conceptos | Ingreso, Egreso | Al menos un concepto; cantidad y valor unitario positivos; las claves de producto/unidad deben cumplir la longitud que exige el SAT; `taxes` debe ser un arreglo (vacío si no aplica) |
| Tasas de impuestos | Impuestos de cualquier concepto/documento | IVA: 0%, 8% o 16% · ISR: 10% u 11.25% · IEPS: mayor a 0% y hasta 160% |
| **InformacionGlobal** | Ingreso, Egreso | Obligatorio **únicamente** cuando `receiver.rfc === "XAXX010101000"` — se omite por completo, y no se valida, para cualquier otro receptor. Cuando es obligatorio: `periodicity` debe existir en `c_Periodicidad`, `months` debe ser un código válido de `c_Meses`, y `year` debe ser un valor razonable. **Nunca aplica a Pago**, sin importar el receptor. |

## Limitaciones conocidas

- Las notas de crédito (Egreso) actualmente solo soportan un único UUID de CFDI relacionado.
- Algunos campos relacionados con moneda están fijos en lugar de ser completamente dinámicos.
- Los descuentos todavía no están soportados.
- La integración con el PAC actualmente apunta a un servicio de timbrado de prueba/sandbox — no a un contrato de PAC de producción.
- Todavía no hay middleware de autenticación ni llave de API — la API está abierta a cualquier consumidor.
- Aún no está desplegada; solo corre en local.

## Roadmap

- [x] Endpoint de integración con el PAC: recibir un JSON, construir el XML, enviarlo a timbrar, y regresar el CFDI firmado
- [ ] Middleware de autenticación por llave de API para restringir el acceso a clientes autorizados
- [ ] Despliegue en producción (Render)

## Licencia

Proyecto académico — Universidad Tecnológica de León (UTL) / SIDETEC.