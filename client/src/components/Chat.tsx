// client/src/components/Chat.tsx
import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { apiQuery } from '../hooks/useApi'

type Msg = { role: 'user' | 'bot'; text: string }

function Avatar({ role }: { role: 'user' | 'bot' }) {
  return (
    <div className="h-8 w-8 rounded-full flex items-center justify-center select-none
                    bg-white/10 text-[10px] border border-white/10">
      {role === 'bot' ? 'AI' : 'You'}
    </div>
  )
}

export default function Chat() {
  const [q, setQ] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [q])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' })
  }, [msgs, loading])

  async function ask() {
    const value = q.trim()
    if (!value) return
    setLastError(null)
    setMsgs((m) => [...m, { role: 'user', text: value }])
    setLoading(true)
    try {
      const res = await apiQuery(value, 5)
      setMsgs((m) => [...m, { role: 'bot', text: res?.answer ?? '(no answer)' }])
    } catch (e: any) {
      const msg = e?.message || 'Request failed'
      console.error(msg)
      setLastError(msg)
      setMsgs((m) => [...m, { role: 'bot', text: msg }])
    } finally {
      setQ('')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scrollable messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6 py-6 space-y-6 pb-28">
          {msgs.length === 0 && (
            <div className="pt-16 text-center text-white/40">
              <div className="text-2xl font-semibold mb-2">How can I help?</div>
              <div className="text-sm">Upload a PDF in the sidebar and ask anything about it.</div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={i} className="flex gap-3">
              <Avatar role={m.role} />
              <div
                className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 text-sm leading-6
                            ${m.role === 'bot'
                              ? 'bg-white/[0.04] border-white/10'
                              : 'bg-transparent border-white/10'}`}
              >
                <div
                  className="prose prose-invert max-w-none
                             prose-pre:bg-[#0a0b0f] prose-pre:border prose-pre:border-white/10
                             prose-pre:rounded-lg prose-pre:p-4 prose-code:text-[0.85em]
                             prose-p:leading-7 prose-li:marker:text-white/40"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <Avatar role="bot" />
              <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
                <span className="inline-block animate-pulse">Thinking…</span>
              </div>
            </div>
          )}

          {lastError && (
            <div className="text-xs text-red-300/90 bg-red-900/20 border border-red-500/30 rounded-md p-3">
              {lastError}
            </div>
          )}
        </div>
      </div>

      {/* Composer (separate row, no overlay/gradient) */}
      <div className="shrink-0 border-t border-white/10 bg-[#0f1016]">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6 py-3">
          <div className="rounded-2xl border border-white/10 bg-[#10121a] focus-within:ring-1 focus-within:ring-indigo-500">
            <div className="flex items-end gap-2 p-3">
              <textarea
                ref={taRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    ask()
                  }
                }}
                rows={1}
                placeholder="Message…"
                className="block w-full resize-none bg-transparent outline-none text-sm leading-6 placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={ask}
                disabled={!q.trim() || loading}
                className="shrink-0 h-9 px-4 rounded-lg text-sm font-medium
                           bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
                title="Send"
              >
                Send
              </button>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-white/40 text-center">
            AI may make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  )
}
