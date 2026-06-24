// ================================
// PAYMENT BUILDER
// ================================
import { IPaymentRequest } from '../../requests/payment.request';
import { round2 } from '../../utils/round2.util';

// Construye un objeto de tipo IPaymentRequest a partir de los datos proporcionados en el payload
export function buildPayment(payload: IPaymentRequest) {

  // Suma el monto de todos los pagos del complemento
  const totalAmount = round2(
    payload.payments.reduce((sum, payment) => sum + payment.amount, 0)
  );

  return { ...payload, totalAmount };
}