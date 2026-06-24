// ================================
// NORMALIZE TAXES
// ================================
import { IConceptTax } from '../requests/invoice.request';

// Limpia y estandariza los impuestos de cada concepto
// Asegura que la tasa llegue en decimal al validator
// Ejemplo: si el usuario manda 16 lo convierte a 0.16
export function normalizeTaxes(taxes: IConceptTax[]): IConceptTax[] {
  return taxes.map((tax) => ({
    type: tax.type.trim().toUpperCase(),
    rate: tax.rate > 1 ? tax.rate / 100 : tax.rate,
    withholding: tax.withholding,
  }));
}