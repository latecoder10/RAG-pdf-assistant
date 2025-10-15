import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export function getEmbeddings() {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });
}
