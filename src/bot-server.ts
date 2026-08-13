import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import whatsappBotRoutes from './domains/whatsapp-bot/whatsapp-bot.routes';

const botApp = express();

botApp.use(express.json());
botApp.use('/whatsapp-bot', whatsappBotRoutes);

const PORT = process.env.BOT_PORT || 4000;

botApp.listen(PORT, () => {
  console.log(`Bot de WhatsApp corriendo en el puerto ${PORT}`);
});