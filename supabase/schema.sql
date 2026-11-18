-- Tables du site (préfixe marge_). Clé publique (anon) = AJOUT SEUL : aucune lecture, modif ni suppression.
-- Lecture des emails / propositions : tableau de bord Supabase.

create table if not exists public.marge_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  lang text not null default 'fr' check (lang in ('fr','en')),
  source text check (char_length(source) <= 200),
  created_at timestamptz not null default now()
);

create table if not exists public.marge_contributions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 254),
  lang text not null default 'fr' check (lang in ('fr','en')),
  title text not null check (char_length(title) <= 200),
  pitch text not null check (char_length(pitch) between 80 and 8000),
  link text check (char_length(link) <= 300),
  status text not null default 'new' check (status = 'new'),
  created_at timestamptz not null default now()
);

create table if not exists public.marge_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 254),
  lang text not null default 'fr' check (lang in ('fr','en')),
  message text not null check (char_length(message) between 10 and 4000),
  created_at timestamptz not null default now()
);

alter table public.marge_subscribers enable row level security;
alter table public.marge_contributions enable row level security;
alter table public.marge_contacts enable row level security;

revoke all on public.marge_subscribers, public.marge_contributions, public.marge_contacts from anon, authenticated;
grant insert on public.marge_subscribers, public.marge_contributions, public.marge_contacts to anon;

create policy "insert only" on public.marge_subscribers for insert to anon with check (true);
create policy "insert only" on public.marge_contributions for insert to anon with check (true);
create policy "insert only" on public.marge_contacts for insert to anon with check (true);
