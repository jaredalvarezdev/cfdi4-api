// ================================
// CONCEPTS VALIDATOR
// ================================
import { IConcept } from '../requests/invoice.request';

// Valida que los conceptos de la factura sean correctos
// antes de construir el XML
export function validateConcepts(concepts: IConcept[]): void {

    // Debe haber al menos un concepto en la factura
    if (concepts.length === 0) {
        throw new Error('La factura debe tener al menos un concepto');
    }

    // Recorre cada concepto y valida sus datos
    for (let i = 0; i < concepts.length; i++) {

        const concept = concepts[i];
        const numero = i + 1;

        // La cantidad debe ser mayor a 0
        if (concept.quantity <= 0) {
            throw new Error(`El concepto ${numero} tiene una cantidad inválida`);
        }

        // El valor unitario debe ser mayor a 0
        if (concept.unitPrice <= 0) {
            throw new Error(`El concepto ${numero} tiene un valor unitario inválido`);
        }

        // La clave del producto no puede estar vacía
        if (!concept.productKey) {
            throw new Error(`El concepto ${numero} no tiene clave de producto SAT`);
        }

        // La clave de unidad no puede estar vacía
        if (!concept.unitKey) {
            throw new Error(`El concepto ${numero} no tiene clave de unidad SAT`);
        }

        // La descripción no puede estar vacía
        if (!concept.description) {
            throw new Error(`El concepto ${numero} no tiene descripción`);
        }
    }
}