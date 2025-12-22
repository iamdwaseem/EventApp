-- Create redeem_codes table
create table if not exists public.redeem_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percentage integer not null,
  max_uses integer,
  used_count integer default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table public.redeem_codes enable row level security;

-- Everyone can select redeem codes
create policy "redeem_codes_select_all"
  on public.redeem_codes for select
  using (true);

-- Admin policies now work without recursion
-- Only admins can insert redeem codes
create policy "redeem_codes_insert_admin"
  on public.redeem_codes for insert
  with check (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );

-- Only admins can update redeem codes
create policy "redeem_codes_update_admin"
  on public.redeem_codes for update
  using (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );

-- Only admins can delete redeem codes
create policy "redeem_codes_delete_admin"
  on public.redeem_codes for delete
  using (
    (select is_admin from public.profiles where id = auth.uid() limit 1) = true
  );
