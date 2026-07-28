// ================================
// SHARED CFDI MODELS
// Interfaces reutilizadas por los 3 tipos de comprobante (ingreso, egreso, pago)
// ================================

// Emisor del CFDI
export interface IIssuer {
  rfc: string;
  name: string;
  taxRegime: string; // Régimen fiscal — c_RegimenFiscal
}

// Receptor del CFDI
export interface IReceiver {
  rfc: string;
  name: string;
  zipCode: string;      // Código postal del receptor
  taxRegime: string;    // Régimen fiscal — c_RegimenFiscal
  cfdiUse: string;      // Uso del CFDI — c_UsoCFDI
}

// Impuesto por concepto
export interface IConceptTax {
  type: string;         // IVA, ISR, IEPS
  rate: number;         // Tasa — ejemplo: 0.16
  withholding: boolean; // true = retención, false = traslado
}

// Concepto de la factura
export interface IConcept {
  productKey: string;   // Clave SAT — c_ClaveProdServ
  unitKey: string;      // Clave unidad SAT — c_ClaveUnidad
  description: string;  // Descripción
  unitPrice: number;    // Valor unitario
  quantity: number;     // Cantidad
  taxes: IConceptTax[];
}

// Información global — obligatoria cuando el receptor es XAXX010101000 (público en general)
export interface IInformacionGlobal {
  periodicity: string; // c_Periodicidad
  months: string;       // c_Meses
  year: number;         // Año fiscal
}
