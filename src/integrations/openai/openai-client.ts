import OpenAI from 'openai';
import { BUSINESS_CONTEXT } from './openai-context';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askOpenAI(userMessage: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: BUSINESS_CONTEXT },
      { role: 'user', content: userMessage },
    ],
  });

  return completion.choices[0]?.message?.content ?? 'No pude generar una respuesta en este momento.';
}