// Everything the browser sends to the backend lives in this file.
// In the video we connect each function to Supabase: look for TODO(06) and TODO(08).

export type Doc = { id: number; title: string; chunks: number }
export type Source = { title: string; content: string; similarity: number }
export type ChatReply = { answer: string; sources: Source[] }

// TODO(06): read the documents, with how many chunks each one has, from the `documents` table
export async function listDocuments(): Promise<Doc[]> {
  return []
}

// TODO(06): send the file's name and text to the `ingest` Edge Function
export async function uploadDocument(file: File): Promise<void> {
  throw new Error(`Can't upload ${file.name} yet: the app isn't connected to Supabase`)
}

// TODO(08): send the question to the `chat` Edge Function. It returns { answer, sources }.
export async function askQuestion(question: string): Promise<ChatReply> {
  throw new Error(`Can't answer "${question}" yet: the app isn't connected to Supabase`)
}
