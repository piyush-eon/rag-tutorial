import { Documents } from './components/Documents'
import { Chat } from './components/Chat'

export default function App() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="mx-auto max-w-5xl p-4">
        <h1 className="mb-4 text-xl font-bold">RAG Tutorial</h1>

        <main className="grid gap-4 md:grid-cols-3">
          <Documents />
          <div className="md:col-span-2">
            <Chat />
          </div>
        </main>
      </div>
    </div>
  )
}
