// ================================
// BUILD CFDI SERVICE
// ================================
import { IInvoiceRequest } from '../requests/invoice.request';
import { ICreditNoteRequest } from '../requests/credit-note.request';
import { IPaymentRequest } from '../requests/payment.request';
import { IResponse } from '../../../shared/models/response.model';

// Orquesta la construcción de un CFDI de Ingreso
export async function buildInvoiceServ(payload: IInvoiceRequest): Promise<IResponse> {
  try {
    // 1. NORMALIZAR
    // TODO: normalize(payload)

    // 2. VALIDAR
    // TODO: validate(payload)

    // 3. CONSTRUIR
    // TODO: buildInvoice(payload)

    // 4. GENERAR XML
    // TODO: generateXml(document)

    return { ok: true, data: '<cfdi:Comprobante/>' }; // placeholder hasta completar las fases
  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al construir el CFDI de Ingreso' };
  }
}

// Orquesta la construcción de un CFDI de Egreso
export async function buildCreditNoteServ(payload: ICreditNoteRequest): Promise<IResponse> {
  try {
    // 1. NORMALIZAR
    // TODO: normalize(payload)

    // 2. VALIDAR
    // TODO: validate(payload)

    // 3. CONSTRUIR
    // TODO: buildCreditNote(payload)

    // 4. GENERAR XML
    // TODO: generateXml(document)

    return { ok: true, data: '<cfdi:Comprobante/>' }; // placeholder hasta completar las fases
  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al construir el CFDI de Egreso' };
  }
}

// Orquesta la construcción de un CFDI de Pago
export async function buildPaymentServ(payload: IPaymentRequest): Promise<IResponse> {
  try {
    // 1. NORMALIZAR
    // TODO: normalize(payload)

    // 2. VALIDAR
    // TODO: validate(payload)

    // 3. CONSTRUIR
    // TODO: buildPayment(payload)

    // 4. GENERAR XML
    // TODO: generateXml(document)

    return { ok: true, data: '<cfdi:Comprobante/>' }; // placeholder hasta completar las fases
  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al construir el CFDI de Pago' };
  }
}