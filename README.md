# RAG Tutorial (final)

The finished app from the RAG & vector databases video: upload your documents on the left, chat with them on the right, and get answers with citations. It runs on Supabase's free tier and Google's Gemini free tier.

Want to build it yourself? Start from the [`main`](../../tree/main) branch, the starter, and follow the video or the notes.

## What's in here

| Path | What it is |
|---|---|
| `src/` | The React app. Everything it sends to the backend is in `src/api.ts`. |
| `supabase/schema.sql` | Tables, grants, `match_chunks` and `hybrid_search`. |
| `supabase/functions/` | The `embed`, `ingest` and `chat` Edge Functions. |
| `demo-docs/` | Sample company handbooks to upload. |

## Run it

1. **Create a [free Supabase project](https://supabase.com/dashboard).**
2. **Database:** paste `supabase/schema.sql` into the SQL Editor and run it.
3. **Gemini key:** create a free key in [Google AI Studio](https://aistudio.google.com/apikey). In the dashboard, open **Edge Functions → Secrets** and add it as `GEMINI_API_KEY`.
4. **Functions:** for each of `embed`, `ingest` and `chat`, go to **Edge Functions → Deploy a new function → Via Editor**, use that name, paste the matching `supabase/functions/<name>/index.ts` and click **Deploy function**. Then, on the function's **Settings** tab, turn off **Verify JWT with legacy secret** and click **Save changes**.
5. **App:** copy `.env.example` to `.env.local` and fill in your project URL and publishable key (both under **Connect** in the dashboard). Then:

```bash
npm install
npm run dev
```

Open http://localhost:5173, upload the files in `demo-docs/northwind/`, and ask *"Can I book a business class flight?"* or *"What does ERR_4021 mean?"*.

Prefer the command line? The same functions deploy with the [Supabase CLI](https://supabase.com/docs/guides/functions/quickstart): `supabase functions deploy <name> --no-verify-jwt`.
