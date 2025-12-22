-- Create redeem_codes table
create table if not exists public.redeem_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percentage integer not null,
  max_uses integer,
  used_count integer default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

alter table public.redeem_codes enable row level security;

-- RLS Policies for redeem_codes
-- Everyone can view active redeem codes
create policy "redeem_codes_select_all"
  on public.redeem_codes for select
  using (expires_at is null or expires_at > now());

-- Simplified admin policies
-- Admins can insert redeem codes
create policy "redeem_codes_insert_admin"
  on public.redeem_codes for insert
  with check (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );

-- Admins can update redeem codes
create policy "redeem_codes_update_admin"
  on public.redeem_codes for update
  using (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );

-- Admins can delete redeem codes
create policy "redeem_codes_delete_admin"
  on public.redeem_codes for delete
  using (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );
