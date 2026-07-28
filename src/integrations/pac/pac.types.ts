// ================================
// PAC TYPES
// ================================

export interface IPacResponse {
  code: number;
  message: string;
}

export interface ITimbradoXmlRequest {
  xml: string;
}

export interface ITimbradoXmlResponse {
  requestOk: boolean;
  timbradoOk: boolean;
  pac: IPacResponse;
  uuid?: string;
  fechaTimbrado?: string;
  xmlTimbradoBase64?: string;
  rawPacResponse?: string;
}
