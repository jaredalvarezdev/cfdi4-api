// ================================
// RELATED CFDI XML
// ================================
import { IRelatedCfdi } from '../../models/credit-note/credit-note.model';

// Genera el bloque de CFDI relacionados — solo aplica para Egreso (E)
export function buildRelatedCfdiXml(relatedCfdi: IRelatedCfdi): string {
    return `<cfdi:CfdiRelacionados TipoRelacion="${relatedCfdi.relationType}"><cfdi:CfdiRelacionado UUID="${relatedCfdi.uuid}"/></cfdi:CfdiRelacionados>`;
}