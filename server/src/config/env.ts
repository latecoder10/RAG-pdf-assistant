import dotenv from 'dotenv'
dotenv.config()

export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || '',
  CHUNK_SIZE: Number(process.env.CHUNK_SIZE || 1000),
  CHUNK_OVERLAP: Number(process.env.CHUNK_OVERLAP || 200),
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || '',
};

export function assertEnv() {
  const missing = Object.entries(env)
    .filter(([k, v]) => typeof v === 'string' && !(v as string))
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
