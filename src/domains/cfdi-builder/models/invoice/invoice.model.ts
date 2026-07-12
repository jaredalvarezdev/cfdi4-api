// ================================
// INVOICE REQUEST
// ================================
import { IIssuer, IReceiver, IConcept } from '../../../../shared/models/shared-cfdi.model';

// Request principal — Ingreso
export interface IInvoiceRequest {
  type: 'I';
  issuer: IIssuer;
  receiver: IReceiver;
  concepts: IConcept[];
  paymentForm: string;       // Forma de pago — c_FormaPago
  paymentMethod: string;     // Método de pago — PUE o PPD
  currency: string;          // Moneda — c_Moneda
  expeditionZipCode: string;
}
