// ================================
// DATE UTIL
// ================================
import { TIME_ZONE } from '../../config/environment';

// Devuelve la fecha y hora actual en formato ISO 8601
// con la zona horaria de México, como lo exige el SAT
// Ejemplo: 2024-01-15T10:30:00
export function localDate(): string {
  return new Date().toLocaleString('sv-SE', {
    timeZone: TIME_ZONE,
  }).replace(' ', 'T');
}