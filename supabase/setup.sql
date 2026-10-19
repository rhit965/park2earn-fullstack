-- Park2Earn learning backend v1 (Supabase SQL Editor)
-- Run ONCE in a fresh Supabase project. Creates real tables, auth-linked profiles, RLS,
-- and server-side booking transactions. Do NOT expose service_role keys to the browser.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_name text not null,
  title text not null check (char_length(title) between 2 and 120),
  brand text not null check (char_length(brand) between 2 and 80),
  vehicle_type text not null check (vehicle_type in ('Scooter','Motorcycle','Car')),
  location text not null check (char_length(location) between 2 and 120),
  city text not null default 'Nashik',
  rate numeric(10,2) not null check (rate between 10 and 10000),
  available_from time not null,
  available_to time not null,
  rating numeric(2,1) not null default 5.0,
  reviews integer not null default 0,
  trips integer not null default 0,
  features text[] not null default '{}',
  color text not null default 'mint',
  badge text,
  description text not null default '',
  status text not null default 'active' check (status in ('active','paused')),
  created_at timestamptz not null default now(),
  constraint valid_available_window check (available_to - available_from >= interval '1 hour')
);
create index if not exists idx_vehicles_owner on public.vehicles(owner_id);
create index if not exists idx_vehicles_status on public.vehicles(status);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete cascade,
  renter_id uuid not null references auth.users(id) on delete cascade,
  renter_name text not null,
  ride_date date not null,
  start_time time not null,
  end_time time not null,
  hours numeric(5,2) not null check (hours > 0 and hours <= 8),
  total integer not null check (total > 0),
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled','rejected')),
  created_at timestamptz not null default now(),
  constraint valid_booking_times check (end_time > start_time),
  constraint not_own_vehicle check (renter_id <> owner_id)
);
create index if not exists idx_bookings_vehicle_date on public.bookings(vehicle_id,ride_date);
create index if not exists idx_bookings_owner on public.bookings(owner_id);
create index if not exists idx_bookings_renter on public.bookings(renter_id);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  primary key(user_id,vehicle_id)
);

-- User profile automatically created during Supabase Auth signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_name text;
begin
  v_name := coalesce(nullif(trim(left(new.raw_user_meta_data ->> 'full_name',80)),''), split_part(new.email,'@',1));
  if char_length(v_name) < 2 then v_name := 'New User'; end if;
  insert into public.profiles(id,full_name) values(new.id,v_name)
  on conflict(id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Prevent a client from choosing another owner's displayed name.
create or replace function public.enforce_vehicle_owner_name()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  select full_name into new.owner_name from public.profiles where id = new.owner_id;
  if new.owner_name is null then raise exception 'Owner profile missing'; end if;
  return new;
end;
$$;
drop trigger if exists on_vehicle_created on public.vehicles;
create trigger on_vehicle_created before insert on public.vehicles for each row execute function public.enforce_vehicle_owner_name();

-- Explicit RLS rules: public listings; private bookings and favorites.
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.favorites enable row level security;

create policy "profile read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profile update own" on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy "public can browse vehicles" on public.vehicles for select to anon,authenticated using (true);
create policy "owner can create vehicle" on public.vehicles for insert to authenticated with check (owner_id=(select auth.uid()));
create policy "owner can change vehicle status" on public.vehicles for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
create policy "booking parties can view" on public.bookings for select to authenticated using (owner_id=(select auth.uid()) or renter_id=(select auth.uid()));
create policy "favorites read own" on public.favorites for select to authenticated using (user_id=(select auth.uid()));
create policy "favorites insert own" on public.favorites for insert to authenticated with check (user_id=(select auth.uid()));
create policy "favorites delete own" on public.favorites for delete to authenticated using (user_id=(select auth.uid()));

-- Tighten table privileges; no direct booking writes from clients.
revoke all on public.profiles, public.vehicles, public.bookings, public.favorites from anon,authenticated;
grant select on public.vehicles to anon,authenticated;
grant insert on public.vehicles to authenticated;
grant update(status) on public.vehicles to authenticated;
grant select on public.profiles to authenticated;
grant update(full_name) on public.profiles to authenticated;
grant select on public.bookings to authenticated;
grant select,insert,delete on public.favorites to authenticated;

-- Only this function can create bookings. Row locking + transaction-scoped advisory
-- lock makes concurrent requests for the same vehicle serialize, preventing double bookings.
create or replace function public.request_booking(
  p_vehicle_id uuid, p_ride_date date, p_start_time time, p_end_time time
) returns public.bookings language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_vehicle public.vehicles%rowtype;
  v_booking public.bookings%rowtype;
  v_renter_name text;
  v_hours numeric;
begin
  if v_actor is null then raise exception 'Sign in to book a vehicle'; end if;
  if p_vehicle_id is null or p_ride_date is null or p_start_time is null or p_end_time is null then
    raise exception 'Complete all booking details';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_vehicle_id::text)::bigint);
  select * into v_vehicle from public.vehicles where id=p_vehicle_id;
  if not found then raise exception 'Vehicle not found'; end if;
  if v_vehicle.status <> 'active' then raise exception 'This listing is paused'; end if;
  if v_vehicle.owner_id=v_actor then raise exception 'You cannot book your own vehicle'; end if;
  v_hours := extract(epoch from (p_end_time-p_start_time))/3600.0;
  if v_hours<=0 or v_hours>8 then raise exception 'Choose a duration between 1 minute and 8 hours'; end if;
  if p_start_time<v_vehicle.available_from or p_end_time>v_vehicle.available_to then
    raise exception 'Requested slot is outside the owner availability';
  end if;
  if (p_ride_date + p_start_time) <= (now() at time zone 'Asia/Kolkata') then
    raise exception 'Choose a future pickup time (India time)';
  end if;
  if exists(select 1 from public.bookings b where b.vehicle_id=p_vehicle_id and b.ride_date=p_ride_date
      and b.status in ('pending','confirmed') and p_start_time<b.end_time and p_end_time>b.start_time) then
    raise exception 'Sorry, this time slot is already taken';
  end if;
  select full_name into v_renter_name from public.profiles where id=v_actor;
  if v_renter_name is null then raise exception 'Account profile is missing'; end if;
  insert into public.bookings(vehicle_id,owner_id,renter_id,renter_name,ride_date,start_time,end_time,hours,total,status)
  values (p_vehicle_id,v_vehicle.owner_id,v_actor,v_renter_name,p_ride_date,p_start_time,p_end_time,
          round(v_hours,2),round(v_vehicle.rate*v_hours)::integer,'pending')
  returning * into v_booking;
  return v_booking;
end;
$$;

create or replace function public.change_booking_status(p_booking_id uuid,p_new_status text)
returns public.bookings language plpgsql security definer set search_path = '' as $$
declare v_actor uuid:=auth.uid();v_booking public.bookings%rowtype;
begin
  if v_actor is null then raise exception 'Sign in first'; end if;
  select * into v_booking from public.bookings where id=p_booking_id for update;
  if not found then raise exception 'Booking not found'; end if;
  if v_booking.owner_id=v_actor then
    if not ((v_booking.status='pending' and p_new_status in ('confirmed','rejected'))
        or (v_booking.status='confirmed' and p_new_status='completed')) then
      raise exception 'This owner status transition is not allowed';
    end if;
  elsif v_booking.renter_id=v_actor then
    if not (v_booking.status in ('pending','confirmed') and p_new_status='cancelled') then
      raise exception 'This renter status transition is not allowed';
    end if;
  else
    raise exception 'You are not allowed to modify this booking';
  end if;
  update public.bookings set status=p_new_status where id=p_booking_id returning * into v_booking;
  return v_booking;
end;
$$;

revoke execute on function public.handle_new_user() from public,anon,authenticated;
revoke execute on function public.enforce_vehicle_owner_name() from public,anon,authenticated;
revoke execute on function public.request_booking(uuid,date,time,time) from public,anon,authenticated;
revoke execute on function public.change_booking_status(uuid,text) from public,anon,authenticated;
grant execute on function public.request_booking(uuid,date,time,time) to authenticated;
grant execute on function public.change_booking_status(uuid,text) to authenticated;

-- Done. Next: set URL/key in .env.local and restart the Next.js server.
