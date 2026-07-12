// ================================
// NORMALIZE ISSUER
// ================================
import { IIssuer } from '../models/shared-cfdi.model';

// Limpia y estandariza los datos del emisor
// antes de que pasen al validator
export function normalizeIssuer(issuer: IIssuer): IIssuer {
  return {
    rfc: issuer.rfc.trim().toUpperCase(),
    name: issuer.name.trim().toUpperCase(),
    taxRegime: issuer.taxRegime.trim(),
  };
}