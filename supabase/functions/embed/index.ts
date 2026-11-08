// Edge Function: embed
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

export default {
  fetch: withSupabase({ auth: 'publishable' }, async (req, ctx) => {
    const { input } = await req.json()
    const [embedding] = await embed([input])
    // keep it in demo_queries, so we can search with it from SQL later
    await ctx.supabase.from('demo_queries').upsert({ q: input, embedding })
    return Response.json({ embedding })
  }),
}
