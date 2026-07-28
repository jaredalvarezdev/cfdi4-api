// ================================
// PAC CLIENT
// ================================
import { TESTER_API_USER, TESTER_API_TOKEN } from '../../config/environment';
import { ITimbradoXmlResponse } from './pac.types';

const PAC_URL = 'https://tester-stamp-1089629881551.us-central1.run.app/api/timbrado/xml';

// Manda el XML al PAC de pruebas y regresa la respuesta del timbrado
export async function stampXml(xml: string): Promise<ITimbradoXmlResponse> {

  if (!TESTER_API_USER || !TESTER_API_TOKEN) {
    throw new Error('Las variables TESTER_API_USER y TESTER_API_TOKEN son obligatorias.');
  }

  const response = await fetch(PAC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TESTER_API_TOKEN}`,
      'x-api-user': TESTER_API_USER
    },
    body: JSON.stringify({ xml })
  });

  const result = await response.json() as ITimbradoXmlResponse;

  if (!response.ok || !result.requestOk) {
    throw new Error(result.pac?.message || 'No fue posible procesar la solicitud de timbrado.');
  }

  return result;
}