// ================================
// CATÁLOGO — PERIODICIDAD
// ================================
// Fuente: c_Periodicidad del SAT
// Solo aplica al nodo InformacionGlobal (facturación a público en general)

export const PERIODICITY_TYPES: Record<string, string> = {
  '01': 'Diario',
  '02': 'Semanal',
  '03': 'Quincenal',
  '04': 'Mensual',
  '05': 'Bimestral',
};

// Verifica si una periodicidad es válida
export function isValidPeriodicity(code: string): boolean {
  return code in PERIODICITY_TYPES;
}
