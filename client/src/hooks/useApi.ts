export async function apiQuery(question: string, topK = 5) {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, topK })
  });
  if (!res.ok) throw new Error('Query failed');
  return res.json();
}

export async function apiIngest(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/ingest/pdf', {
    method: 'POST',
    body: fd
  });
  if (!res.ok) throw new Error('Ingest failed');
  return res.json();
}
