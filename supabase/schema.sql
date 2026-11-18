-- À exécuter une fois dans Supabase (SQL editor). RLS activé, aucune policy publique :
-- seule la clé service (utilisée par /api/submit côté serveur) peut écrire/lire.

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  lang text not null default 'fr',
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  lang text not null default 'fr',
  title text not null,
  pitch text not null,
  link text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  lang text not null default 'fr',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;
alter table public.contributions enable row level security;
alter table public.contacts enable row level security;
