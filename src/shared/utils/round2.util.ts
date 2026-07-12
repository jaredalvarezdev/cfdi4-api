// ================================
// ROUND2 UTIL
// ================================

// Redondea un número a 2 decimales
// Los montos en un CFDI no pueden tener más de 2 decimales
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}