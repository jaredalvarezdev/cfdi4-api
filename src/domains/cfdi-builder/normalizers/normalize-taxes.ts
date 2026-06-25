// ================================
// NORMALIZE TAXES
// ================================
import { IConceptTax } from '../requests/invoice.request';

// Limpia y estandariza los impuestos de cada concepto
export function normalizeTaxes(taxes: IConceptTax[]): IConceptTax[] {
  return taxes.map((tax) => {

    let rate = tax.rate;

    // Si la tasa viene como entero (ej. 16), se convierte a decimal (0.16)
    if (tax.rate > 1) {
      rate = tax.rate / 100;
    }

    return {
      type: tax.type.trim().toUpperCase(),
      rate,
      withholding: tax.withholding,
    };
  });
}