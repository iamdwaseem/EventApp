-- Create tickets table
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  qr_code text not null,
  status text default 'active' check (status in ('active', 'redeemed', 'cancelled')),
  purchased_at timestamp with time zone default now(),
  redeemed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.tickets enable row level security;

-- Users can only select their own tickets
create policy "tickets_select_own"
  on public.tickets for select
  using (auth.uid() = user_id);

-- Users can only insert their own tickets
create policy "tickets_insert_own"
  on public.tickets for insert
  with check (auth.uid() = user_id);

-- Admin policies now work without recursion
-- Admins can select all tickets
create policy "tickets_select_admin"
  on public.tickets for select
  using (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );

-- Admins can update all tickets
create policy "tickets_update_admin"
  on public.tickets for update
  using (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );
