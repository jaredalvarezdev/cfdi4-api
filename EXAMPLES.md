# Ejemplos de uso — cfdi4-api

Payloads completos y listos para usar en Postman o cURL contra `POST /api/cfdi-builder/stamping`.

Todos los ejemplos usan el emisor de pruebas fijo que exige el PAC de pruebas:

```text
RFC: EKU9003173C9
Razón social: ESCUELA KEMPER URGATE SA DE CV
Régimen fiscal: 601
```

---

## Tabla de contenido

- [Autenticación](#autenticación)
- [1. Ingreso — receptor normal](#1-ingreso-i--receptor-normal)
- [2. Ingreso — receptor genérico (público en general)](#2-ingreso-i--receptor-genérico-público-en-general)
- [3. Ingreso — IVA trasladado + IVA retenido](#3-ingreso-i--iva-trasladado--iva-retenido)
- [4. Ingreso — solo ISR retenido (RESICO), sin IVA](#4-ingreso-i--solo-isr-retenido-resico-sin-iva)
- [5. Ingreso — moneda extranjera con tipo de cambio](#5-ingreso-i--moneda-extranjera-con-tipo-de-cambio)
- [6. Egreso — Nota de crédito](#6-egreso-e--nota-de-crédito)
- [7. Pago — Complemento de Pago 2.0](#7-pago-p--complemento-de-pago-20)
- [8. Pago — impuestos mezclados (traslado + retención)](#8-pago-p--impuestos-mezclados-traslado--retención)
- [Respuesta esperada (éxito)](#respuesta-esperada-éxito)
- [Errores comunes](#errores-comunes)

---

## Autenticación

Todos los endpoints bajo `/api` requieren estos headers en cada petición:

```http
Content-Type: application/json
Authorization: Bearer <API_TOKEN>
x-api-user: <API_USER>
```

Sustituye `<API_TOKEN>` y `<API_USER>` por los valores configurados en el entorno donde estés probando (local o producción). Si faltan, vienen mal escritos, o no coinciden, la API responde `401 Unauthorized` sin llegar a construir ningún XML.

---

## 1. Ingreso (I) — receptor normal

```http
POST https://cfdi4-api.onrender.com/api/cfdi-builder/stamping
```

```json
{
  "type": "I",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "GODE561231GR8",
    "name": "JUAN PEREZ GONZALEZ",
    "zipCode": "37000",
    "taxRegime": "612",
    "cfdiUse": "G03"
  },
  "concepts": [
    {
      "productKey": "01010101",
      "unitKey": "E48",
      "description": "Servicio de consultoria",
      "unitPrice": 1000,
      "quantity": 1,
      "taxes": [
        { "type": "IVA", "rate": 0.16, "withholding": false }
      ]
    }
  ],
  "paymentForm": "03",
  "paymentMethod": "PUE",
  "currency": "MXN",
  "expeditionZipCode": "37000"
}
```

---

## 2. Ingreso (I) — receptor genérico (público en general)

Cuando `receiver.rfc` es `XAXX010101000`, el nodo `globalInfo` es **obligatorio**. Si se omite, la API responde `400` con `"El nodo InformacionGlobal es obligatorio cuando el receptor es XAXX010101000"`.

```json
{
  "type": "I",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "XAXX010101000",
    "name": "PUBLICO EN GENERAL",
    "zipCode": "37000",
    "taxRegime": "616",
    "cfdiUse": "S01"
  },
  "concepts": [
    {
      "productKey": "01010101",
      "unitKey": "E48",
      "description": "Venta de mostrador",
      "unitPrice": 500,
      "quantity": 3,
      "taxes": [
        { "type": "IVA", "rate": 0.16, "withholding": false }
      ]
    }
  ],
  "paymentForm": "01",
  "paymentMethod": "PUE",
  "currency": "MXN",
  "expeditionZipCode": "37000",
  "globalInfo": {
    "periodicity": "04",
    "months": "07",
    "year": 2026
  }
}
```

**Notas sobre `globalInfo`:**
- `periodicity` — código de `c_Periodicidad` del SAT (ej. `"04"` = mensual).
- `months` — código de `c_Meses`: `"01"`–`"12"` para meses individuales, `"13"`–`"17"` para bimestres, `"18"` para todo el ejercicio.
- `year` — entero entre `2022` y el año actual.
- Para receptores con RFC distinto de `XAXX010101000` o `XEXX010101000`, este nodo se ignora aunque se envíe.

---

## 3. Ingreso (I) — IVA trasladado + IVA retenido

Un mismo concepto puede llevar dos impuestos del mismo tipo (`IVA`) siempre que uno sea traslado y el otro retención. La tasa de retención de IVA (`10.6667%`) es distinta de la tasa de traslado y se valida contra su propio catálogo.

```json
{
  "type": "I",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "GODE561231GR8",
    "name": "JUAN PEREZ GONZALEZ",
    "zipCode": "37000",
    "taxRegime": "612",
    "cfdiUse": "G03"
  },
  "concepts": [
    {
      "productKey": "84111506",
      "unitKey": "E48",
      "description": "Servicio profesional con retencion de IVA",
      "unitPrice": 3000,
      "quantity": 1,
      "taxes": [
        { "type": "IVA", "rate": 0.16, "withholding": false },
        { "type": "IVA", "rate": 0.106667, "withholding": true }
      ]
    }
  ],
  "paymentForm": "03",
  "paymentMethod": "PUE",
  "currency": "MXN",
  "expeditionZipCode": "37000"
}
```

**Nota:** cada impuesto debe declarar explícitamente `rate` y `withholding` — la API ya no asume IVA 16% por default cuando falta información. El `Total` del comprobante resta correctamente el monto retenido del subtotal más el traslado.

---

## 4. Ingreso (I) — solo ISR retenido (RESICO), sin IVA

Caso típico de honorarios/servicios profesionales bajo el Régimen Simplificado de Confianza (RESICO), donde solo aplica retención de ISR al 1.25%, sin ningún IVA.

```json
{
  "type": "I",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "GODE561231GR8",
    "name": "JUAN PEREZ GONZALEZ",
    "zipCode": "37000",
    "taxRegime": "612",
    "cfdiUse": "G03"
  },
  "concepts": [
    {
      "productKey": "84111506",
      "unitKey": "E48",
      "description": "Honorarios RESICO",
      "unitPrice": 1000,
      "quantity": 1,
      "taxes": [
        { "type": "ISR", "rate": 0.0125, "withholding": true }
      ]
    }
  ],
  "paymentForm": "03",
  "paymentMethod": "PUE",
  "currency": "MXN",
  "expeditionZipCode": "37000"
}
```

**Nota:** la tasa correcta de ISR para RESICO es `0.0125` (1.25%), no `0.1125`. El XML generado no incluye ningún nodo `<cfdi:Traslados>` cuando el concepto no lleva impuestos trasladados — solo `<cfdi:Retenciones>`.

---

## 5. Ingreso (I) — moneda extranjera con tipo de cambio

Cuando `currency` es distinta de `MXN`, el campo `exchangeRate` es obligatorio y debe reflejar el tipo de cambio aplicado.

```json
{
  "type": "I",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "GODE561231GR8",
    "name": "JUAN PEREZ GONZALEZ",
    "zipCode": "37000",
    "taxRegime": "612",
    "cfdiUse": "G03"
  },
  "concepts": [
    {
      "productKey": "84111506",
      "unitKey": "E48",
      "description": "Servicio de consultoria internacional",
      "unitPrice": 200,
      "quantity": 1,
      "taxes": [
        { "type": "IVA", "rate": 0.16, "withholding": false }
      ]
    }
  ],
  "paymentForm": "03",
  "paymentMethod": "PUE",
  "currency": "USD",
  "exchangeRate": 18.53,
  "expeditionZipCode": "37000"
}
```

**Notas:**
- Si `currency` no es `MXN` y no se manda `exchangeRate`, la API responde `400` con `"El campo exchangeRate es obligatorio cuando la moneda no es MXN"`.
- Si `currency` es `MXN`, `exchangeRate` debe omitirse o valer `1` — cualquier otro valor se rechaza.
- Aplica de la misma forma a Egreso y a `payment.currency` dentro de Pago (ver [ejemplo 8](#8-pago-p--impuestos-mezclados-traslado--retención)).

---

## 6. Egreso (E) — Nota de crédito

Requiere `relatedCfdi` con el `uuid` de la factura que se está acreditando. El `relationType` `"01"` corresponde a "Nota de crédito de los documentos relacionados" según el catálogo `c_TipoRelacion` del SAT.

```json
{
  "type": "E",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "GODE561231GR8",
    "name": "JUAN PEREZ GONZALEZ",
    "zipCode": "37000",
    "taxRegime": "612",
    "cfdiUse": "G03"
  },
  "concepts": [
    {
      "productKey": "01010101",
      "unitKey": "E48",
      "description": "Descuento por devolucion parcial",
      "unitPrice": 500,
      "quantity": 1,
      "taxes": [
        { "type": "IVA", "rate": 0.16, "withholding": false }
      ]
    }
  ],
  "paymentForm": "03",
  "paymentMethod": "PUE",
  "currency": "MXN",
  "expeditionZipCode": "37000",
  "relatedCfdi": {
    "uuid": "45A1AE99-106F-4F08-A72B-549D77643818",
    "relationType": "01"
  }
}
```

---

## 7. Pago (P) — Complemento de Pago 2.0

**Requisito indispensable:** el documento relacionado (`relatedDocuments[].paymentMethod`) debe ser `"PPD"`. Esto significa que la factura original tuvo que haberse timbrado con `"paymentMethod": "PPD"` — un CFDI emitido como `"PUE"` no puede recibir un Complemento de Pago después; el SAT lo considera pagado desde su emisión.

El `cfdiUse` del receptor se fuerza siempre a `CP01` en el XML generado, sin importar lo que se envíe en la petición.

### 7.1 — Primero: timbra un Ingreso en modalidad PPD

```json
{
  "type": "I",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "GODE561231GR8",
    "name": "JUAN PEREZ GONZALEZ",
    "zipCode": "37000",
    "taxRegime": "612",
    "cfdiUse": "G03"
  },
  "concepts": [
    {
      "productKey": "01010101",
      "unitKey": "E48",
      "description": "Servicio de consultoria",
      "unitPrice": 3000,
      "quantity": 1,
      "taxes": [
        { "type": "IVA", "rate": 0.16, "withholding": false }
      ]
    }
  ],
  "paymentForm": "99",
  "paymentMethod": "PPD",
  "currency": "MXN",
  "expeditionZipCode": "37000"
}
```

Guarda el `uuid` y el `Total` que regrese el timbrado — los vas a necesitar en el siguiente paso.

### 7.2 — Con ese UUID, arma el Pago

```json
{
  "type": "P",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "GODE561231GR8",
    "name": "JUAN PEREZ GONZALEZ",
    "zipCode": "37000",
    "taxRegime": "612",
    "cfdiUse": "CP01"
  },
  "expeditionZipCode": "37000",
  "payments": [
    {
      "paymentDate": "2026-07-28T18:00:00",
      "paymentForm": "03",
      "amount": 3480,
      "currency": "MXN",
      "relatedDocuments": [
        {
          "uuid": "44E55673-63E7-4C8E-AAD0-20062864995F",
          "paymentMethod": "PPD",
          "installmentNumber": 1,
          "previousBalance": 3480,
          "amountPaid": 3480,
          "remainingBalance": 0,
          "taxes": []
        }
      ]
    }
  ]
}
```

**Reemplaza:**
- `relatedDocuments[0].uuid` con el UUID real que te regresó el paso 7.1.
- `previousBalance` / `amountPaid` con el `Total` real de esa factura.
- `remainingBalance` con `previousBalance - amountPaid` (`0` si se paga de una sola vez).

**Nombres de campo correctos** (errores comunes si no coinciden exactamente):

| Campo correcto | Error si escribes... |
|---|---|
| `installmentNumber` | `installment` |
| `amountPaid` | `paidAmount` |
| `remainingBalance` | `outstandingBalance` |

---

## 8. Pago (P) — impuestos mezclados (traslado + retención)

Caso más complejo del Complemento de Pago: el documento relacionado trae traslado y retención de IVA en el mismo `taxes`. Este caso ejercita el orden correcto de nodos que exige el XSD de Pagos 2.0 — `RetencionesDR`/`RetencionesP` **antes** de `TrasladosDR`/`TrasladosP` (al revés que en un CFDI de Ingreso/Egreso normal).

### 8.1 — Timbra un Ingreso PPD con IVA trasladado + retenido

```json
{
  "type": "I",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "GODE561231GR8",
    "name": "JUAN PEREZ GONZALEZ",
    "zipCode": "37000",
    "taxRegime": "612",
    "cfdiUse": "G03"
  },
  "concepts": [
    {
      "productKey": "84111506",
      "unitKey": "E48",
      "description": "Servicio con IVA y retencion de IVA",
      "unitPrice": 3000,
      "quantity": 1,
      "taxes": [
        { "type": "IVA", "rate": 0.16, "withholding": false },
        { "type": "IVA", "rate": 0.106667, "withholding": true }
      ]
    }
  ],
  "paymentForm": "99",
  "paymentMethod": "PPD",
  "currency": "MXN",
  "expeditionZipCode": "37000"
}
```

### 8.2 — Arma el Pago referenciando ambos impuestos

```json
{
  "type": "P",
  "issuer": {
    "rfc": "EKU9003173C9",
    "name": "ESCUELA KEMPER URGATE SA DE CV",
    "taxRegime": "601"
  },
  "receiver": {
    "rfc": "GODE561231GR8",
    "name": "JUAN PEREZ GONZALEZ",
    "zipCode": "37000",
    "taxRegime": "612",
    "cfdiUse": "CP01"
  },
  "expeditionZipCode": "37000",
  "payments": [
    {
      "paymentDate": "2026-07-28T18:00:00",
      "paymentForm": "03",
      "amount": 3160,
      "currency": "MXN",
      "relatedDocuments": [
        {
          "uuid": "CFFFA8D5-087D-4629-8EF3-FF106E4E7133",
          "paymentMethod": "PPD",
          "installmentNumber": 1,
          "previousBalance": 3160,
          "amountPaid": 3160,
          "remainingBalance": 0,
          "taxes": [
            { "type": "IVA", "rate": 0.16, "withholding": false },
            { "type": "IVA", "rate": 0.106667, "withholding": true }
          ]
        }
      ]
    }
  ]
}
```

**Resultado esperado en el `stampedXml`:**
- `<pago20:ImpuestosDR>` con `RetencionesDR` antes de `TrasladosDR`.
- `<pago20:ImpuestosP>` con `RetencionesP` antes de `TrasladosP`.
- El nodo `<pago20:Totales>` incluye tanto `TotalRetencionesIVA` como `TotalTrasladosBaseIVA16`/`TotalTrasladosImpuestoIVA16`.

Para pagos en moneda extranjera, agrega `"exchangeRate"` dentro del objeto de `payments[]` correspondiente, siguiendo la misma regla del [ejemplo 5](#5-ingreso-i--moneda-extranjera-con-tipo-de-cambio).

---

## Respuesta esperada (éxito)

```json
{
  "ok": true,
  "data": {
    "stampedXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><cfdi:Comprobante ...>...</cfdi:Comprobante>",
    "uuid": "44E55673-63E7-4C8E-AAD0-20062864995F",
    "stampedAt": "2026-07-28T12:06:54",
    "pacCode": 0,
    "pacMessage": "*** generado en modo de pruebas ***"
  }
}
```

## Errores comunes

| Mensaje de error | Causa |
|---|---|
| `Credenciales de API inválidas o faltantes` | Falta o es incorrecto el header `Authorization` o `x-api-user` |
| `Código postal inválido: undefined` | Falta `expeditionZipCode` en el nivel raíz del payload |
| `El nodo InformacionGlobal es obligatorio cuando el receptor es XAXX010101000` | Receptor genérico sin `globalInfo` |
| `El campo exchangeRate es obligatorio cuando la moneda no es MXN` | Se mandó `currency` distinta de `MXN` sin `exchangeRate` |
| `El tipo de cambio debe ser 1 cuando la moneda es MXN` | Se mandó `exchangeRate` distinto de `1` con `currency: "MXN"` |
| `La tasa de IVA es inválida: 0.1125` | Se usó una tasa de traslado o retención que no está en el catálogo correspondiente (revisa si es traslado o retención — cada uno tiene su propio catálogo) |
| `El documento 1 del pago 1 debe tener método de pago PPD` | El CFDI relacionado se timbró como `PUE` en vez de `PPD` |
| `El documento 1 del pago 1 tiene un número de parcialidad inválido` | Se usó `installment` en vez de `installmentNumber` (o no es un entero positivo) |
| `El documento 1 del pago 1 no cuadra: esperado X, recibido Y` | `remainingBalance` no coincide con `previousBalance - amountPaid` |
| `El pago 1 no cuadra: la suma de importes pagados es X pero el monto del pago es Y` | La suma de `amountPaid` de todos los documentos no coincide con `payment.amount` |
| `XML mal formado o con estructura inválida: cvc-complex-type.2.4.d ... RetencionesP` | Orden incorrecto de nodos de impuestos en el complemento de pago (ya corregido; indica una versión desactualizada desplegada) |