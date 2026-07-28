// ================================
// NORMALIZE PAYMENTS
// ================================
import { IPayment } from './payment.model';

// Limpia y estandariza los pagos del complemento
// Solo aplica para CFDI de tipo Pago (P)
export function normalizePayments(payments: IPayment[]): IPayment[] {

    return payments.map((payment) => ({
        paymentDate: payment.paymentDate.trim(),
        paymentForm: payment.paymentForm.trim().toUpperCase(),
        currency: payment.currency.trim().toUpperCase(),
        exchangeRate: payment.exchangeRate,
        amount: payment.amount,
        relatedDocuments: payment.relatedDocuments.map((doc) => ({
            uuid: doc.uuid.trim().toUpperCase(),
            paymentMethod: doc.paymentMethod.trim().toUpperCase(),
            installmentNumber: doc.installmentNumber,
            previousBalance: doc.previousBalance,
            amountPaid: doc.amountPaid,
            remainingBalance: doc.remainingBalance,
            taxes: (doc.taxes || []).map((tax) => ({
                type: tax.type.trim().toUpperCase(),
                rate: tax.rate > 1 ? tax.rate / 100 : tax.rate,
                withholding: tax.withholding,
            })),
        })),
    }));
}