import { ICreditNoteRequest } from './credit-note.model';
import { IResponse } from '../../../../shared/models/response.model';
import { normalizeIssuer } from '../../../../shared/normalizers/normalize-issuer';
import { normalizeReceiver } from '../../../../shared/normalizers/normalize-receiver';
import { normalizeConcepts } from '../../../../shared/normalizers/normalize-concepts';
import { normalizeTaxes } from '../../../../shared/normalizers/normalize-taxes';
import { normalizeRelatedCfdi } from '../../../../shared/normalizers/normalize-related';
import { validateDocumentType, validateGeneral } from '../../../../shared/validators/general.validator';
import { validateConcepts } from '../../../../shared/validators/concepts.validator';
import { validateTaxes } from '../../../../shared/validators/taxes.validator';
import { validateRelatedCfdi } from './related-cfdi.validator';
import { buildCreditNote } from './credit-note.builder';
import { generateCreditNoteXml } from '../../xml/xml-generator';

export async function buildCreditNoteServ(payload: ICreditNoteRequest): Promise<IResponse> {
  try {
    validateDocumentType(payload.type, 'E');
    payload.type = 'E';

    payload.issuer = normalizeIssuer(payload.issuer);
    payload.receiver = normalizeReceiver(payload.receiver, 'E');
    payload.concepts = normalizeConcepts(payload.concepts);
    payload.relatedCfdi = normalizeRelatedCfdi(payload.relatedCfdi);

    for (let conceptIndex = 0; conceptIndex < payload.concepts.length; conceptIndex++) {
      payload.concepts[conceptIndex].taxes = normalizeTaxes(payload.concepts[conceptIndex].taxes);
    }

    validateGeneral(payload);
    validateConcepts(payload.concepts);

    for (let conceptIndex = 0; conceptIndex < payload.concepts.length; conceptIndex++) {
      validateTaxes(payload.concepts[conceptIndex].taxes);
    }

    validateRelatedCfdi(payload.relatedCfdi);

    const document = buildCreditNote(payload);
    const xml = generateCreditNoteXml(payload, document.subtotal, document.total);

    return { ok: true, data: xml };
  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al construir el CFDI de Egreso' };
  }
}