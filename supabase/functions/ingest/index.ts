// Edge Function: ingest
import { withSupabase } from 'npm:@supabase/server@1'
import { GoogleGenAI } from 'npm:@google/genai'

const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') })

// Turns texts into 768-number vectors. Many texts in one call = one API request,
// which matters on free-tier rate limits.
async function embed(texts: string[]): Promise<number[][]> {
  const res = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    // one { parts } per text: a plain list of strings gets merged into a single vector
    contents: texts.map((text) => ({ parts: [{ text }] })),
    config: { outputDimensionality: 768 },  // must match vector(768) in the table
  })
  return res.embeddings!.map((e) => e.values!)
}

function chunkMarkdown(text: string, maxLen = 1000, overlap = 150): string[] {
  // 1. split on headings, keeping the heading with its section
  const sections = text.split(/\n(?=#{1,3} )/)
  const chunks: string[] = []
  for (const section of sections) {
    // 2. long sections get cut into overlapping windows
    for (let start = 0; start < section.length; start += maxLen - overlap) {
      chunks.push(section.slice(start, start + maxLen).trim())
      if (start + maxLen >= section.length) break
    }
  }
  return chunks.filter((c) => c.length > 0)
}

export default {
  // ctx.supabase is a database client that runs as the caller (here: anon)
  fetch: withSupabase({ auth: 'publishable' }, async (req, ctx) => {
    const { title, content } = await req.json()

    const { data: doc, error } = await ctx.supabase
      .from('documents').insert({ title }).select().single()
    if (error) return Response.json({ error }, { status: 400 })

    const chunks = chunkMarkdown(content)
    const embeddings = await embed(chunks)  // one batched API call for the whole document
    const rows = chunks.map((chunk, i) => ({
      document_id: doc.id, chunk_index: i, content: chunk, embedding: embeddings[i],
    }))
    const { error: chunkError } = await ctx.supabase.from('document_chunks').insert(rows)
    if (chunkError) return Response.json({ error: chunkError }, { status: 400 })

    return Response.json({ document_id: doc.id, chunks: rows.length })
  }),
}
