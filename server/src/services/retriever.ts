import { getEmbeddings } from './embeddings';
import { getPineconeIndex } from './pinecone';
import { env } from '../config/env';

export async function retrieveRelevantText(question: string, topK = 5) {
  const embeddings = getEmbeddings();
  const queryVector = await embeddings.embedQuery(question);
  const pineconeIndex = getPineconeIndex(env.PINECONE_INDEX_NAME);

  const results = await pineconeIndex.query({
    topK,
    vector: queryVector,
    includeMetadata: true,
  });

  const matches = (results.matches || []).map((m) => ({
    id: m.id || '',
    score: m.score || 0,
    text: (m.metadata as any)?.text || (m?.metadata as any)?.pageContent,
    metadata: m.metadata as any,
  }));

  const context = matches
    .map((m) => m.text)
    .filter(Boolean)
    .join('\n\n---\n\n');

  return { matches, context };
}
