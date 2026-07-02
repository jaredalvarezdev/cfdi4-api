// ================================
// NORMALIZE CONCEPTS
// ================================
import { IConcept } from '../requests/invoice.request';

// Limpia y completa los conceptos de la factura
// Si un concepto no trae impuestos, se asigna IVA 16% por defecto
export function normalizeConcepts(concepts: IConcept[]): IConcept[] {

    return concepts.map((concept) => {
        
        return {
            productKey: concept.productKey.trim(),
            unitKey: concept.unitKey.trim().toUpperCase(),
            description: concept.description.trim(),
            unitPrice: concept.unitPrice,
            quantity: concept.quantity,
            taxes: concept.taxes,
        };
    });
}