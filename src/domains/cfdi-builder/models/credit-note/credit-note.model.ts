// ================================
// CREDIT NOTE REQUEST
// ================================
import { IIssuer, IReceiver, IConcept, IInformacionGlobal } from '../../../../shared/models/shared-cfdi.model';

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
  exchangeRate?: number;     // TipoCambio — obligatorio si currency !== 'MXN' (y != 'XXX')
  expeditionZipCode: string;
  relatedCfdi: IRelatedCfdi; // CFDI relacionado — obligatorio en Egreso
  globalInfo?: IInformacionGlobal; // Obligatorio solo si receiver.rfc === 'XAXX010101000'
}