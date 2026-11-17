-- AI-BID 2027 — billetterie
-- À exécuter dans l'éditeur SQL du projet Supabase dédié.
-- Les tables ne sont lues/écrites QUE par le serveur (clé service_role) :
-- RLS activé sans aucune policy = aucun accès avec la clé anon.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity unique,
  access_token text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  buyer_company text,
  amount integer not null check (amount > 0),
  fees integer,
  fedapay_transaction_id text unique,
  fedapay_reference text,
  paid_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_email_idx on public.orders (lower(buyer_email));

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  code text not null unique,
  tier text not null check (tier in ('essentiel', 'pro', 'premium')),
  holder_name text not null,
  price integer not null,
  position smallint not null,
  checked_in_at timestamptz,
  checked_in_by text,
  created_at timestamptz not null default now()
);

create index if not exists tickets_order_idx on public.tickets (order_id);

alter table public.orders enable row level security;
alter table public.tickets enable row level security;

-- Statistiques pour la page d'accueil admin.
create or replace view public.ticket_stats as
select t.tier,
       count(*) filter (where o.status = 'paid') as sold,
       count(*) filter (where o.status = 'paid' and t.checked_in_at is not null) as checked_in,
       coalesce(sum(t.price) filter (where o.status = 'paid'), 0) as revenue
from public.tickets t
join public.orders o on o.id = t.order_id
group by t.tier;

revoke all on public.ticket_stats from anon, authenticated;
