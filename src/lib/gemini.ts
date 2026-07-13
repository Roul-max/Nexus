import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { env } from '@/lib/env';

const systemInstruction = {
  role: 'system',
  parts: [{ text: 'You are Nexus AI, a concise professional enterprise SaaS assistant.' }],
};

const getGenAI = () => {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
};

export async function getChatResponse(messages: Content[]) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction,
  });

  const chat = model.startChat({
    history: messages.slice(0, -1), // All but the last message
  });

  const result = await chat.sendMessage(messages[messages.length - 1].parts);
  return result.response.text();
}