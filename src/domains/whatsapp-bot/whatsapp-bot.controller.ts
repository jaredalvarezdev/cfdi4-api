import { Request, Response } from 'express';
import { handleIncomingMessage } from './whatsapp-bot.service';

export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }

  res.sendStatus(403);
}

export async function receiveMessage(req: Request, res: Response): Promise<void> {
  const entry = req.body?.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (!message) {
    res.sendStatus(200);
    return;
  }

  const fromNumber = message.from;
  const text = message.text?.body ?? '';

  res.sendStatus(200); // responder rápido a Meta, procesar después

  if (text) {
    await handleIncomingMessage(fromNumber, text);
  }
}