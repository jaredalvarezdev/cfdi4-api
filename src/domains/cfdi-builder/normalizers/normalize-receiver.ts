// ================================
// NORMALIZE RECEIVER
// ================================
import { IReceiver } from '../requests/invoice.request';

// Limpia y completa los datos del receptor
// Si el RFC es el genérico de público en general,
// completa automáticamente taxRegime y cfdiUse
export function normalizeReceiver(receiver: IReceiver): IReceiver {
  const rfc = receiver.rfc.trim().toUpperCase();

  // RFC genérico de público en general
  const isGeneric = rfc === 'XAXX010101000';

  return {
    rfc,
    name: receiver.name.trim().toUpperCase(),
    zipCode: receiver.zipCode.trim(),
    taxRegime: isGeneric ? '616' : receiver.taxRegime.trim(),
    cfdiUse: isGeneric ? 'S01' : receiver.cfdiUse.trim(),
  };
}