// ================================
// NORMALIZE TAXES
// ================================
import { IConceptTax } from '../models/shared-cfdi.model';

// Limpia y estandariza los impuestos de cada concepto
export function normalizeTaxes(taxes: IConceptTax[]): IConceptTax[] {
  return taxes.map((tax) => {

    const type = tax.type.trim().toUpperCase();
    let rate = tax.rate;

    // Si la tasa viene como entero (ej. 16), se convierte a decimal (0.16)
    if (tax.rate > 1) {
      rate = tax.rate / 100;
    }

    return { 
      type, 
      rate, 
      withholding: tax.withholding 
    };
  });
}