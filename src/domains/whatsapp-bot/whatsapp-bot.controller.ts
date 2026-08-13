import { Request, Response } from 'express';
import { handleIncomingMessage } from './whatsapp-bot.service';

export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('GET /webhook - verificación recibida', { mode, token });

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }

  res.sendStatus(403);
}

export async function receiveMessage(req: Request, res: Response): Promise<void> {
  console.log('POST /webhook - payload recibido:', JSON.stringify(req.body));

  const entry = req.body?.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (!message) {
    console.log('POST /webhook - sin mensaje en el payload');
    res.sendStatus(200);
    return;
  }

  const fromNumber = message.from;
  const text = message.text?.body ?? '';

  console.log('Mensaje recibido de:', fromNumber, 'texto:', text);

  res.sendStatus(200);

  if (text) {
    try {
      await handleIncomingMessage(fromNumber, text);
      console.log('Respuesta enviada correctamente');
    } catch (err) {
      console.error('Error al procesar el mensaje:', err);
    }
  }
}