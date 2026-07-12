// ================================
// CATÁLOGO — MÉTODOS DE PAGO
// ================================
// Fuente: c_MetodoPago del SAT

export const PAYMENT_METHODS: Record<string, string> = {
  'PUE': 'Pago en una sola exhibición',
  'PPD': 'Pago en parcialidades o diferido',
};

// Verifica si un método de pago es válido
export function isValidPaymentMethod(code: string): boolean {
  return code in PAYMENT_METHODS;
}