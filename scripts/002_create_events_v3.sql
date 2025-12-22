-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date timestamp with time zone not null,
  location text not null,
  capacity integer not null,
  price numeric(10, 2) not null,
  image_url text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.events enable row level security;

-- Everyone can view all events
create policy "events_select_all"
  on public.events for select
  using (true);

-- Admin policies now work without recursion since profiles table has no RLS
-- Admin insert policy
create policy "events_insert_admin"
  on public.events for insert
  with check (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );

-- Admin update policy
create policy "events_update_admin"
  on public.events for update
  using (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );

-- Admin delete policy
create policy "events_delete_admin"
  on public.events for delete
  using (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );
