// ================================
// CATÁLOGO — MONEDAS
// ================================
// Fuente: c_Moneda del SAT (basado en ISO 4217)
// Nota: no se incluyen todas las monedas del mundo, solo las más comunes y relevantes para facturación en México

export const CURRENCIES: Record<string, string> = {
    'MXN': 'Peso Mexicano',
    'USD': 'Dólar Americano',
    'EUR': 'Euro',
    'CAD': 'Dólar Canadiense',
    'GBP': 'Libra Esterlina',
    'JPY': 'Yen Japonés',
};

// Verifica si una moneda es válida
export function isValidCurrency(code: string): boolean {
    return code in CURRENCIES;
}