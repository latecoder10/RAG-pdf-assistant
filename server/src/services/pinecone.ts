import { Pinecone } from '@pinecone-database/pinecone';

export function getPineconeIndex(indexName: string) {
  const pc = new Pinecone(); // reads PINECONE_API_KEY from env
  return pc.Index(indexName);
}
