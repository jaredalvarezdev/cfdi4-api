// ================================
// PAC DECODE
// ================================

// Decodifica el XML timbrado que regresa el PAC en Base64,
// esto ya incluye Sello, Certificado y el nodo TimbreFiscalDigital
export function decodeStampedXml(xmlBase64: string): string {
  if (!xmlBase64) {
    throw new Error('No se recibió el XML timbrado en Base64.');
  }
  return Buffer.from(xmlBase64, 'base64').toString('utf-8');
}