// ================================
// CONCEPTS VALIDATOR
// ================================
import { IConcept } from '../models/shared-cfdi.model';

// Valida que los conceptos de la factura sean correctos
// antes de construir el XML
export function validateConcepts(concepts: IConcept[]): void {

    if (concepts.length === 0) {
        throw new Error('La factura debe tener al menos un concepto');
    }

    for (let conceptIndex = 0; conceptIndex < concepts.length; conceptIndex++) {

        const concept = concepts[conceptIndex];
        const conceptNumber = conceptIndex + 1;

        if (concept.quantity <= 0) {
            throw new Error(`El concepto ${conceptNumber} tiene una cantidad inválida`);
        }

        if (concept.unitPrice <= 0) {
            throw new Error(`El concepto ${conceptNumber} tiene un valor unitario inválido`);
        }

        // Las claves del catálogo c_ClaveProdServ del SAT tienen exactamente 8 dígitos
        if (concept.productKey.length !== 8) {
            throw new Error(`El concepto ${conceptNumber} tiene una clave de producto inválida: ${concept.productKey}`);
        }

        // Las claves del catálogo c_ClaveUnidad del SAT tienen entre 2 y 3 caracteres
        if (concept.unitKey.length < 2 || concept.unitKey.length > 3) {
            throw new Error(`El concepto ${conceptNumber} tiene una clave de unidad inválida: ${concept.unitKey}`);
        }

        if (!concept.description) {
            throw new Error(`El concepto ${conceptNumber} no tiene descripción`);
        }

        // Valida que el campo taxes sea un arreglo, aunque esté vacío
        if (!Array.isArray(concept.taxes)) {
            throw new Error(`El concepto ${conceptNumber} debe incluir "taxes" como arreglo (usa [] si no aplica impuesto)`);
        }
    }
}