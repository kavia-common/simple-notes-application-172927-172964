# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

It is configured to use Supabase as a backend for storing notes.

## Features

- Lightweight React stack (CRA) with clean, responsive UI
- Supabase integration for CRUD operations on a `notes` table
- Accessibility-focused components
- Minimal configuration via environment variables

## Requirements

- Node.js LTS
- A Supabase project with the following environment variables set at build time:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY

See .env.example for details.

## Getting Started

1) Install dependencies:
   npm install

2) Configure environment:
   - Copy .env.example to .env
   - Fill in:
     - REACT_APP_SUPABASE_URL
     - REACT_APP_SUPABASE_KEY

3) Start the app:
   npm start
   Open http://localhost:3000

4) Run tests:
   CI=true npm test

## Supabase Setup

This app expects a `notes` table in your Supabase project's public schema.

Environment variables used by the code (src/lib/supabaseClient.js):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

These must match exactly; do not rename them.

### SQL: Create notes table

Run the following SQL in the Supabase SQL editor:

```sql
-- Table: public.notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful update trigger to keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at on public.notes;
create trigger trg_set_updated_at
before update on public.notes
for each row execute function public.set_updated_at();
```

### Row Level Security (RLS)

If you are using the anon/public key in the frontend without auth, enable RLS and choose one of the following approaches:

A) Open read/write for demo/testing only (not recommended for production):
```sql
alter table public.notes enable row level security;

-- Allow anyone (including anon) to read
create policy "notes_read_all"
on public.notes
for select
to anon
using (true);

-- Allow anyone (including anon) to insert
create policy "notes_insert_all"
on public.notes
for insert
to anon
with check (true);

-- Allow anyone (including anon) to update
create policy "notes_update_all"
on public.notes
for update
to anon
using (true)
with check (true);

-- Allow anyone (including anon) to delete
create policy "notes_delete_all"
on public.notes
for delete
to anon
using (true);
```

B) If you plan to add auth later, you can scope notes to each user by adding a user_id column and restricting by auth.uid(). For now, this app does not require auth and uses the anon key; choose option A to get started.

### PostgREST notes

The service reads/writes to the `public.notes` table using the anon key through the browser client. Ensure your policies match your intended security posture.

## How the app uses Supabase

- Client initialization: src/lib/supabaseClient.js
  - Reads REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY
  - Creates a singleton Supabase client

- CRUD operations: src/services/notesService.js
  - listNotes: select * from notes order by created_at desc
  - createNote: insert title/content, returns the inserted row
  - updateNote: updates title/content, returns the updated row
  - deleteNote: deletes by id, returns the deleted id

- UI behavior when env missing:
  - Buttons and inputs are disabled and a status message appears indicating missing REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.

## Deployment notes

- Build with the environment variables present so the client is configured at runtime:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY

- For production, configure Supabase Authentication > URL Configuration:
  - Site URL: your production domain
  - Add redirect URLs if you later add email/OAuth flows

## Troubleshooting

- If you see "Supabase env missing" in the UI, ensure your .env (or deployment env) defines:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY

- If you receive errors from the notes service, verify:
  - The `public.notes` table exists
  - RLS policies allow your anon key actions (see policies above)
  - Network access to your Supabase project is not blocked

## Learn More

- React documentation: https://reactjs.org/
- Supabase docs: https://supabase.com/docs
