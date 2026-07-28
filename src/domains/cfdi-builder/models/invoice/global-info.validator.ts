// ================================
// GLOBAL INFO VALIDATOR
// ================================
import { isValidPeriodicity } from '../../../../shared/catalogs/periodicity.catalog';
import { IInformacionGlobal } from '../../../../shared/models/shared-cfdi.model';

// c_Meses del SAT: 01-12 meses normales, 13-17 bimestres, 18 = todo el ejercicio
const VALID_MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18'];

// Valida el nodo InformacionGlobal — obligatorio cuando el receptor es XAXX010101000
export function validateGlobalInfo(globalInfo: IInformacionGlobal | undefined): void {

  if (!globalInfo) {
    throw new Error('El nodo InformacionGlobal es obligatorio cuando el receptor es XAXX010101000');
  }

  if (!isValidPeriodicity(globalInfo.periodicity)) {
    throw new Error(`Periodicidad inválida: ${globalInfo.periodicity}`);
  }

  if (!VALID_MONTHS.includes(globalInfo.months)) {
    throw new Error(`Meses inválido: ${globalInfo.months}`);
  }

  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(globalInfo.year) || globalInfo.year < 2022 || globalInfo.year > currentYear) {
    throw new Error(`Año inválido: ${globalInfo.year}`);
  }
}
