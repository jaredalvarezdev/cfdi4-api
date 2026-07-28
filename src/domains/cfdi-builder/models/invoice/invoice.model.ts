// ================================
// INVOICE REQUEST
// ================================
import { IIssuer, IReceiver, IConcept, IInformacionGlobal } from '../../../../shared/models/shared-cfdi.model';

// Request principal — Ingreso
export interface IInvoiceRequest {
  type: 'I';
  issuer: IIssuer;
  receiver: IReceiver;
  concepts: IConcept[];
  paymentForm: string;       // Forma de pago — c_FormaPago
  paymentMethod: string;     // Método de pago — PUE o PPD
  currency: string;          // Moneda — c_Moneda
  exchangeRate?: number;     // TipoCambio — obligatorio si currency !== 'MXN' (y != 'XXX')
  expeditionZipCode: string;
  globalInfo?: IInformacionGlobal; // Obligatorio solo si receiver.rfc === 'XAXX010101000'
}