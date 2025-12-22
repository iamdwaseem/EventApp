-- Create redeem codes table
create table if not exists public.redeem_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete set null,
  is_used boolean default false,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  used_at timestamp with time zone
);

alter table public.redeem_codes enable row level security;

-- RLS Policies for redeem codes
create policy "redeem_codes_select_admin"
  on public.redeem_codes for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "redeem_codes_insert_admin"
  on public.redeem_codes for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "redeem_codes_update_admin"
  on public.redeem_codes for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
