// ================================
// RELATED CFDI VALIDATOR
// ================================

import { isValidRelationType } from '../catalogs/relation-types.catalog';
import { IRelatedCfdi } from '../requests/credit-note.request';

const UUID_REGEX =/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Valida los datos del CFDI relacionado
export function validateRelatedCfdi(relatedCfdi: IRelatedCfdi): void {

    if (!relatedCfdi) {
        throw new Error('El CFDI relacionado es requerido para Egreso');
    }

    if (!relatedCfdi.uuid) {
        throw new Error('El UUID del CFDI relacionado es requerido');
    }

    // El UUID debe cumplir con el formato estándar
    if (!UUID_REGEX.test(relatedCfdi.uuid)) {
        throw new Error(`El UUID del CFDI relacionado es inválido: ${relatedCfdi.uuid}`);
    }

    // El tipo de relación debe existir en el catálogo SAT
    if (!isValidRelationType(relatedCfdi.relationType)) {
        throw new Error(`El tipo de relación es inválido: ${relatedCfdi.relationType}`);
    }
}