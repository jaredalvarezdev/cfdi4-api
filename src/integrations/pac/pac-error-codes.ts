// ================================
// PAC ERROR CODES
// ================================

export const PAC_ERROR_CODES: Record<number, string> = {
  0: 'Timbrado exitoso.',
  1: 'Usuario o contraseña incorrectos.',
  2: 'Contrato inválido o sin servicio de timbrado.',
  3: 'Parámetro inválido o faltante.',
  5: 'Servicio fuera de línea por mantenimiento.',
  7: 'Servicio de CancelaciónSAT no disponible.',
  20: 'El usuario no cuenta con un certificado default.',
  21: 'CFDI sin cancelar.',
  201: 'Comprobante cancelado exitosamente.',
  202: 'El comprobante ya fue cancelado previamente.',
  203: 'RFC del emisor no corresponde.',
  205: 'UUID no existe.',
  301: 'XML mal formado.',
  302: 'Sello mal formado o inválido.',
  303: 'Sello no corresponde al emisor.',
  304: 'Certificado revocado o caduco.',
  305: 'Fecha de emisión fuera de vigencia del CSD.',
  306: 'Certificado no es de tipo CSD.',
  307: 'CFDI ya contiene timbre previo.',
  308: 'Certificado no expedido por el SAT.',
  401: 'Fecha/hora de generación fuera de rango.',
  402: 'RFC del emisor no está en régimen de contribuyentes.',
  403: 'Fecha de emisión no posterior a 2012-01-01.',
  602: 'CFDI no existe.'
};

export function getPacMessage(code: number, fallbackMessage?: string): string {
  return (
    PAC_ERROR_CODES[code] ??
    fallbackMessage ??
    `Error desconocido del PAC. Código: ${code}`
  );
}
