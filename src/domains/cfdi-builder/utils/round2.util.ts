// ================================
// ROUND2 UTIL
// ================================

// Redondea un número a 2 decimales
// El SAT exige que todos los montos tengan máximo 2 decimales
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}