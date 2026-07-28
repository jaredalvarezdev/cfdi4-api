# cfdi4-api

A REST API built with TypeScript, Node.js, and Express that transforms structured JSON payloads into SAT-compliant CFDI 4.0 XML documents, signs them via a PAC (certification provider), and returns the stamped CFDI. It supports the three main voucher types required by Mexico's tax authority (SAT): **Ingreso** (Income), **Egreso** (Credit Note), and **Pago** (Payment Complement 2.0).

Developed as part of a professional internship (*estadía*) at **SIDETEC**, in collaboration with **Universidad Tecnológica de León (UTL)**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Validation Rules](#validation-rules)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

`cfdi4-api` receives a structured JSON request describing an invoice, credit note, or payment complement, validates it against SAT catalogs and business rules, normalizes the input data, generates a well-formed CFDI 4.0 XML document, and submits it to a PAC (*Proveedor Autorizado de Certificación*) for stamping (*timbrado*) — returning the signed, SAT-valid CFDI along with its UUID.

The project follows a **domain-driven, layered architecture**, separating concerns between HTTP handling, business logic, XML generation, PAC integration, and shared validation/normalization utilities.

## Features

- Generates SAT-compliant CFDI 4.0 XML for:
  - **Ingreso (I)** — standard invoices
  - **Egreso (E)** — credit notes, with related-CFDI referencing
  - **Pago (P)** — Payment Complement 2.0
- Single stamping endpoint that dispatches to the correct builder based on document `type`, then submits the generated XML to a PAC for signing
- Validates issuer and receiver data, including:
  - RFC format (including generic RFCs `XAXX010101000` / `XEXX010101000` for public/foreign receivers)
  - Tax regime, payment form, payment method, CFDI use, and currency against official SAT catalogs
- Conditionally requires and generates **InformacionGlobal** for Ingreso and Egreso — only when the receiver is a generic RFC (public-at-large sales); omitted automatically for any other receiver, and never applies to Pago
- Validates line-item concepts (product/unit keys, quantities, pricing, taxes)
- Validates tax rates for IVA, ISR, and IEPS against SAT-permitted values
- Normalizes and sanitizes incoming data before XML construction (issuer, receiver, concepts, taxes, related documents) — including automatic correction of tax regime/CFDI use for generic RFCs
- Escapes special XML characters to prevent malformed output
- Distinguishes PAC-level rejections (invalid seal, missing required node, etc.) from successful stamping — never returns a rejected *timbrado* as a success
- Centralized error handling middleware with consistent JSON error responses
- Automatic tax consolidation and subtotal/total calculation with proper 2-decimal rounding

## Tech Stack

| Layer              | Technology    |
|--------------------|---------------|
| Runtime            | Node.js       |
| Language           | TypeScript    |
| Web framework      | Express 5     |
| Environment config | dotenv        |
| Dev tooling        | ts-node-dev   |

## Project Structure

```
src/
├── app.ts                         # Express app configuration (middlewares, routes)
├── server.ts                      # Entry point — starts the HTTP server
├── routes.ts                      # Top-level route mounting
├── config/
│   └── environment.ts             # PORT, TIME_ZONE, PAC test credentials, and other runtime config
├── domains/
│   └── cfdi-builder/
│       ├── cfdi-builder.routes.ts # POST /invoice, /credit-note, /payment, /stamping
│       ├── models/
│       │   ├── invoice/           # Ingreso: model, controller, service, builder, InformacionGlobal validator
│       │   ├── credit-note/       # Egreso: model, controller, service, builder, related-CFDI validator
│       │   ├── payment/           # Pago: model, controller, service, builder, complement validator
│       │   └── stamping/          # Dispatches to the correct builder by type, then submits to the PAC
│       └── xml/                   # XML fragment generators per CFDI section
│           ├── issuer/            # <cfdi:Emisor>
│           ├── receiver/          # <cfdi:Receptor>
│           ├── concepts/          # <cfdi:Conceptos>
│           ├── taxes/             # <cfdi:Impuestos>
│           ├── related-cfdi/      # <cfdi:CfdiRelacionados>
│           ├── global-info/       # <cfdi:InformacionGlobal>
│           ├── payments20/        # Payment Complement 2.0
│           ├── voucher/           # Root <cfdi:Comprobante> element
│           └── xml-generator.ts   # Top-level XML assembly
├── integrations/
│   └── pac/                       # PAC client, error code catalog, base64 stamped-xml decoding
├── middlewares/
│   ├── cors.middleware.ts         # CORS headers
│   └── error.middleware.ts        # Centralized error handling
└── shared/
    ├── catalogs/                  # SAT official catalogs (tax regimes, payment forms/methods, CFDI uses, currencies, tax types, relation types, periodicity)
    ├── models/                    # Shared TypeScript interfaces
    ├── normalizers/                # Input sanitization (issuer, receiver, concepts, taxes, related documents)
    ├── utils/                      # Date formatting, 2-decimal rounding, XML escaping
    └── validators/                 # General, concept, and tax business-rule validation
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
git clone https://github.com/Jared77zz/cfdi4-api.git
cd cfdi4-api
npm install
```

### Running in development

```bash
npm run dev
```

The server starts on `http://localhost:3000` by default (configurable via `PORT`).

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
TESTER_API_USER=your_pac_test_user
TESTER_API_TOKEN=your_pac_test_token
```

> `.env` is excluded from version control via `.gitignore`. Never commit real secrets or tokens to the repository.
> `TESTER_API_USER` / `TESTER_API_TOKEN` are required for the `/stamping` endpoint to reach the PAC — the other three endpoints (`/invoice`, `/credit-note`, `/payment`) build unsigned XML and don't need them.

## API Reference

All endpoints accept `application/json` and are mounted under `/api/cfdi-builder`.

### `POST /api/cfdi-builder/invoice`

Builds a CFDI of type **Ingreso (I)**.

If `receiver.rfc` is `XAXX010101000` (public-at-large), the payload must also include a `globalInfo` object:

```json
"globalInfo": { "periodicity": "04", "months": "07", "year": 2026 }
```

For any other receiver RFC, `globalInfo` is not required and is ignored if sent.

**Response:** `200 OK` with `Content-Type: application/xml` — the generated (unsigned) CFDI XML. On validation failure, returns `400` with a JSON error body.

### `POST /api/cfdi-builder/credit-note`

Builds a CFDI of type **Egreso (E)**. Requires a `relatedCfdi` object (`uuid`, `relationType`) referencing the original invoice being credited. The same conditional `globalInfo` requirement as Ingreso applies for generic receivers.

### `POST /api/cfdi-builder/payment`

Builds a CFDI of type **Pago (P)** using Payment Complement 2.0, referencing one or more related documents and their corresponding payments. `InformacionGlobal` does not apply to this document type, regardless of the receiver's RFC.

### `POST /api/cfdi-builder/stamping`

Accepts the same payload shape as `/invoice`, `/credit-note`, or `/payment` (distinguished by the `type` field, including the conditional `globalInfo` rules above), builds the corresponding XML, and submits it to the PAC for stamping.

**Response:** `200 OK` with a JSON body:

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

On validation failure or PAC rejection, returns `400` with:

```json
{
  "ok": false,
  "message": "..."
}
```

## Architecture

Each CFDI type follows the same layered flow:

```
Controller → Service → Builder → XML Generator
```

The `/stamping` endpoint adds one more step on top of this:

```
Controller → Service → (dispatch by type to the matching Service above) → PAC → decoded, stamped XML
```

- **Controller** — parses the HTTP request and returns the appropriate HTTP response.
- **Service** — orchestrates validation, normalization, and calculation of totals.
- **Builder** — computes derived financial fields (subtotal, tax amount, total) with proper rounding.
- **XML Generator** — assembles the final CFDI XML string from validated, normalized data, using SAT-compliant namespaces and schema references.
- **PAC integration** (`stamping` only) — submits the generated XML to the certification provider, verifies the stamping actually succeeded (not just that the request was received), and decodes the returned base64 XML.

Shared logic (SAT catalogs, validators, normalizers, and utilities) lives under `src/shared/` and is reused across all three CFDI types to avoid duplication and keep business rules consistent.

## Validation Rules

| Rule | Applies to | Details |
|---|---|---|
| RFC format | Issuer & Receiver | Must match the SAT-issued format, or one of the two generic RFCs for public/foreign receivers |
| Tax regime | Issuer & Receiver | Must exist in the official SAT catalog. For generic receiver RFCs, tax regime and CFDI use are normalized automatically (`616`, and `S01` or `CP01` depending on document type) |
| Postal codes | Issuer & Receiver | Must be exactly 5 digits |
| Payment form / method / CFDI use / currency | Ingreso, Egreso | Validated against SAT catalogs — not required for Payment Complements, per SAT rules |
| Concepts | Ingreso, Egreso | At least one item; positive quantity and unit price; product/unit keys must match SAT length requirements; `taxes` must be an array (empty if not applicable) |
| Tax rates | All concept/document taxes | IVA: 0%, 8%, or 16% · ISR: 10% or 11.25% · IEPS: greater than 0% and at most 160% |
| **InformacionGlobal** | Ingreso, Egreso | Required **only** when `receiver.rfc === "XAXX010101000"` — omitted entirely, and not validated, for any other receiver. When required: `periodicity` must exist in `c_Periodicidad`, `months` must be a valid `c_Meses` code, and `year` must be a reasonable value. **Never applies to Pago**, regardless of the receiver. |

## Known Limitations

- Credit notes (Egreso) currently support a single related CFDI UUID.
- Some currency-related fields are fixed rather than fully dynamic.
- Discounts are not yet supported.
- PAC integration currently points to a test/sandbox stamping service — not a production PAC contract.
- No API key or authentication middleware yet — the API is open to any caller.
- Not yet deployed; runs locally only.

## Roadmap

- [x] PAC integration endpoint: receive a JSON payload, build the XML, submit it for stamping, and return the signed CFDI
- [ ] API key authentication middleware to restrict access to authorized clients
- [ ] Production deployment (Render)

## License

Academic project — Universidad Tecnológica de León (UTL) / SIDETEC.