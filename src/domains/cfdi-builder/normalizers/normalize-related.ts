// ================================
// NORMALIZE RELATED CFDI
// ================================
import { IRelatedCfdi } from '../requests/credit-note.request';

// Limpia y estandariza los datos del CFDI relacionado
// antes de que pasen al validator
export function normalizeRelatedCfdi(relatedCfdi: IRelatedCfdi): IRelatedCfdi {
  return {
    uuid: relatedCfdi.uuid.trim().toUpperCase(),
    relationType: relatedCfdi.relationType.trim(),
  };
}