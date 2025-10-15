# Express + React RAG (Vite, Tailwind v4, LangChain, Gemini, Pinecone)

A minimal but production‑minded **Retrieval‑Augmented Generation** app.

- **Client**: React 18 + Vite 6 + Tailwind **v4** (ChatGPT‑style UI, Markdown rendering)
- **Server**: Express + TypeScript (multer uploads, clean controllers/services/middlewares)
- **RAG**: PDF ingestion → chunking → embeddings → Pinecone → retrieval → Gemini LLM
- **Sessions** (optional): each chat gets its own Pinecone **namespace**; “New chat” can wipe previous vectors

---

## Features

- Upload a **PDF**, auto‑chunk and index to **Pinecone**
- Ask questions; server retrieves top‑K chunks and asks **Gemini** for an answer
- ChatGPT‑like interface (dark, sidebar, sticky composer, Markdown via `react-markdown` + `remark-gfm`)
- Optional **ephemeral** mode: reset vectors on refresh or “New chat” using per‑session namespaces

---

## Tech Stack

**Frontend**
- React 18
- Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite`)
- `react-markdown`, `remark-gfm`

**Backend**
- Node 20+ / 22
- Express + TypeScript
- Multer (file uploads)
- LangChain
- Pinecone (serverless, cosine metric, 768 dims – match your embedding model)
- Google Gemini (AI Studio API key)

**Tooling**
- Yarn classic workspaces (monorepo)

---

## Repository Layout

```
.
├─ client/                       # @app/client (React)
│  ├─ index.html
│  ├─ vite.config.ts
│  ├─ tailwind.config.ts
│  ├─ src/
│  │  ├─ pages/                 # App shell etc.
│  │  ├─ components/            # Chat, Uploader
│  │  ├─ hooks/                 # API wrappers
│  │  ├─ index.css              # Tailwind entry + layers
│  │  └─ main.tsx               # imports ./index.css
│  └─ package.json
│
├─ server/                       # @app/server (Express)
│  ├─ src/
│  │  ├─ index.ts               # app.listen
│  │  ├─ app.ts                 # express app + middleware
│  │  ├─ routes/
│  │  │  ├─ api.ts              # /api routes (ingest, query)
│  │  │  └─ session.ts          # optional: create/reset session ids
│  │  ├─ controllers/
│  │  │  ├─ ingestController.ts # parse pdf -> chunks -> embed -> upsert
│  │  │  └─ queryController.ts  # embed query -> similarity -> LLM answer
│  │  ├─ middlewares/
│  │  │  ├─ error.ts            # centralized error handler
│  │  │  └─ session.ts          # require x-session-id, attach to req
│  │  ├─ services/
│  │  │  ├─ embeddings.ts       # embed text via Gemini
│  │  │  ├─ pdf.ts              # extract text from PDFs
│  │  │  └─ vectorstore.ts      # Pinecone helpers (upsert/query/delete)
│  │  ├─ config/
│  │  │  ├─ env.ts              # dotenv + required env checks
│  │  │  └─ pinecone.ts         # pinecone client init
│  │  └─ utils/
│  ├─ uploads/                  # runtime file storage (gitignored)
│  ├─ .env.example              # server env sample
│  └─ package.json
│
├─ package.json                 # workspaces root
└─ yarn.lock
```

> **Why this structure?** Thin controllers, fat services. All external systems (env, pinecone, llm) live under **config/services**. `uploads/` is disposable and **never committed**.

---

## Prerequisites

- **Node**: 20.19+ (or 22.x)
- **Yarn**: 1.22.x (classic)
- **Pinecone**: serverless index (cosine, dim **768**)
- **Gemini** API key (Google AI Studio)

Windows tip: when docs say `rimraf`, use `rmdir /s /q path` if `rimraf` isn’t installed.

---

## Setup & Quick Start

1) **Install deps**
```bash
yarn install
```

2) **Server environment** – create `server/.env` (copy from `.env.example`):
```
# server/.env
PORT=4000

# Gemini
GEMINI_API_KEY=YOUR_KEY

# Pinecone
PINECONE_API_KEY=YOUR_KEY
PINECONE_INDEX_NAME=samplevectordb
PINECONE_ENVIRONMENT=us-east-1-gcp   # your region, e.g. us-east-1-gcp

# RAG tuning
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

3) **Run dev servers (two terminals)**
```bash
# Terminal A
yarn workspace @app/server dev

# Terminal B
yarn workspace @app/client dev
```

4) Open **http://localhost:5173**. Upload a PDF (left sidebar), click **Ingest PDF**, then ask questions.

---

## Tailwind v4 Notes

- We use **`@tailwindcss/vite`**. Do **not** keep a `postcss.config.js`.  
- Ensure `client/src/index.css` is imported in `src/main.tsx`.  
- Valid `tailwind.config.ts` patterns (either is fine):

```ts
// Option A – helper (needs v4 typings)
import { defineConfig } from 'tailwindcss/helpers'
export default defineConfig({ content: ['./index.html','./src/**/*.{ts,tsx}'], theme: { extend: {} } })
```

```ts
// Option B – simplest, works everywhere
import type { Config } from 'tailwindcss'
export default { content: ['./index.html','./src/**/*.{ts,tsx}'], theme: { extend: {} } } satisfies Config
```

- If Vite complains about `@tailwindcss/postcss`, you still have a `postcss.config.js` → remove it.
- To clear Vite cache (Windows): `rmdir /s /q client\\node_modules\\.vite`

---

## Ephemeral Sessions (Clean Slate per Chat / Refresh)

**Goal**: A refresh or “New chat” wipes previous vectors.

**How**

- Client stores a `rag_session` id in `localStorage` and sends it via header:
  ```
  x-session-id: <uuid>
  ```
- Server uses **Pinecone namespaces** = `sessionId`.
- On **New chat / refresh**, server **deletes the old namespace** and issues a new one.

**Endpoints (optional helper routes)**

- `POST /api/session/new` → `{ sessionId }`
- `POST /api/session/reset` with `{ sessionId }` → deletes namespace, returns fresh `{ sessionId }`

> If your SDK lacks `deleteAll`, use the variant your Pinecone SDK provides (e.g., `deleteMany({ deleteAll: true, namespace })`).

---

## API

Base: `http://localhost:4000/api`

### `POST /ingest/pdf`
Upload and index a PDF for the current session.

- **Headers**: `x-session-id: <uuid>`
- **Body**: `multipart/form-data` with field **file**
- **Response**:
```json
{ "ok": true, "info": { "pages": 12, "chunks": 148 } }
```

### `POST /query`
Ask a question about the current session’s documents.

- **Headers**: `x-session-id: <uuid>`
- **Body**:
```json
{ "q": "when is the policy effective?", "topK": 5 }
```
- **Response**:
```json
{
  "answer": "…",
  "matches": [
    { "id": "file_chunk_001", "score": 0.79, "metadata": { "docId": "file.pdf", "page": 2 } }
  ]
}
```

### `GET /health`
Simple health check → `{ "ok": true }`

---

## RAG Pipeline (Server)

1. **Upload** via Multer → file saved to `server/uploads/`
2. **PDF extract** → text + page numbers
3. **Chunk** → `CHUNK_SIZE` / `CHUNK_OVERLAP`
4. **Embed** chunks with **Gemini** → 768‑dim vectors
5. **Upsert** to Pinecone under `namespace = x-session-id`
6. **Query**: embed question → similarity search (`topK`) → compose answer with retrieved context

---

## Troubleshooting

- **Proxy error `ECONNRESET`** from Vite  
  Start the server: `yarn workspace @app/server dev` (PORT=4000).  
  Client proxy in `vite.config.ts` should include:
  ```ts
  server: { proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } } }
  ```

- **Missing env vars (on /api/query)**  
  Ensure `server/.env` exists (no quotes around values). Make sure `dotenv.config()` runs at the top of `server/src/config/env.ts`.

- **ENOENT for uploads**  
  Ensure `uploads/` exists or create it programmatically:
  ```ts
  fs.mkdirSync(path.join(process.cwd(), 'uploads'), { recursive: true })
  ```

- **Multer type mismatch**  
  Install aligned types: `yarn workspace @app/server add -D @types/express @types/multer @types/cors @types/morgan`  
  or cast the middleware: `upload.single('file') as any`.

- **Tailwind “unknown utility class”**  
  You’re mixing configs. Use the Vite plugin, remove `postcss.config.js`, and ensure `tailwind.config.ts` is valid (see Tailwind v4 notes).

- **Blank screen after Send**  
  Harden client fetch: parse text then JSON; render errors in the chat (this repo does that).

---

## Scripts

At repo root:

```bash
# Start dev servers
yarn workspace @app/server dev
yarn workspace @app/client dev

# Build client
yarn workspace @app/client build
yarn workspace @app/client preview

# Clean client dist
yarn workspace @app/client clean
```

---

## Standard Folder Guidance (grow the app)

**Client**
```
src/
  components/       # Chat, Message, Uploader, UI primitives
  pages/            # App shells
  hooks/            # useApi(), useSession(), etc.
  lib/              # utilities, markdown config
  styles/           # optional – if you split index.css
  types/            # shared TS types for client
```

**Server**
```
src/
  config/           # env, pinecone, gemini/langchain init
  middlewares/      # error, session, auth
  routes/           # api.ts, session.ts
  controllers/      # thin handlers
  services/         # embeddings, pdf, vectorstore (thick logic)
  utils/            # pure helpers
```

---

## Security & Privacy

- `uploads/` is local and should be treated as **ephemeral**.
- Avoid logging PII or full document text in prod.
- Namespace‑per‑session prevents cross‑chat leakage; add auth before internet exposure.
- Rate‑limit ingest/query if deploying publicly.

---

## Roadmap (suggested)

- ✅ Ephemeral namespaces (per chat)
- 🔒 Auth (JWT) + per‑user namespaces
- 📎 Multi‑file ingestion
- 📑 Show retrieved chunks + page numbers under answers
- ♻️ Streaming responses
- 🧪 Tests (unit + e2e) after API stabilizes
- 🐳 Docker + CI/CD

---

## License

MIT (or your org’s standard).

---

## Credits

Vite, Tailwind CSS, Pinecone, Google AI (Gemini), LangChain.

---

## Support

If you hit an issue, capture:
- **Server logs** (stack)
- **Client console** error
- **Exact request** (without secrets)

Map to Troubleshooting above or adjust env/config accordingly.
