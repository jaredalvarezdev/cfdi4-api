// ================================
// NORMALIZE RELATED CFDI
// ================================
import { IRelatedCfdi } from '../../domains/cfdi-builder/models/credit-note/credit-note.model';

// Limpia y estandariza los datos del CFDI relacionado
// antes de que pasen al validator
export function normalizeRelatedCfdi(relatedCfdi: IRelatedCfdi): IRelatedCfdi {
  return {
    uuid: relatedCfdi.uuid.trim().toUpperCase(),
    relationType: relatedCfdi.relationType.trim(),
  };
}