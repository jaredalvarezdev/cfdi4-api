import { IInvoiceRequest } from './invoice.model';
import { IResponse } from '../../../../shared/models/response.model';
import { normalizeIssuer } from '../../../../shared/normalizers/normalize-issuer';
import { normalizeReceiver } from '../../../../shared/normalizers/normalize-receiver';
import { normalizeConcepts } from '../../../../shared/normalizers/normalize-concepts';
import { normalizeTaxes } from '../../../../shared/normalizers/normalize-taxes';
import { validateDocumentType, validateGeneral } from '../../../../shared/validators/general.validator';
import { validateConcepts } from '../../../../shared/validators/concepts.validator';
import { validateTaxes } from '../../../../shared/validators/taxes.validator';
import { buildInvoice } from './invoice.builder';
import { generateInvoiceXml } from '../../xml/xml-generator';

export async function buildInvoiceServ(payload: IInvoiceRequest): Promise<IResponse> {
  try {
    validateDocumentType(payload.type, 'I');
    payload.type = 'I';

    payload.issuer = normalizeIssuer(payload.issuer);
    payload.receiver = normalizeReceiver(payload.receiver, 'I');
    payload.concepts = normalizeConcepts(payload.concepts);

    for (let conceptIndex = 0; conceptIndex < payload.concepts.length; conceptIndex++) {
      payload.concepts[conceptIndex].taxes = normalizeTaxes(payload.concepts[conceptIndex].taxes);
    }

    validateGeneral(payload);
    validateConcepts(payload.concepts);

    for (let conceptIndex = 0; conceptIndex < payload.concepts.length; conceptIndex++) {
      validateTaxes(payload.concepts[conceptIndex].taxes);
    }

    const document = buildInvoice(payload);
    const xml = generateInvoiceXml(payload, document.subtotal, document.total);

    return { ok: true, data: xml };
  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al construir el CFDI de Ingreso' };
  }
}