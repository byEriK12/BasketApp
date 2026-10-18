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

create table if not exists public.player_stats (
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id text not null references public.cards(id) on delete cascade,
  stats jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

insert into public.cards (id, name, overall, price, image_path) values
  ('aleix', 'Aleix', 74, 3500, 'cards/Aleix_Card.png'),
  ('arnau', 'Arnau', 78, 5500, 'cards/Arnau_Card.png'),
  ('cavi', 'Cavi', 70, 3000, 'cards/Cavi_Card.png'),
  ('diaz', 'Diaz', 76, 5000, 'cards/Diaz_Card.png'),
  ('eric', 'Eric', 79, 5500, 'cards/Eric_Card.png'),
  ('ert', 'Ert', 74, 3500, 'cards/Ert_Card.png'),
  ('grinyo', 'Grinyo', 64, 1500, 'cards/Grinyo_Card.png'),
  ('jamo', 'Jamo', 70, 3500, 'cards/Jamo_Card.png'),
  ('andreu', 'Andreu', 65, 3000, 'cards/Andreu_Card.png'),
  ('batalla', 'Batalla', 63, 1500, 'cards/Batalla_Card.png'),
  ('blasi', 'Blasi', 67, 3000, 'cards/Blasi_Card.png'),
  ('gomez', 'Gomez', 72, 3000, 'cards/Gomez_Card.png'),
  ('llongueras', 'Llongueras', 71, 3000, 'cards/Llongueras_Card.png'),
  ('moya', 'Moya', 63, 1000, 'cards/Moya_Card.png'),
  ('ot', 'Ot', 68, 3000, 'cards/Ot_Card.png'),
  ('pep', 'Pep', 64, 1000, 'cards/Pep_Card.png'),
  ('raset', 'Raset', 68, 3500, 'cards/Raset_Card.png')
on conflict (id) do update set name = excluded.name, overall = excluded.overall, price = excluded.price, image_path = excluded.image_path;

-- Keeps an existing project in sync with the editable overall-based pricing rule.
update public.cards set price = overall * 100;

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.user_cards enable row level security;
alter table public.player_stats enable row level security;

drop policy if exists "Profiles accessible by owner" on public.profiles;
create policy "Profiles accessible by owner" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Cards visible by everyone" on public.cards;
create policy "Cards visible by everyone" on public.cards for select using (true);
drop policy if exists "User cards accessible by owner" on public.user_cards;
create policy "User cards accessible by owner" on public.user_cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Player stats accessible by owner" on public.player_stats;
create policy "Player stats accessible by owner" on public.player_stats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_profile_id uuid := new.id;
  new_coins integer := case when lower(new.email) = 'eric.matasp12@gmail.com' then 999999 else 500 end;
  new_username text := case 
    when lower(new.email) = 'eric.matasp12@gmail.com' then 'byEriK12' 
    else coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)) 
  end;
  roll float;
  chosen_card_id text;
  draw_count integer;
begin
  -- 1. Crear el perfil
  insert into public.profiles (id, username, email, coins)
  values (new_profile_id, new_username, new.email, new_coins)
  on conflict (id) do nothing;

  -- 2. Asignar 2 cartas iniciales con ruleta por tiers
  for draw_count in 1..2 loop
    -- Reset indispensable en cada iteración
    chosen_card_id := null;
    roll := random(); -- Número entre 0.0 y 1.0

    if roll < 0.60 then
      -- 60% probabilidad: Bronces (overall <= 64)
      select id into chosen_card_id
      from public.cards
      where overall <= 64
        and id not in (select card_id from public.user_cards where user_id = new_profile_id)
      order by random()
      limit 1;
    elsif roll < 0.90 then
      -- 30% probabilidad: Platas (overall 65 - 74)
      select id into chosen_card_id
      from public.cards
      where overall between 65 and 74
        and id not in (select card_id from public.user_cards where user_id = new_profile_id)
      order by random()
      limit 1;
    else
      -- 10% probabilidad: Oros (overall > 74)
      select id into chosen_card_id
      from public.cards
      where overall > 74
        and id not in (select card_id from public.user_cards where user_id = new_profile_id)
      order by random()
      limit 1;
    end if;

    -- Respaldo de seguridad si la categoría no devolvió fila
    if chosen_card_id is null then
      select id into chosen_card_id
      from public.cards
      where id not in (select card_id from public.user_cards where user_id = new_profile_id)
      order by random()
      limit 1;
    end if;

    -- Guardar la carta asignada
    if chosen_card_id is not null then
      insert into public.user_cards (user_id, card_id)
      values (new_profile_id, chosen_card_id)
      on conflict (user_id, card_id) do nothing;
    end if;
  end loop;

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
