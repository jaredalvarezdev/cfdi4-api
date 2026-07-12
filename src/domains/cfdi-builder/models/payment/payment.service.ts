import { IPaymentRequest } from './payment.model';
import { IResponse } from '../../../../shared/models/response.model';
import { normalizeIssuer } from '../../../../shared/normalizers/normalize-issuer';
import { normalizeReceiver } from '../../../../shared/normalizers/normalize-receiver';
import { normalizePayments } from './normalize-payments';
import { validateDocumentType, validateGeneral } from '../../../../shared/validators/general.validator';
import { validatePaymentComplement } from './payment-complement.validator';
import { buildPayment } from './payment.builder';
import { generatePaymentXml } from '../../xml/xml-generator';

export async function buildPaymentServ(payload: IPaymentRequest): Promise<IResponse> {
  try {
    validateDocumentType(payload.type, 'P');
    payload.type = 'P';

    payload.issuer = normalizeIssuer(payload.issuer);
    payload.receiver = normalizeReceiver(payload.receiver, 'P');
    payload.payments = normalizePayments(payload.payments);

    validateGeneral(payload);
    validatePaymentComplement(payload.payments);

    const document = buildPayment(payload);
    const xml = generatePaymentXml(payload);

    return { ok: true, data: xml };
  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al construir el CFDI de Pago' };
  }
}