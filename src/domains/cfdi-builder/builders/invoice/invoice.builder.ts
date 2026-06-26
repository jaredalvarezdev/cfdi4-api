// ================================
// INVOICE BUILDER
// ================================
import { IInvoiceRequest } from '../../requests/invoice.request';
import { round2 } from '../../utils/round2.util';

export function buildInvoice(payload: IInvoiceRequest) {

    // Subtotal — suma de unitPrice × quantity de cada concepto
    const subtotal = round2(
        payload.concepts.reduce((sum, concept) => {
            return sum + round2(concept.unitPrice * concept.quantity);
        }, 0)
    );

    // Impuestos trasladados — suma de impuestos de cada concepto (sin retenciones)
    const taxAmount = round2(
        payload.concepts.reduce((sum, concept) => {
            const base = round2(concept.unitPrice * concept.quantity);
            const conceptTaxes = concept.taxes
                .filter((tax) => !tax.withholding)
                .reduce((taxSum, tax) => taxSum + round2(base * tax.rate), 0);
            return sum + round2(conceptTaxes);
        }, 0)
    );

    // Total — subtotal + impuestos trasladados
    const total = round2(subtotal + taxAmount);

    return { ...payload, subtotal, taxAmount, total };
}