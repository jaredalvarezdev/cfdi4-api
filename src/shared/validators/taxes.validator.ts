// ================================
// TAXES VALIDATOR
// ================================
import { IConceptTax } from '../models/shared-cfdi.model';

const VALID_IVA_TRANSFER_RATES = [0, 0.08, 0.16];    // Tasas válidas de traslado de IVA según el SAT
const VALID_IVA_RETENTION_RATES = [0.04, 0.106667];  // Tasas válidas de retención de IVA según el SAT
const VALID_ISR_RATES = [0.1, 0.0125];               // Tasas válidas de ISR según el SAT: 10% (régimen general) y 1.25% (RESICO)
const VALID_TAX_TYPES = ['IVA', 'ISR', 'IEPS'];      // Tipos de impuesto válidos según el SAT

// Valida los impuestos de cada concepto antes de construir el XML
export function validateTaxes(taxes: IConceptTax[]): void {

    for (let taxIndex = 0; taxIndex < taxes.length; taxIndex++) {

        const tax = taxes[taxIndex];
        const taxNumber = taxIndex + 1;

        // El tipo de impuesto debe ser IVA, ISR o IEPS
        if (!VALID_TAX_TYPES.includes(tax.type)) {
            throw new Error(`El impuesto ${taxNumber} tiene un tipo inválido: ${tax.type}`);
        }

        // Una retención con tasa 0 no tiene sentido: el importe retenido quedaría en $0,
        // y el SAT rechaza un nodo Retencion con Importe="0"
        if (tax.withholding && tax.rate === 0) {
            throw new Error(`El impuesto ${taxNumber} es una retención con tasa 0%, lo cual es inválido`);
        }

        // La tasa de IVA depende de si es traslado o retención (son catálogos distintos del SAT)
        if (tax.type === 'IVA') {
            const validRates = tax.withholding ? VALID_IVA_RETENTION_RATES : VALID_IVA_TRANSFER_RATES;
            if (!validRates.includes(tax.rate)) {
                throw new Error(`La tasa de IVA ${tax.withholding ? 'de retención' : ''} es inválida: ${tax.rate}`);
            }
        }

        // La tasa de ISR debe ser 10% (régimen general) o 1.25% (RESICO)
        if (tax.type === 'ISR' && !VALID_ISR_RATES.includes(tax.rate)) {
            throw new Error(`La tasa de ISR es inválida: ${tax.rate}`);
        }

        // La tasa de IEPS debe estar entre 0% y 160%
        if (tax.type === 'IEPS' && (tax.rate <= 0 || tax.rate > 1.60)) {
            throw new Error(`La tasa de IEPS es inválida: ${tax.rate}`);
        }
    }
}