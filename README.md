# cfdi4-api

A REST API built with TypeScript, Node.js, and Express that transforms structured JSON payloads into SAT-compliant CFDI 4.0 XML documents. It supports the three main voucher types required by Mexico's tax authority (SAT): **Ingreso** (Income), **Egreso** (Credit Note), and **Pago** (Payment Complement 2.0).

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

`cfdi4-api` receives a structured JSON request describing an invoice, credit note, or payment complement, validates it against SAT catalogs and business rules, normalizes the input data, and generates a well-formed CFDI 4.0 XML document ready to be signed and stamped (*timbrado*) by an authorized certification provider (PAC).

The project follows a **domain-driven, layered architecture**, separating concerns between HTTP handling, business logic, XML generation, and shared validation/normalization utilities.

## Features

- Generates SAT-compliant CFDI 4.0 XML for:
  - **Ingreso (I)** — standard invoices
  - **Egreso (E)** — credit notes, with related-CFDI referencing
  - **Pago (P)** — Payment Complement 2.0
- Validates issuer and receiver data, including:
  - RFC format (including generic RFCs `XAXX010101000` / `XEXX010101000`)
  - Tax regime, payment form, payment method, CFDI use, and currency against official SAT catalogs
- Validates line-item concepts (product/unit keys, quantities, pricing, taxes)
- Validates tax rates for IVA, ISR, and IEPS against SAT-permitted values
- Normalizes and sanitizes incoming data before XML construction (issuer, receiver, concepts, taxes, related documents)
- Escapes special XML characters to prevent malformed output
- Centralized error handling middleware with consistent JSON error responses
- Automatic tax consolidation and subtotal/total calculation with proper 2-decimal rounding

## Tech Stack

| Layer            | Technology         |
|-------------------|---------------------|
| Runtime           | Node.js             |
| Language          | TypeScript          |
| Web framework     | Express 5           |
| Environment config| dotenv              |
| Dev tooling       | ts-node-dev         |

## Project Structure

```
src/
├── app.ts                         # Express app configuration (middlewares, routes)
├── server.ts                      # Entry point — starts the HTTP server
├── routes.ts                      # Top-level route mounting
├── config/
│   └── environment.ts             # PORT, TIME_ZONE, and other runtime config
├── domains/
│   └── cfdi-builder/
│       ├── cfdi-builder.routes.ts # POST /invoice, /credit-note, /payment
│       ├── models/
│       │   ├── invoice/           # Ingreso: model, controller, service, builder
│       │   ├── credit-note/       # Egreso: model, controller, service, builder, related-CFDI validator
│       │   └── payment/           # Pago: model, controller, service, builder, complement validator
│       └── xml/                   # XML fragment generators per CFDI section
│           ├── issuer/            # <cfdi:Emisor>
│           ├── receiver/          # <cfdi:Receptor>
│           ├── concepts/          # <cfdi:Conceptos>
│           ├── taxes/             # <cfdi:Impuestos>
│           ├── related-cfdi/      # <cfdi:CfdiRelacionados>
│           ├── payments20/        # Payment Complement 2.0
│           ├── voucher/           # Root <cfdi:Comprobante> element
│           └── xml-generator.ts   # Top-level XML assembly
├── middlewares/
│   ├── cors.middleware.ts         # CORS headers
│   └── error.middleware.ts        # Centralized error handling
└── shared/
    ├── catalogs/                  # SAT official catalogs (tax regimes, payment forms/methods, CFDI uses, currencies, tax types, relation types)
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
```

> `.env` is excluded from version control via `.gitignore`. Never commit real secrets or tokens to the repository.

## API Reference

All endpoints accept `application/json` and are mounted under `/api/cfdi-builder`.

### `POST /api/cfdi-builder/invoice`

Builds a CFDI of type **Ingreso (I)**.

**Response:** `200 OK` with `Content-Type: application/xml` — the generated CFDI XML. On validation failure, returns `400` with a JSON error body.

### `POST /api/cfdi-builder/credit-note`

Builds a CFDI of type **Egreso (E)**. Requires a `relatedCfdi` object (`uuid`, `relationType`) referencing the original invoice being credited.

### `POST /api/cfdi-builder/payment`

Builds a CFDI of type **Pago (P)** using Payment Complement 2.0, referencing one or more related documents and their corresponding payments.

## Architecture

Each CFDI type follows the same layered flow:

```
Controller → Service → Builder → XML Generator
```

- **Controller** — parses the HTTP request and returns the appropriate HTTP response.
- **Service** — orchestrates validation, normalization, and calculation of totals.
- **Builder** — computes derived financial fields (subtotal, tax amount, total) with proper rounding.
- **XML Generator** — assembles the final CFDI XML string from validated, normalized data, using SAT-compliant namespaces and schema references.

Shared logic (SAT catalogs, validators, normalizers, and utilities) lives under `src/shared/` and is reused across all three CFDI types to avoid duplication and keep business rules consistent.

## Validation Rules

- **RFC**: must match the SAT-issued format or one of the two generic RFCs for public/foreign receivers.
- **Tax regime**: issuer and receiver regimes must exist in the official SAT catalog.
- **Postal codes**: must be exactly 5 digits.
- **Payment form / method / CFDI use / currency**: validated against SAT catalogs (not required for Payment Complements, per SAT rules).
- **Concepts**: must include at least one item; quantity and unit price must be positive; product and unit keys must match SAT length requirements; taxes must be an array (empty if not applicable).
- **Tax rates**: IVA must be 0%, 8%, or 16%; ISR must be 10% or 11.25%; IEPS must be greater than 0% and at most 160%.

## Known Limitations

- Credit notes (Egreso) currently support a single related CFDI UUID.
- Some currency-related fields are fixed rather than fully dynamic.
- Discounts are not yet supported.
- No PAC (certification provider) integration yet — the API currently generates unsigned, unstamped XML only.

## Roadmap

- [ ] PAC integration endpoint: receive a JSON payload, build the XML, submit it for stamping, and return the signed CFDI
- [ ] API key authentication middleware to restrict access to authorized clients
- [ ] Production deployment (Render)

## License

Academic project — Universidad Tecnológica de León (UTL) / SIDETEC.