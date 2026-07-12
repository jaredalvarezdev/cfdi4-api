// ================================
// XML ESCAPE UTIL
// ================================

// Escapa caracteres especiales que romperían el XML
// si vienen en nombres, descripciones o razones sociales
export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}