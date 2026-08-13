const WHATSAPP_API_URL = `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export async function sendWhatsappMessage(toNumber: string, text: string): Promise<void> {
  const response = await fetch(WHATSAPP_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toNumber,
      type: 'text',
      text: { body: text },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Error al enviar mensaje de WhatsApp:', JSON.stringify(data));
  } else {
    console.log('WhatsApp respondió OK:', JSON.stringify(data));
  }
}