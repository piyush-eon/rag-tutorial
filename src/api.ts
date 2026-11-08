import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)

export type Doc = { id: number; title: string; chunks: number }
export type Source = { title: string; content: string; similarity: number }
export type ChatReply = { answer: string; sources: Source[] }


export async function listDocuments(): Promise<Doc[]> {
  const { data } = await supabase.from('documents').select('id, title, document_chunks(count)').order('id')
  return (data ?? []).map((d) => ({ id: d.id, title: d.title, chunks: d.document_chunks[0]?.count ?? 0 }))
}

export async function uploadDocument(file: File): Promise<void> {
  const { error } = await supabase.functions.invoke('ingest', {
    body: { title: file.name, content: await file.text() },
  })
  if (error) throw error
}

export async function askQuestion(question: string): Promise<ChatReply> {
  const { data, error } = await supabase.functions.invoke<ChatReply>('chat', { body: { question } })
  if (error) throw error
  return data!
}
