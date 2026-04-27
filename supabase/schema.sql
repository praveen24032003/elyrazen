-- Run this in Supabase SQL Editor
-- Creates core tables for products/leads and auth-ready user profiles.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  category text,
  brand text,
  protocol text,
  installavailable boolean default false,
  popular boolean default false,
  imageurl text,
  price text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id text primary key,
  name text not null,
  phone text not null,
  city text not null,
  service text not null,
  message text,
  source text default 'conversion_form',
  sourceip text,
  createdat timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id text primary key,
  admin_email text not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  sourceip text,
  createdat timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.leads enable row level security;
alter table public.user_profiles enable row level security;

-- Public storefront can read products.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products
  for select
  to anon, authenticated
  using (true);

-- Users can read and update only their own profile rows.
drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Service role (used by backend) bypasses RLS for seed and lead capture.
