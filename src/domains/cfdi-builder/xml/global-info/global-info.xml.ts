// ================================
// GLOBAL INFO XML
// ================================
import { IInformacionGlobal } from '../../../../shared/models/shared-cfdi.model';

// Genera el nodo InformacionGlobal — solo aplica cuando el receptor es XAXX010101000
export function buildGlobalInfoXml(globalInfo: IInformacionGlobal): string {
  return `<cfdi:InformacionGlobal Periodicidad="${globalInfo.periodicity}" Meses="${globalInfo.months}" Año="${globalInfo.year}"/>`;
}
