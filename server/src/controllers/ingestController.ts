import type { Request, Response } from 'express';
import { ingestPdf } from '../services/indexer';
import { assertEnv } from '../config/env';

export async function ingest(req: Request, res: Response) {
  assertEnv();
  if (!req.file) {
    return res.status(400).json({ error: 'Missing file' });
  }
  const info = await ingestPdf(req.file.path);
  res.json({ ok: true, info });
}
