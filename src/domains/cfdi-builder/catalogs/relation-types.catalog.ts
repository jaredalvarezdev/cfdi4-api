// ================================
// CATÁLOGO — TIPOS DE RELACIÓN
// ================================
// Fuente: c_TipoRelacion del SAT
// Solo aplica para CFDI de Egreso (nota de crédito)

export const RELATION_TYPES: Record<string, string> = {
  '01': 'Nota de crédito de los documentos relacionados',
  '02': 'Nota de débito de los documentos relacionados',
  '03': 'Devolución de mercancía sobre facturas o traslados previos',
  '04': 'Sustitución de los CFDI previos',
  '05': 'Traslados de mercancias facturados previamente',
  '06': 'Factura generada por los traslados previos',
  '07': 'CFDI por aplicación de anticipos',
};

// Verifica si un tipo de relación es válido
export function isValidRelationType(code: string): boolean {
  return code in RELATION_TYPES;
}