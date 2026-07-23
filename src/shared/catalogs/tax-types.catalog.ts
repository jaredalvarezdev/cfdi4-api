// ================================
// TAX TYPES CATALOG (c_Impuesto)
// ================================

// El atributo "Impuesto" del XML CFDI exige el código del catálogo
// c_Impuesto del SAT, no el nombre del impuesto.
const TAX_TYPE_TO_SAT_CODE: Record<string, string> = {
  ISR: '001',
  IVA: '002',
  IEPS: '003',
};

export function getSatTaxCode(type: string): string {
  const code = TAX_TYPE_TO_SAT_CODE[type];

  if (!code) {
    throw new Error(`Tipo de impuesto sin código SAT definido: ${type}`);
  }

  return code;
}