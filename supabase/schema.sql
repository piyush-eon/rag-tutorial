-- Everything the app needs in the database, in the order the notes build it.
-- Paste it into the Supabase SQL Editor and run it once.

-- 1. pgvector (section 01)
create extension if not exists vector with schema extensions;

-- 2. Tables and grants (section 06)
create table documents (
  id bigserial primary key,
  title text not null,
  created_at timestamptz default now()
);

create table document_chunks (
  id bigserial primary key,
  document_id bigint not null references documents on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(768)   -- must match the embedding model's output size
);

grant select, insert on documents, document_chunks to anon;
grant usage on sequence documents_id_seq, document_chunks_id_seq to anon;  -- for the auto-numbered ids

create table demo_queries (q text primary key, embedding vector(768));
grant select, insert, update on demo_queries to anon;

-- 3. Semantic search (section 07)
create or replace function match_chunks(
  query_embedding vector(768),
  match_threshold float default 0.6,  -- tune for your data; every embedding model scores differently
  match_count int default 5
)
returns table (id bigint, document_id bigint, title text, content text, similarity float)
language sql stable
as $$
  select c.id, c.document_id, d.title, c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from document_chunks c
  join documents d on d.id = c.document_id
  where 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding   -- order by the raw operator so an index can be used
  limit match_count;
$$;

grant execute on function match_chunks to anon;  -- same rule as tables: say who may call it

-- 4. Hybrid search (section 09)
alter table document_chunks
add column fts tsvector generated always as (to_tsvector('english', content)) stored;

create index on document_chunks using gin (fts);

create or replace function hybrid_search(
  query_text text,
  query_embedding vector(768),
  match_count int default 5,
  full_text_weight float default 1,
  semantic_weight float default 1,
  rrf_k int default 50
)
returns table (id bigint, document_id bigint, title text, content text, score float)
language sql stable
as $$
  with full_text as (           -- librarian 1: exact words, numbered 1, 2, 3…
    select id,
           row_number() over (order by ts_rank_cd(fts, keywords) desc) as rank_ix
    from document_chunks,
         -- any word of the question may match, not all ("what does … mean" isn't in the docs)
         to_tsquery(replace(websearch_to_tsquery(query_text)::text, ' & ', ' | ')) as keywords
    where fts @@ keywords
    order by rank_ix
    limit match_count * 2
  ),
  semantic as (                 -- librarian 2: meaning, numbered 1, 2, 3…
    select id,
           row_number() over (order by embedding <=> query_embedding) as rank_ix
    from document_chunks
    order by rank_ix
    limit match_count * 2
  )
  select c.id, c.document_id, d.title, c.content,
         coalesce(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
         coalesce(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight as score
  from full_text
  full outer join semantic on full_text.id = semantic.id   -- keep chunks found by either list
  join document_chunks c on c.id = coalesce(full_text.id, semantic.id)
  join documents d on d.id = c.document_id
  order by score desc
  limit match_count;
$$;

grant execute on function hybrid_search to anon;
