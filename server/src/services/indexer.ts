import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PineconeStore } from '@langchain/pinecone';
import type { Document } from '@langchain/core/documents';
import { getEmbeddings } from './embeddings';
import { getPineconeIndex } from './pinecone';
import { env } from '../config/env';

export async function ingestPdf(filePath: string) {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: env.CHUNK_SIZE,
    chunkOverlap: env.CHUNK_OVERLAP,
  });

  const chunks = await splitter.splitDocuments(docs);

  const embeddings = getEmbeddings();
  const pineconeIndex = getPineconeIndex(env.PINECONE_INDEX_NAME);

  await PineconeStore.fromDocuments(chunks as unknown as Document[], embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  return { pages: docs.length, chunks: chunks.length };
}
