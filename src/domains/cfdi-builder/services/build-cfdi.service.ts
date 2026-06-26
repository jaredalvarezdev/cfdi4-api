// ================================
// BUILD CFDI SERVICE
// ================================
import { IInvoiceRequest } from '../requests/invoice.request';
import { ICreditNoteRequest } from '../requests/credit-note.request';
import { IPaymentRequest } from '../requests/payment.request';
import { IResponse } from '../../../shared/models/response.model';
import { normalizeIssuer } from '../normalizers/normalize-issuer';
import { normalizeReceiver } from '../normalizers/normalize-receiver';
import { normalizeConcepts } from '../normalizers/normalize-concepts';
import { normalizePayments } from '../normalizers/normalize-payments';
import { normalizeTaxes } from '../normalizers/normalize-taxes';
import { normalizeRelatedCfdi } from '../normalizers/normalize-related';
import { validateGeneral } from '../validators/general.validator';
import { validateConcepts } from '../validators/concepts.validator';
import { validateTaxes } from '../validators/taxes.validator';
import { validateRelatedCfdi } from '../validators/related-cfdi.validator';
import { validatePaymentComplement } from '../validators/payment-complement.validator';
import { buildInvoice } from '../builders/invoice/invoice.builder';
import { buildCreditNote } from '../builders/credit-note/credit-note.builder';
import { buildPayment } from '../builders/payment/payment.builder';
import { generateInvoiceXml, generateCreditNoteXml, generatePaymentXml } from '../xml/xml-generator';

// Orquesta la construcción de un CFDI de Ingreso
export async function buildInvoiceServ(payload: IInvoiceRequest): Promise<IResponse> {
  try {
    // 1. NORMALIZAR
    payload.issuer = normalizeIssuer(payload.issuer);
    payload.receiver = normalizeReceiver(payload.receiver);
    payload.concepts = normalizeConcepts(payload.concepts);

    for (let conceptIndex = 0; conceptIndex < payload.concepts.length; conceptIndex++) {
      payload.concepts[conceptIndex].taxes = normalizeTaxes(payload.concepts[conceptIndex].taxes);
    }

    // 2. VALIDAR
    validateGeneral(payload);
    validateConcepts(payload.concepts);

    for (let conceptIndex = 0; conceptIndex < payload.concepts.length; conceptIndex++) {
      validateTaxes(payload.concepts[conceptIndex].taxes);
    }

    // 3. CONSTRUIR
    const document = buildInvoice(payload);

    // 4. GENERAR XML
    const xml = generateInvoiceXml(payload, document.subtotal, document.total);

    return { ok: true, data: xml };
  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al construir el CFDI de Ingreso' };
  }
}

// Orquesta la construcción de un CFDI de Egreso
export async function buildCreditNoteServ(payload: ICreditNoteRequest): Promise<IResponse> {
  try {
    // 1. NORMALIZAR
    payload.issuer = normalizeIssuer(payload.issuer);
    payload.receiver = normalizeReceiver(payload.receiver);
    payload.concepts = normalizeConcepts(payload.concepts);
    payload.relatedCfdi = normalizeRelatedCfdi(payload.relatedCfdi);

    for (let conceptIndex = 0; conceptIndex < payload.concepts.length; conceptIndex++) {
      payload.concepts[conceptIndex].taxes = normalizeTaxes(payload.concepts[conceptIndex].taxes);
    }

    // 2. VALIDAR
    validateGeneral(payload);
    validateConcepts(payload.concepts);

    for (let conceptIndex = 0; conceptIndex < payload.concepts.length; conceptIndex++) {
      validateTaxes(payload.concepts[conceptIndex].taxes);
    }

    validateRelatedCfdi(payload.relatedCfdi);

    // 3. CONSTRUIR
    const document = buildCreditNote(payload);

    // 4. GENERAR XML
    const xml = generateCreditNoteXml(payload, document.subtotal, document.total);

    return { ok: true, data: xml };
  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al construir el CFDI de Egreso' };
  }
}

// Orquesta la construcción de un CFDI de Pago
export async function buildPaymentServ(payload: IPaymentRequest): Promise<IResponse> {
  try {
    // 1. NORMALIZAR
    payload.issuer = normalizeIssuer(payload.issuer);
    payload.receiver = normalizeReceiver(payload.receiver);
    payload.payments = normalizePayments(payload.payments);

    // 2. VALIDAR
    validateGeneral(payload);
    validatePaymentComplement(payload.payments);

    // 3. CONSTRUIR
    const document = buildPayment(payload);

    // 4. GENERAR XML
    const xml = generatePaymentXml(payload);

    return { ok: true, data: xml };
  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al construir el CFDI de Pago' };
  }
}