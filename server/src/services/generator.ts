import { GoogleGenAI } from '@google/genai';

/**
 * Generate an answer using the retrieved context and the user question.
 * This mirrors your existing query.js approach but ensures the context is included.
 */
export async function generateAnswer(question: string, context: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const systemInstruction = `You are a helpful assistant specialized in answering questions strictly from the provided context.
If the answer is not present in the context, say: "I could not find the answer in the provided document."`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: `Context:\n${context}\n\nQuestion: ${question}` }],
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config: { systemInstruction },
  });

  // Some @google/genai responses surface text under response.text
  // Fallback to candidates if needed
  const text = (response as any)?.text ?? (response as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}
