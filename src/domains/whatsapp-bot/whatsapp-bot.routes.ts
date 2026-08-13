import { Router } from 'express';
import { verifyWebhook, receiveMessage } from './whatsapp-bot.controller';

const router = Router();

router.get('/webhook', verifyWebhook);
router.post('/webhook', receiveMessage);

export default router;