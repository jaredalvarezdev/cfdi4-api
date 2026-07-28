// ================================
// TIMBRADO REQUEST
// ================================
import { IIssuer, IReceiver, IConcept } from '../../../../shared/models/shared-cfdi.model';

// Request principal — el emisor lo manda el cliente, igual que en invoice/credit-note/payment
export interface ITimbradoRequest {
  issuer: IIssuer;
  receiver: IReceiver;
  concepts: IConcept[];
  paymentForm: string;
  paymentMethod: string;
  currency: string;
  expeditionZipCode: string;
}
