// Edge Function: chat
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

const SYSTEM_PROMPT = `You answer questions about the user's documents.
Use ONLY the numbered context below. Cite sources inline like [1] or [2].
If the answer is not in the context, say "I don't know based on your documents." Never guess.`

export default {
  fetch: withSupabase({ auth: 'publishable' }, async (req, ctx) => {
    const { question } = await req.json()

    // 1. RETRIEVE — embed the question, find the closest chunks
    const [query_embedding] = await embed([question])
    const { data: chunks } = await ctx.supabase.rpc('hybrid_search', {
      query_text: question, query_embedding, match_count: 5,
    })

    // 2. AUGMENT — number the chunks so the model can cite them
    const context = (chunks ?? [])
      .map((c, i) => `[${i + 1}] (${c.title})\n${c.content}`)
      .join('\n\n')

    // 3. GENERATE
    const interaction = await ai.interactions.create({
      model: 'gemini-3.5-flash-lite',
      system_instruction: SYSTEM_PROMPT,
      generation_config: { max_output_tokens: 1024 },
      input: `Context:\n${context}\n\nQuestion: ${question}`,
    })
    const answer = interaction.output_text

    return Response.json({ answer, sources: chunks })
  }),
}
