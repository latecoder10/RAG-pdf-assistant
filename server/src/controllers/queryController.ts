import type { Request, Response } from 'express';
import { z } from 'zod';
import { retrieveRelevantText } from '../services/retriever';
import { generateAnswer } from '../services/generator';
import { assertEnv } from '../config/env';

const querySchema = z.object({
  question: z.string().min(1),
  topK: z.number().int().positive().max(20).optional(),
});

export async function query(req: Request, res: Response) {
  assertEnv();
  const parse = querySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  const { question, topK } = parse.data;
  const { matches, context } = await retrieveRelevantText(question, topK || 5);
  const answer = await generateAnswer(question, context);
  res.json({ answer, matches });
}
