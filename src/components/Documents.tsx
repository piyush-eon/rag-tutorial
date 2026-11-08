import { useEffect, useState, type ChangeEvent } from 'react'
import { listDocuments, uploadDocument, type Doc } from '../api'

export function Documents() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [status, setStatus] = useState('')

  async function refresh() {
    setDocs(await listDocuments())
  }

  useEffect(() => {
    refresh()
  }, [])

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    try {
      // one at a time, so we stay inside Gemini's free-tier rate limits
      for (const [i, file] of files.entries()) {
        setStatus(`Uploading ${i + 1} of ${files.length}: ${file.name}…`)
        await uploadDocument(file)
        await refresh()
      }
      setStatus('')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <section className="h-fit rounded-xl border bg-card p-4">
      <h2 className="mb-3 font-semibold">Documents</h2>
      <label className="block cursor-pointer rounded-lg border-2 border-dashed p-5 text-center text-muted hover:border-green-600">
        <input type="file" accept=".md,.txt" multiple onChange={onFiles} className="hidden" />
        Upload .md or .txt files
      </label>
      {status && <p className="mt-3 text-sm text-muted">{status}</p>}

      {docs.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No documents yet.</p>
      ) : (
        <ul className="mt-3 divide-y">
          {docs.map((d) => (
            <li key={d.id} className="flex justify-between gap-2 py-2">
              <span className="truncate">{d.title}</span>
              <span className="shrink-0 text-sm text-muted">
                {d.chunks} {d.chunks === 1 ? 'chunk' : 'chunks'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
