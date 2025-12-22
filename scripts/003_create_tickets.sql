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

-- RLS Policies for tickets
create policy "tickets_select_own"
  on public.tickets for select
  using (auth.uid() = user_id);

create policy "tickets_insert_own"
  on public.tickets for insert
  with check (auth.uid() = user_id);

create policy "tickets_select_admin"
  on public.tickets for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "tickets_update_admin"
  on public.tickets for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
