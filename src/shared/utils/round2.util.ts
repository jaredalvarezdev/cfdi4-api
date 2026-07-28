// ================================
// ROUND2 UTIL
// ================================

// Redondea un número a 2 decimales
// Los montos en un CFDI no pueden tener más de 2 decimales
// Se usa notación exponencial en vez de Math.round(value * 100) / 100
// para evitar errores de redondeo por punto flotante (ej. 1.005 → 1.01)
export function round2(value: number): number {
  return Number(Math.round(Number(value + 'e2')) + 'e-2');
}