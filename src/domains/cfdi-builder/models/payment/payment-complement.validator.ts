// ================================
// PAYMENT COMPLEMENT VALIDATOR
// ================================
import { IPayment } from './payment.model';
import { round2 } from '../../../../shared/utils/round2.util';
import { isValidPaymentForm } from '../../../../shared/catalogs/payment-forms.catalog';
import { isValidCurrency } from '../../../../shared/catalogs/currencies.catalog';

// Formato de fecha ISO 8601 — ejemplo: 2024-01-15T10:30:00
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

// Valida los pagos del complemento — solo aplica para Pago (P)
export function validatePaymentComplement(payments: IPayment[]): void {

    if (payments.length === 0) {
        throw new Error('El complemento de pago debe tener al menos un pago');
    }

    for (let paymentIndex = 0; paymentIndex < payments.length; paymentIndex++) {

        const payment = payments[paymentIndex];
        const paymentNumber = paymentIndex + 1;

        if (!isValidPaymentForm(payment.paymentForm)) {
            throw new Error(`El pago ${paymentNumber} tiene una forma de pago inválida: ${payment.paymentForm}`);
        }

        if (!isValidCurrency(payment.currency)) {
            throw new Error(`El pago ${paymentNumber} tiene una moneda inválida: ${payment.currency}`);
        }

        if (payment.amount <= 0) {
            throw new Error(`El pago ${paymentNumber} tiene un monto inválido`);
        }

        if (!DATE_REGEX.test(payment.paymentDate)) {
            throw new Error(`El pago ${paymentNumber} tiene una fecha inválida: ${payment.paymentDate}`);
        }

        if (payment.relatedDocuments.length === 0) {
            throw new Error(`El pago ${paymentNumber} no tiene documentos relacionados`);
        }

        let totalAmountPaid = 0;

        for (let docIndex = 0; docIndex < payment.relatedDocuments.length; docIndex++) {

            const doc = payment.relatedDocuments[docIndex];
            const docNumber = docIndex + 1;

            // El método de pago del documento relacionado debe ser PPD (Pago en Parcialidades o Diferido)
            if (doc.paymentMethod !== 'PPD') {
                throw new Error(`El documento ${docNumber} del pago ${paymentNumber} debe tener método de pago PPD`);
            }

            if (!Number.isInteger(doc.installmentNumber) || doc.installmentNumber <= 0) {
                throw new Error(`El documento ${docNumber} del pago ${paymentNumber} tiene un número de parcialidad inválido`);
            }

            if (doc.previousBalance <= 0) {
                throw new Error(`El documento ${docNumber} del pago ${paymentNumber} tiene un saldo anterior inválido`);
            }

            if (doc.amountPaid <= 0) {
                throw new Error(`El documento ${docNumber} del pago ${paymentNumber} tiene un importe pagado inválido`);
            }

            if (doc.remainingBalance < 0) {
                throw new Error(`El documento ${docNumber} del pago ${paymentNumber} tiene un saldo negativo`);
            }

            const expectedBalance = round2(doc.previousBalance - doc.amountPaid);

            if (expectedBalance !== round2(doc.remainingBalance)) {
                throw new Error(`El documento ${docNumber} del pago ${paymentNumber} no cuadra: esperado ${expectedBalance}, recibido ${doc.remainingBalance}`);
            }

            totalAmountPaid = round2(totalAmountPaid + doc.amountPaid);
        }

        // Se usa round2 en ambos lados para evitar errores de precisión decimal
        if (round2(totalAmountPaid) !== round2(payment.amount)) {
            throw new Error(`El pago ${paymentNumber} no cuadra: la suma de importes pagados es ${totalAmountPaid} pero el monto del pago es ${payment.amount}`);
        }
    }
}