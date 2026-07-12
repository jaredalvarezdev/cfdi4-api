// ================================
// ISSUER XML
// ================================
import { IIssuer } from '../../../../shared/models/shared-cfdi.model';
import { xmlEscape } from '../../../../shared/utils/xml-escape.util';

// Genera el tag del emisor — aplica a Ingreso, Egreso y Pago
export function buildIssuerXml(issuer: IIssuer): string {
    return `<cfdi:Emisor Rfc="${xmlEscape(issuer.rfc)}" Nombre="${xmlEscape(issuer.name)}" RegimenFiscal="${issuer.taxRegime}"/>`;
}