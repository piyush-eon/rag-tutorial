// try.js: call our Edge Functions from Node, without the app.
// Run it from the starter folder: node --env-file=.env.local try.js embed "budget airfare"
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)

// Calls an Edge Function by name, at <project URL>/functions/v1/<name>
async function call(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body })
  // error.context is the HTTP response; a 401 usually means "Verify JWT" is still on
  if (error) throw new Error(`${name} failed: ${error.context?.status ?? error.message}`)
  return data
}

const [command, arg] = process.argv.slice(2)

// text → 768 numbers
if (command === 'embed') {
  const { embedding } = await call('embed', { input: arg })
  console.log(`${embedding.length} numbers: [${embedding.slice(0, 5).join(', ')}, ...]`)
}

// a file → chunks saved in the database
if (command === 'ingest') {
  const result = await call('ingest', { title: basename(arg), content: await readFile(arg, 'utf8') })
  console.log(result)
}

// a question → an answer, plus the chunks it used
if (command === 'chat') {
  const { answer, sources } = await call('chat', { question: arg })
  console.log(answer)
  sources.forEach((s, i) => console.log(`[${i + 1}] ${s.title}`))
}
