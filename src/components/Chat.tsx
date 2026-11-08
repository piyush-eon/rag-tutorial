import { useState, type FormEvent } from 'react'
import { askQuestion, type ChatReply } from '../api'

type Message = { role: 'user'; text: string } | { role: 'bot'; reply: ChatReply } | { role: 'error'; text: string }

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(e: FormEvent) {
    e.preventDefault()
    const q = question.trim()
    if (!q || busy) return
    setQuestion('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setBusy(true)
    try {
      const reply = await askQuestion(q)
      setMessages((m) => [...m, { role: 'bot', reply }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'error', text: err instanceof Error ? err.message : String(err) }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <h2 className="font-semibold">Chat</h2>
      <div className="flex min-h-80 flex-col gap-2">
        {messages.length === 0 && <p className="text-sm text-muted">Ask something about your documents.</p>}
        {messages.map((m, i) =>
          m.role === 'bot' ? (
            <Answer key={i} reply={m.reply} />
          ) : m.role === 'user' ? (
            <p key={i} className="max-w-[90%] self-end rounded-xl bg-green-600 px-3 py-2 text-white">
              {m.text}
            </p>
          ) : (
            <p key={i} className="text-sm text-red-600">
              {m.text}
            </p>
          ),
        )}
        {busy && <p className="text-sm text-muted">Thinking…</p>}
      </div>
      <form className="flex gap-2" onSubmit={send}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Can I book a business class flight?"
          className="flex-1 rounded-lg border bg-soft px-3 py-2"
        />
        <button type="submit" disabled={busy} className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50">
          Send
        </button>
      </form>
    </section>
  )
}

// Turns "[1]" markers in the answer into chips; clicking one shows that source.
function Answer({ reply }: { reply: ChatReply }) {
  const [open, setOpen] = useState<number | null>(null)
  const parts = reply.answer.split(/(\[\d+\])/)
  const source = open === null ? null : reply.sources[open - 1]

  return (
    <div className="max-w-[90%] self-start rounded-xl border bg-soft px-3 py-2">
      <p>
        {parts.map((part, i) => {
          const n = part.match(/^\[(\d+)\]$/)?.[1]
          if (!n || !reply.sources[Number(n) - 1]) return part
          const active = open === Number(n)
          return (
            <button
              key={i}
              onClick={() => setOpen(active ? null : Number(n))}
              className={`mx-0.5 rounded-full px-2 text-xs ${active ? 'bg-green-600 text-white' : 'bg-chip text-chip-ink'}`}
            >
              {n}
            </button>
          )
        })}
      </p>
      {source && (
        <blockquote className="mt-2 border-l-4 border-green-600 pl-3 text-sm">
          <strong>
            [{open}] {source.title}
          </strong>
          <p className="mt-1 whitespace-pre-wrap text-muted">{source.content}</p>
        </blockquote>
      )}
    </div>
  )
}
