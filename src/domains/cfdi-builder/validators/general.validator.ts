// ================================
// GENERAL VALIDATOR
// ================================
import { isValidPaymentForm } from '../catalogs/payment-forms.catalog';
import { isValidPaymentMethod } from '../catalogs/payment-methods.catalog';
import { isValidTaxRegime } from '../catalogs/tax-regimes.catalog';
import { isValidCfdiUse } from '../catalogs/cfdi-uses.catalog';
import { IInvoiceRequest } from '../requests/invoice.request';
import { ICreditNoteRequest } from '../requests/credit-note.request';
import { IPaymentRequest } from '../requests/payment.request';

// Valida los datos generales del CFDI antes de construir el XML
// Aplica a los 3 tipos: Ingreso, Egreso y Pago
export function validateGeneral(
  payload: IInvoiceRequest | ICreditNoteRequest | IPaymentRequest
): void {

  // ---- EMISOR ----

  // El RFC del emisor no puede estar vacío
  if (!payload.issuer.rfc) {
    throw new Error('El RFC del emisor es requerido');
  }

  // El nombre del emisor no puede estar vacío
  if (!payload.issuer.name) {
    throw new Error('El nombre del emisor es requerido');
  }

  // El régimen fiscal debe existir en el catálogo del SAT
  if (!isValidTaxRegime(payload.issuer.taxRegime)) {
    throw new Error(`Régimen fiscal del emisor inválido: ${payload.issuer.taxRegime}`);
  }

  // ---- RECEPTOR ----

  // El RFC del receptor no puede estar vacío
  if (!payload.receiver.rfc) {
    throw new Error('El RFC del receptor es requerido');
  }

  // El nombre del receptor no puede estar vacío
  if (!payload.receiver.name) {
    throw new Error('El nombre del receptor es requerido');
  }

  // ---- CÓDIGO POSTAL ----

  // El código postal de expedición debe tener exactamente 5 dígitos
  if (!/^\d{5}$/.test(payload.expeditionZipCode)) {
    throw new Error(`Código postal inválido: ${payload.expeditionZipCode}`);
  }

  // ---- FORMA Y MÉTODO DE PAGO ----
  // Solo aplica a Ingreso (I) y Egreso (E), no a Pago (P)

  if (payload.type !== 'P') {

    // La forma de pago debe existir en el catálogo del SAT
    if (!isValidPaymentForm(payload.paymentForm)) {
      throw new Error(`Forma de pago inválida: ${payload.paymentForm}`);
    }

    // El método de pago debe ser PUE o PPD
    if (!isValidPaymentMethod(payload.paymentMethod)) {
      throw new Error(`Método de pago inválido: ${payload.paymentMethod}`);
    }

    // El uso de CFDI debe existir en el catálogo del SAT
    if (!isValidCfdiUse(payload.receiver.cfdiUse)) {
      throw new Error(`Uso de CFDI inválido: ${payload.receiver.cfdiUse}`);
    }
  }
}