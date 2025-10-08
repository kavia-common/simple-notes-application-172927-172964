# Supabase Setup for Simple Notes (Frontend)

This document summarizes the exact configuration expected by the notes frontend.

Environment variables (must be available at build time):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

See notes_frontend/.env.example for values to provide.

SQL: Create notes table and trigger
-----------------------------------
Run in Supabase SQL editor:

```sql
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

RLS Policies
------------
For quick testing with anon key:

```sql
alter table public.notes enable row level security;

create policy "notes_read_all"
on public.notes for select to anon using (true);

create policy "notes_insert_all"
on public.notes for insert to anon with check (true);

create policy "notes_update_all"
on public.notes for update to anon using (true) with check (true);

create policy "notes_delete_all"
on public.notes for delete to anon using (true);
```

Security note: The above policies are permissive and are intended for demos. For production, introduce auth and scope notes to each user.
