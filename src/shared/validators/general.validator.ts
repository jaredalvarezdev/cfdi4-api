// ================================
// GENERAL VALIDATOR
// ================================
import { isValidPaymentForm } from '../catalogs/payment-forms.catalog';
import { isValidCurrency } from '../catalogs/currencies.catalog';
import { isValidPaymentMethod } from '../catalogs/payment-methods.catalog';
import { isValidTaxRegime } from '../catalogs/tax-regimes.catalog';
import { isValidCfdiUse } from '../catalogs/cfdi-uses.catalog';
import { IInvoiceRequest } from '../../domains/cfdi-builder/models/invoice/invoice.model';
import { ICreditNoteRequest } from '../../domains/cfdi-builder/models/credit-note/credit-note.model';
import { IPaymentRequest } from '../../domains/cfdi-builder/models/payment/payment.model';

// Formato de RFC válido según el SAT, incluyendo los genéricos para público en general y extranjero
const RFC_REGEX = /^([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}|XAXX010101000|XEXX010101000)$/;

export function validateDocumentType(payloadType: string | undefined,expectedType: 'I' | 'E' | 'P'): void {
  if (payloadType !== undefined && payloadType !== expectedType) {
    throw new Error(`El campo "type" ("${payloadType}") no coincide con la ruta usada. Se esperaba "type": "${expectedType}".`);
  }
}

export function validateGeneral(
  payload: IInvoiceRequest | ICreditNoteRequest | IPaymentRequest
): void {

  // ---- EMISOR ----
  if (!payload.issuer.rfc) {
    throw new Error('El RFC del emisor es requerido');
  }

  if (!RFC_REGEX.test(payload.issuer.rfc)) {
    throw new Error(`El RFC del emisor tiene un formato inválido: ${payload.issuer.rfc}`);
  }

  if (!payload.issuer.name) {
    throw new Error('El nombre del emisor es requerido');
  }

  if (!isValidTaxRegime(payload.issuer.taxRegime)) {
    throw new Error(`Régimen fiscal del emisor inválido: ${payload.issuer.taxRegime}`);
  }

  // ---- RECEPTOR ----
  if (!payload.receiver.rfc) {
    throw new Error('El RFC del receptor es requerido');
  }

  if (!RFC_REGEX.test(payload.receiver.rfc)) {
    throw new Error(`El RFC del receptor tiene un formato inválido: ${payload.receiver.rfc}`);
  }

  if (!payload.receiver.name) {
    throw new Error('El nombre del receptor es requerido');
  }

  // El régimen fiscal del receptor debe existir en el catálogo del SAT
  if (!isValidTaxRegime(payload.receiver.taxRegime)) {
    throw new Error(`Régimen fiscal del receptor inválido: ${payload.receiver.taxRegime}`);
  }

  // El código postal del receptor debe tener exactamente 5 dígitos
  if (!/^\d{5}$/.test(payload.receiver.zipCode)) {
    throw new Error(`Código postal del receptor inválido: ${payload.receiver.zipCode}`);
  }

  // ---- CÓDIGO POSTAL DE EXPEDICIÓN ----
  if (!/^\d{5}$/.test(payload.expeditionZipCode)) {
    throw new Error(`Código postal inválido: ${payload.expeditionZipCode}`);
  }

  // ---- USO DE CFDI ----
  // Aplica a los 3 tipos. Para Pago (P) el único valor válido es CP01,
  // ya lo fuerza normalizeReceiver, pero se valida aquí como respaldo.
  if (payload.type === 'P') {
    if (payload.receiver.cfdiUse !== 'CP01') {
      throw new Error(`Uso de CFDI inválido para Pago: ${payload.receiver.cfdiUse} (debe ser CP01)`);
    }
  } else if (!isValidCfdiUse(payload.receiver.cfdiUse)) {
    throw new Error(`Uso de CFDI inválido: ${payload.receiver.cfdiUse}`);
  }

  // ---- FORMA Y MÉTODO DE PAGO ----
  // Solo aplica a Ingreso (I) y Egreso (E), no a Pago (P)
  if (payload.type !== 'P') {

    if (!isValidPaymentForm(payload.paymentForm)) {
      throw new Error(`Forma de pago inválida: ${payload.paymentForm}`);
    }

    if (!isValidPaymentMethod(payload.paymentMethod)) {
      throw new Error(`Método de pago inválido: ${payload.paymentMethod}`);
    }

    if (!isValidCurrency(payload.currency)) {
      throw new Error(`Moneda inválida: ${payload.currency}`);
    }

    // ---- TIPO DE CAMBIO ----
    // Regla SAT (CFDI40115): TipoCambio es obligatorio y debe ser > 0 cuando
    // la moneda es distinta de MXN y XXX. Cuando la moneda ES MXN o XXX,
    // no debe enviarse (o, si se envía, debe ser exactamente 1).
    const isMxnOrXxx = payload.currency === 'MXN' || payload.currency === 'XXX';

    if (!isMxnOrXxx) {
      if (payload.exchangeRate === undefined || payload.exchangeRate === null || payload.exchangeRate <= 0) {
        throw new Error(`El campo exchangeRate es obligatorio y debe ser mayor a 0 cuando la moneda (${payload.currency}) es distinta de MXN.`);
      }
    } else if (payload.exchangeRate !== undefined && payload.exchangeRate !== null && payload.exchangeRate !== 1) {
      throw new Error(`El campo exchangeRate no debe enviarse (o debe ser 1) cuando la moneda es ${payload.currency}.`);
    }
  }
}