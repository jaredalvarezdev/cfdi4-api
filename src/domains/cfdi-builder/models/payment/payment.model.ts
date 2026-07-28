// ================================
// PAYMENT REQUEST
// ================================
import { IIssuer, IReceiver } from '../../../../shared/models/shared-cfdi.model';

// Impuesto del documento relacionado — el mismo que llevaba el CFDI original que se está pagando
export interface IRelatedDocumentTax {
  type: string;         // IVA, ISR, IEPS
  rate: number;         // Tasa — ejemplo: 0.16
  withholding: boolean; // true = retención, false = traslado
}

// Documento relacionado al pago
export interface IRelatedDocument {
  uuid: string;              // UUID del CFDI que se está pagando
  paymentMethod: string;     // Método de pago — PPD
  installmentNumber: number; // Número de parcialidad
  previousBalance: number;   // Saldo anterior
  amountPaid: number;        // Importe pagado
  remainingBalance: number;  // Saldo restante después del pago
  taxes: IRelatedDocumentTax[]; // Impuestos del documento — [] si no tiene
}

// Pago individual
export interface IPayment {
  paymentDate: string;                  // Fecha del pago — formato ISO 8601
  paymentForm: string;                  // Forma de pago — c_FormaPago
  currency: string;                     // Moneda — c_Moneda
  exchangeRate?: number;                // TipoCambioP — obligatorio si currency !== 'MXN' (y != 'XXX')
  amount: number;                       // Monto del pago
  relatedDocuments: IRelatedDocument[]; // Documentos que cubre este pago
}

// Request principal — Pago
export interface IPaymentRequest {
  type: 'P';
  issuer: IIssuer;
  receiver: IReceiver;
  expeditionZipCode: string;
  payments: IPayment[];
}