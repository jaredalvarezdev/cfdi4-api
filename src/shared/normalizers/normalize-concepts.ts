// ================================
// NORMALIZE CONCEPTS
// ================================
import { IConcept } from '../models/shared-cfdi.model';

// Limpia los conceptos de la factura. No asigna impuestos por defecto:
// un concepto sin impuestos (taxes: []) es válido y significa que no
// aplica ningún impuesto (ObjetoImp="01" en el XML).
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