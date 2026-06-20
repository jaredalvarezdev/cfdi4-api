// ================================
// CREDIT NOTE REQUEST
// ================================
import { IIssuer, IReceiver, IConcept } from './invoice.request';

// CFDI relacionado — obligatorio en Egreso
export interface IRelatedCfdi {
  uuid: string;         // UUID del CFDI que se relaciona
  relationType: string; // Tipo de relación — c_TipoRelacion
}

// Request principal — Egreso
export interface ICreditNoteRequest {
  type: 'E';
  issuer: IIssuer;
  receiver: IReceiver;
  concepts: IConcept[];
  paymentForm: string;       // Forma de pago — c_FormaPago
  paymentMethod: string;     // Método de pago — PUE o PPD
  currency: string;          // Moneda — c_Moneda
  expeditionZipCode: string;
  relatedCfdi: IRelatedCfdi; // CFDI relacionado — obligatorio en Egreso
}