-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean default false,
  created_at timestamp with time zone default now()
);

-- Disable RLS on profiles table to avoid infinite recursion
-- Other tables will query this table to check admin status
alter table public.profiles disable row level security;
