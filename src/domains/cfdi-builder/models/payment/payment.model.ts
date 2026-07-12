// ================================
// PAYMENT REQUEST
// ================================
import { IIssuer, IReceiver } from '../../../../shared/models/shared-cfdi.model';

// Documento relacionado al pago
export interface IRelatedDocument {
  uuid: string;              // UUID del CFDI que se está pagando
  paymentMethod: string;     // Método de pago — PPD
  installmentNumber: number; // Número de parcialidad
  previousBalance: number;   // Saldo anterior
  amountPaid: number;        // Importe pagado
  remainingBalance: number;  // Saldo restante después del pago
}

// Pago individual
export interface IPayment {
  paymentDate: string;                  // Fecha del pago — formato ISO 8601
  paymentForm: string;                  // Forma de pago — c_FormaPago
  currency: string;                     // Moneda — c_Moneda
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