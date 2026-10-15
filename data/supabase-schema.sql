-- Ultimate Club schema for Supabase.
-- Run this file in the Supabase SQL editor before adding the project URL/key to index.html.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  email text,
  coins integer not null default 500 check (coins >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id text primary key,
  name text not null,
  overall integer not null check (overall between 50 and 99),
  price integer not null default 5000 check (price >= 0),
  image_path text not null
);

create table if not exists public.user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id text not null references public.cards(id) on delete cascade,
  acquired_at timestamptz not null default now(),
  unique (user_id, card_id)
);

insert into public.cards (id, name, overall, price, image_path) values
  ('aleix', 'Aleix', 74, 7400, 'cards/Aleix_Card.png'),
  ('arnau', 'Arnau', 78, 7800, 'cards/Arnau_Card.png'),
  ('cavi', 'Cavi', 70, 7000, 'cards/Cavi_Card.png'),
  ('diaz', 'Diaz', 76, 7600, 'cards/Diaz_Card.png'),
  ('eric', 'Eric', 79, 7900, 'cards/Eric_Card.png'),
  ('ert', 'Ert', 74, 7400, 'cards/Ert_Card.png'),
  ('grinyo', 'Grinyo', 64, 6400, 'cards/Grinyo_Card.png'),
  ('jamo', 'Jamo', 70, 7000, 'cards/Jamo_Card.png')
on conflict (id) do update set name = excluded.name, overall = excluded.overall, price = excluded.price, image_path = excluded.image_path;

-- Keeps an existing project in sync with the editable overall-based pricing rule.
update public.cards set price = overall * 100;

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.user_cards enable row level security;

drop policy if exists "Profiles accessible by owner" on public.profiles;
create policy "Profiles accessible by owner" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Cards visible by everyone" on public.cards;
create policy "Cards visible by everyone" on public.cards for select using (true);
drop policy if exists "User cards accessible by owner" on public.user_cards;
create policy "User cards accessible by owner" on public.user_cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_profile_id uuid := new.id;
  new_coins integer := case when lower(new.email) = 'eric.matasp12@gmail.com' then 999999 else 500 end;
  new_username text := case when lower(new.email) = 'eric.matasp12@gmail.com' then 'byEriK12' else null end;
begin
  insert into public.profiles (id, username, email, coins) values (new_profile_id, new_username, new.email, new_coins)
  on conflict (id) do nothing;
  insert into public.user_cards (user_id, card_id)
    select new_profile_id, id from public.cards order by random() limit 2
    on conflict (user_id, card_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.purchase_card(requested_card_id text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  card_price integer;
begin
  select price into card_price from public.cards where id = requested_card_id;
  if card_price is null then raise exception 'Carta no encontrada'; end if;
  if exists (select 1 from public.user_cards where user_id = auth.uid() and card_id = requested_card_id) then
    raise exception 'La carta ya pertenece al club';
  end if;
  update public.profiles set coins = coins - card_price where id = auth.uid() and coins >= card_price;
  if not found then raise exception 'Monedas insuficientes'; end if;
  insert into public.user_cards (user_id, card_id) values (auth.uid(), requested_card_id);
end;
$$;

create or replace function public.record_match_result(did_win boolean, reward_coins integer)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if reward_coins not in (100, 500) then raise exception 'Recompensa no valida'; end if;
  update public.profiles
    set coins = coins + reward_coins,
        wins = wins + case when did_win then 1 else 0 end,
        losses = losses + case when did_win then 0 else 1 end
    where id = auth.uid();
end;
$$;

grant execute on function public.purchase_card(text) to authenticated;
grant execute on function public.record_match_result(boolean, integer) to authenticated;
