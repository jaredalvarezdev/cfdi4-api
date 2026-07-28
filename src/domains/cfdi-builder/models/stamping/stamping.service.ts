// ================================
// STAMPING SERVICE
// ================================
import { IStampingRequest } from './stamping.model';
import { IResponse } from '../../../../shared/models/response.model';
import { buildInvoiceServ } from '../invoice/invoice.service';
import { buildCreditNoteServ } from '../credit-note/credit-note.service';
import { buildPaymentServ } from '../payment/payment.service';
import { stampXml } from '../../../../integrations/pac/pac-client';

export async function buildStampingServ(payload: IStampingRequest): Promise<IResponse> {

  // 1. Construye el XML reusando el service correspondiente al tipo
  let buildResult: IResponse;

  switch (payload.type) {
    case 'I':
      buildResult = await buildInvoiceServ(payload);
      break;
    case 'E':
      buildResult = await buildCreditNoteServ(payload);
      break;
    case 'P':
      buildResult = await buildPaymentServ(payload);
      break;
    default:
      return { ok: false, message: 'Tipo de comprobante no soportado' };
  }

  // 2. Si la construcción del XML falló, no se manda nada al PAC
  if (!buildResult.ok || !buildResult.data) {
    return buildResult;
  }

  // 3. Manda el XML construido al PAC de pruebas
  try {
    const xml = buildResult.data as string;
    const pacResult = await stampXml(xml);
    return { ok: true, data: pacResult };

  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al timbrar el CFDI' };
  }
}