import React from 'react'
import Uploader from '../components/Uploader'
import Chat from '../components/Chat'

export default function App() {
  return (
    <div className="h-screen w-screen bg-[#0b0c10] text-gray-200 flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#0f1016]">
        <div className="p-3">
          <button className="w-full rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition px-3 py-2 text-sm">
            + New chat
          </button>
        </div>

        <div className="px-3 pt-3 pb-2 text-[11px] uppercase tracking-wide text-white/40">
          Tools
        </div>
        <div className="px-3 pb-3">
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/60 mb-2">Index a PDF</div>
            <Uploader />
          </div>
        </div>

        <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-white/40">
          History
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 text-sm text-white/50">
          <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
            (empty)
          </div>
        </div>

        <div className="p-3 text-[11px] text-white/40 border-t border-white/10">
          Express + React RAG • v0.1
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* TOP BAR */}
        <header className="h-12 shrink-0 border-b border-white/10 bg-[#0f1016] flex items-center justify-center">
          <div className="text-sm font-medium tracking-tight">New chat</div>
        </header>

        {/* CHAT */}
        <Chat />
      </main>
    </div>
  )
}
