// ================================
// PAYMENT COMPLEMENT VALIDATOR
// ================================
import { IPayment } from '../requests/payment.request';
import { round2 } from '../utils/round2.util';

// Valida los pagos del complemento — solo aplica para Pago (P)
export function validatePaymentComplement(payments: IPayment[]): void {

    // Debe haber al menos un pago
    if (payments.length === 0) {
        throw new Error('El complemento de pago debe tener al menos un pago');
    }

    for (let paymentIndex = 0; paymentIndex < payments.length; paymentIndex++) {

        const payment = payments[paymentIndex];
        const paymentNumber = paymentIndex + 1;

        // El monto del pago debe ser mayor a 0
        if (payment.amount <= 0) {
            throw new Error(`El pago ${paymentNumber} tiene un monto inválido`);
        }

        // Debe haber al menos un documento relacionado por pago
        if (payment.relatedDocuments.length === 0) {
            throw new Error(`El pago ${paymentNumber} no tiene documentos relacionados`);
        }

        for (let docIndex = 0; docIndex < payment.relatedDocuments.length; docIndex++) {

            const doc = payment.relatedDocuments[docIndex];
            const docNumber = docIndex + 1;

            // El saldo anterior debe ser mayor a 0
            if (doc.previousBalance <= 0) {
                throw new Error(`El documento ${docNumber} del pago ${paymentNumber} tiene un saldo anterior inválido`);
            }

            // El importe pagado debe ser mayor a 0
            if (doc.amountPaid <= 0) {
                throw new Error(`El documento ${docNumber} del pago ${paymentNumber} tiene un importe pagado inválido`);
            }

            // El saldo no puede ser negativo
            if (doc.remainingBalance < 0) {
                throw new Error(`El documento ${docNumber} del pago ${paymentNumber} tiene un saldo negativo`);
            }

            // Se usa round2 en ambos lados para evitar errores de precisión decimal en TypeScript
            const expected = round2(doc.previousBalance - doc.amountPaid);

            if (expected !== round2(doc.remainingBalance)) {
                throw new Error(
                    `El documento ${docNumber} del pago ${paymentNumber} no cuadra: esperado ${expected}, recibido ${doc.remainingBalance}`
                );
            }
        }
    }
}