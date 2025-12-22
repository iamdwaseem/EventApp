-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- RLS Policies for profiles - FIXED to avoid infinite recursion
-- Users can only select their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can only insert their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can only delete their own profile
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Removed the problematic profiles_select_admin policy that caused infinite recursion
-- Admin checks will be done in the application layer instead
