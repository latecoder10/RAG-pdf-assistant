export type QueryRequest = {
  question: string;
  topK?: number;
};

export type QueryMatch = {
  id: string;
  score: number;
  text?: string;
  metadata?: Record<string, any>;
};

export type QueryResponse = {
  answer: string;
  matches: QueryMatch[];
};

export const DEFAULT_TOP_K = 5;
