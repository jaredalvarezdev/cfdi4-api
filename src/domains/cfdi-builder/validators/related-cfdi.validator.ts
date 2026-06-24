// ================================
// RELATED CFDI VALIDATOR
// ================================
import { isValidRelationType } from '../catalogs/relation-types.catalog';
import { IRelatedCfdi } from '../requests/credit-note.request';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/; // Formato de UUID válido

export function validateRelatedCfdi(relatedCfdi: IRelatedCfdi): void { // Valida el CFDI relacionado — solo aplica para Egreso

    // El UUID no puede estar vacío
    if (!relatedCfdi.uuid) {
        throw new Error('El UUID del CFDI relacionado es requerido');
    }

    // El UUID debe tener el formato correcto
    if (!UUID_REGEX.test(relatedCfdi.uuid)) {
        throw new Error(`El UUID del CFDI relacionado es inválido: ${relatedCfdi.uuid}`);
    }

    // El tipo de relación debe existir en el catálogo del SAT
    if (!isValidRelationType(relatedCfdi.relationType)) {
        throw new Error(`El tipo de relación es inválido: ${relatedCfdi.relationType}`);
    }
}