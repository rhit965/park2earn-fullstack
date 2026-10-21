-- Apply AFTER setup.sql. Safe to re-run; does not delete data.
-- Existing invalid rows are retained; NOT VALID constraints enforce new writes.
alter table public.vehicles drop constraint if exists vehicle_text_limits;
alter table public.vehicles add constraint vehicle_text_limits check (
 char_length(trim(city)) between 2 and 80 and char_length(description)<=2000
 and char_length(trim(title)) between 2 and 120 and char_length(trim(brand)) between 2 and 80
 and char_length(trim(location)) between 2 and 120
) not valid;

-- Public clients cannot manufacture reviews, trip counts or promotional badges.
create or replace function public.enforce_vehicle_owner_name()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 select full_name into new.owner_name from public.profiles where id=new.owner_id;
 if new.owner_name is null then raise exception 'Owner profile missing'; end if;
 new.rating:=0; new.reviews:=0; new.trips:=0; new.badge:=null;
 return new;
end;
$$;
revoke execute on function public.enforce_vehicle_owner_name() from public,anon,authenticated;

-- Serialize booking creation with owner status changes (pause vs request).
-- Replace request_booking below with the same validated transaction plus row lock.
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
  select * into v_vehicle from public.vehicles where id=p_vehicle_id for update;
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


revoke execute on function public.request_booking(uuid,date,time,time) from public,anon,authenticated;
grant execute on function public.request_booking(uuid,date,time,time) to authenticated;
