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

  let taxRegime = receiver.taxRegime.trim();
  let cfdiUse = receiver.cfdiUse.trim();

  // Si el RFC es genérico, se asignan valores por defecto
  if (isGeneric) {
    taxRegime = '616';
    cfdiUse = 'S01';
  }

  return {
    rfc,
    name: receiver.name.trim().toUpperCase(),
    zipCode: receiver.zipCode.trim(),
    taxRegime,
    cfdiUse,
  };
}