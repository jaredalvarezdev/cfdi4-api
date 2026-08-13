import { sendWhatsappMessage } from '../../integrations/whatsapp/whatsapp-client';
import { askOpenAI } from '../../integrations/openai/openai-client';

const MENU_TEXT = `
👋 Hola, soy el asistente informativo de este sistema de facturación.

Elige una opción escribiendo el número, o escribe tu pregunta directamente:

1️⃣ ¿Qué es este sistema?
2️⃣ ¿Qué tipos de factura genera?
3️⃣ ¿Cómo funciona el proceso, en general?
`;

const FIXED_RESPONSES: Record<string, string> = {
  '1': 'Es un sistema que genera facturas electrónicas (CFDI) válidas ante el SAT, como las que recibe cualquier persona al comprar algo en México.',
  '2': 'Genera 3 tipos de comprobante: facturas normales (Ingreso), notas de crédito o devoluciones (Egreso), y comprobantes de pago (Pago).',
  '3': 'Alguien da los datos de la venta, el sistema arma la factura, la revisa, la envía a "timbrar" (el sello oficial del SAT), y entrega la factura lista para el cliente.',
};

function randomDelayMs(): number {
  return 3000 + Math.floor(Math.random() * 4000); // entre 3 y 7 segundos
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeMexicanNumber(rawNumber: string): string {
  // WhatsApp agrega un "1" extra después del "52" en números móviles de México
  // al recibir el mensaje, pero la API de envío lo espera sin ese dígito.
  if (rawNumber.startsWith('521') && rawNumber.length === 13) {
    return '52' + rawNumber.slice(3);
  }
  return rawNumber;
}

export async function handleIncomingMessage(fromNumber: string, text: string): Promise<void> {
  const trimmed = text.trim().toLowerCase();

  let replyText: string;

  const pideMenu = trimmed.includes('menu') || trimmed.includes('menú');

  if (pideMenu || trimmed === 'hola') {
    replyText = MENU_TEXT;
  } else if (FIXED_RESPONSES[trimmed]) {
    replyText = FIXED_RESPONSES[trimmed];
  } else {
    // Protegido con try/catch: si OpenAI falla (rate limit, timeout, etc.),
    // el bot responde con un mensaje amable en vez de crashear el proceso.
    try {
      replyText = await askOpenAI(trimmed);
    } catch (error) {
      console.error('Error al llamar a OpenAI:', error);
      replyText = 'Tuve un problema procesando tu pregunta, intenta de nuevo en un momento 🙏';
    }
  }

  const toNumber = normalizeMexicanNumber(fromNumber);

  await wait(randomDelayMs());
  await sendWhatsappMessage(toNumber, replyText);
}