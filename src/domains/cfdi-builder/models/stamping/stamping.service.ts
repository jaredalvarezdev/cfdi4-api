// ================================
// STAMPING SERVICE
// ================================
import { IStampingRequest } from './stamping.model';
import { IResponse } from '../../../../shared/models/response.model';
import { buildInvoiceServ } from '../invoice/invoice.service';
import { buildCreditNoteServ } from '../credit-note/credit-note.service';
import { buildPaymentServ } from '../payment/payment.service';
import { stampXml } from '../../../../integrations/pac/pac-client';
import { decodeStampedXml } from '../../../../integrations/pac/pac-decode';

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
    const generatedXml = buildResult.data as string;
    const pacResult = await stampXml(generatedXml);

    // 4. Si el PAC procesó la solicitud pero RECHAZÓ el timbrado, no es éxito
    if (!pacResult.timbradoOk || !pacResult.xmlTimbradoBase64) {
      return { ok: false, message: pacResult.pac?.message || 'El PAC rechazó el timbrado' };
    }

    // 5. Decodifica el XML timbrado — este campo queda separado, no mezclado con los metadatos
    const stampedXml = decodeStampedXml(pacResult.xmlTimbradoBase64);

    return {
      ok: true,
      data: {
        stampedXml,               // XML final, limpio, con Sello/Certificado/TimbreFiscalDigital ya llenos
        uuid: pacResult.uuid,
        stampedAt: pacResult.fechaTimbrado,
        pacCode: pacResult.pac.code,
        pacMessage: pacResult.pac.message
      }
    };

  } catch (error: any) {
    return { ok: false, message: error.message || 'Error al timbrar el CFDI' };
  }
}