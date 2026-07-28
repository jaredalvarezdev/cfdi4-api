// ================================
// TIMBRADO REQUEST
// ================================

// El timbrado soporta los 3 tipos de comprobante — el campo `type`
// de cada interfaz decide cuál builder/service se usa
import { IInvoiceRequest } from '../invoice/invoice.model';
import { ICreditNoteRequest } from '../credit-note/credit-note.model';
import { IPaymentRequest } from '../payment/payment.model';

export type ITimbradoRequest = IInvoiceRequest | ICreditNoteRequest | IPaymentRequest;
