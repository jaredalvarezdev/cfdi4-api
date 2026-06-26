// ================================
// TAXES VALIDATOR
// ================================
import { IConceptTax } from '../requests/invoice.request';

const VALID_IVA_RATES = [0, 0.08, 0.16];        // Tasas válidas de IVA según el SAT
const VALID_ISR_RATES = [0.1, 0.1125];          // Tasas válidas de ISR según el SAT
const VALID_TAX_TYPES = ['IVA', 'ISR', 'IEPS']; // Tipos de impuesto válidos según el SAT

// Valida los impuestos de cada concepto antes de construir el XML
export function validateTaxes(taxes: IConceptTax[]): void {

    for (let taxIndex = 0; taxIndex < taxes.length; taxIndex++) {

        const tax = taxes[taxIndex];
        const taxNumber = taxIndex + 1;

        // El tipo de impuesto debe ser IVA, ISR o IEPS
        if (!VALID_TAX_TYPES.includes(tax.type)) {
            throw new Error(`El impuesto ${taxNumber} tiene un tipo inválido: ${tax.type}`);
        }

        // La tasa de IVA debe ser 0%, 8% o 16%
        if (tax.type === 'IVA' && !VALID_IVA_RATES.includes(tax.rate)) {
            throw new Error(`La tasa de IVA es inválida: ${tax.rate}`);
        }

        // La tasa de ISR debe ser 10% o 11.25%
        if (tax.type === 'ISR' && !VALID_ISR_RATES.includes(tax.rate)) {
            throw new Error(`La tasa de ISR es inválida: ${tax.rate}`);
        }

        // La tasa de IEPS debe estar entre 0% y 160%
        if (tax.type === 'IEPS' && (tax.rate <= 0 || tax.rate > 1.60)) {
            throw new Error(`La tasa de IEPS es inválida: ${tax.rate}`);
        }
    }
}