import React, { useState } from 'react'
import { apiIngest } from '../hooks/useApi'

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null)
  const [msg, setMsg] = useState<string>('')
  const [busy, setBusy] = useState(false)

  const onUpload = async () => {
    if (!file || busy) return
    setBusy(true)
    setMsg('Indexing…')
    try {
      const res = await apiIngest(file)
      setMsg(`Indexed ✓ pages=${res.info.pages}, chunks=${res.info.chunks}`)
    } catch (e: any) {
      setMsg(e.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="sr-only">Choose PDF</span>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs text-white/70
                     file:mr-3 file:rounded-md file:border file:border-white/10
                     file:bg-white/10 file:px-3 file:py-2 file:text-xs
                     hover:file:bg-white/15"
        />
      </label>
      <button
        onClick={onUpload}
        disabled={!file || busy}
        className="w-full h-9 rounded-md text-sm font-medium
                   bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {busy ? 'Indexing…' : 'Ingest PDF'}
      </button>
      <div className="text-[11px] text-white/50 min-h-[14px]">{msg}</div>
    </div>
  )
}
