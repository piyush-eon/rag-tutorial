# RAG Tutorial (starter)

The starter project for the RAG & vector databases video: a small React app with your documents on the left and a chat on the right.

The whole UI is here, styled with Tailwind. What's missing is the backend: everything the browser sends to it lives in [`src/api.ts`](src/api.ts), where each function is marked `TODO`. In the video (and the notes) we fill them in one by one; the components never change.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. Uploading and chatting show "not connected" errors until you fill in the TODOs.

## Sample documents

`demo-docs/northwind/` is a made-up company handbook (travel policy, IT helpdesk guide and more). The examples in the video and the notes use it: "cheap flights", "Can I book a business class flight?", "What does ERR_4021 mean?". `demo-docs/globex/` is a second company, used in the multi-tenant RLS extra.

## Where the code goes

All in `src/api.ts`:

- `TODO(06)`: `listDocuments` and `uploadDocument` (the `ingest` function)
- `TODO(08)`: `askQuestion` (the `chat` function)

The finished app is on the [`final`](../../tree/final) branch.
