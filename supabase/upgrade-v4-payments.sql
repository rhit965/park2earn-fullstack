-- Run after setup.sql and upgrade-v3.sql. No records are deleted.
begin;
create table if not exists public.payment_orders (
 id uuid primary key default gen_random_uuid(),
 booking_id uuid not null unique references public.bookings(id),
 renter_id uuid not null references auth.users(id),
 owner_id uuid not null references auth.users(id),
 amount integer not null check(amount>0), currency text not null default 'INR' check(currency='INR'),
 status text not null default 'creating' check(status in ('creating','created','captured','refund_pending','refunded')),
 gateway_order_id text unique, gateway_payment_id text unique, gateway_refund_id text unique,
 terms_version text not null, consent_at timestamptz not null default now(),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.payment_orders enable row level security;
drop policy if exists "payment parties read" on public.payment_orders;
create policy "payment parties read" on public.payment_orders for select to authenticated using (renter_id=(select auth.uid()) or owner_id=(select auth.uid()));
revoke all on public.payment_orders from anon,authenticated;
grant select on public.payment_orders to authenticated;
grant all on public.payment_orders to service_role;

create or replace function public.begin_payment(p_booking_id uuid,p_user_id uuid,p_terms_version text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare b public.bookings%rowtype; p public.payment_orders%rowtype;
begin
 select * into b from public.bookings where id=p_booking_id for update;
 if not found or b.renter_id<>p_user_id then raise exception 'Booking not available to this account';end if;
 if b.status<>'confirmed' then raise exception 'Owner must accept the booking first';end if;
 if (b.ride_date+b.start_time)<=(now() at time zone 'Asia/Kolkata') then raise exception 'Pickup time has passed';end if;
 if p_terms_version<>'2026-10-20-v1' then raise exception 'Accept the current terms';end if;
 select * into p from public.payment_orders where booking_id=b.id;
 if found then return jsonb_build_object('fresh',false,'payment',to_jsonb(p));end if;
 insert into public.payment_orders(booking_id,renter_id,owner_id,amount,terms_version)
 values(b.id,b.renter_id,b.owner_id,b.total*100,p_terms_version) returning * into p;
 return jsonb_build_object('fresh',true,'payment',to_jsonb(p));
end;$$;

create or replace function public.settle_payment(p_order_id text,p_payment_id text,p_amount integer,p_currency text)
returns void language plpgsql security definer set search_path='' as $$
declare p public.payment_orders%rowtype;
begin
 select * into p from public.payment_orders where gateway_order_id=p_order_id for update;
 if not found then raise exception 'Order reconciliation pending';end if;
 if p.amount<>p_amount or p.currency<>p_currency then raise exception 'Payment amount mismatch';end if;
 if p.gateway_payment_id is not null and p.gateway_payment_id<>p_payment_id then raise exception 'Payment identity mismatch';end if;
 if p.status in ('refund_pending','refunded') then return;end if;
 update public.payment_orders set status='captured',gateway_payment_id=p_payment_id,updated_at=now() where id=p.id;
end;$$;

create or replace function public.begin_refund(p_booking_id uuid,p_user_id uuid)
returns public.payment_orders language plpgsql security definer set search_path='' as $$
declare b public.bookings%rowtype;p public.payment_orders%rowtype;
begin
 select * into b from public.bookings where id=p_booking_id for update;
 if not found or b.renter_id<>p_user_id then raise exception 'Booking not available to this account';end if;
 select * into p from public.payment_orders where booking_id=b.id for update;
 if not found then raise exception 'No captured payment to refund';end if;
 if p.status in ('refund_pending','refunded') then return p;end if;
 if p.status<>'captured' then raise exception 'Payment is not captured; contact support for reconciliation';end if;
 if b.status<>'confirmed' or (b.ride_date+b.start_time)<=(now() at time zone 'Asia/Kolkata') then raise exception 'Self-service cancellation is available only before pickup. Contact support for review';end if;
 update public.payment_orders set status='refund_pending',updated_at=now() where id=p.id returning * into p;
 update public.bookings set status='cancelled' where id=b.id;
 return p;
end;$$;

create or replace function public.settle_refund(p_payment_id text,p_refund_id text,p_amount integer)
returns void language plpgsql security definer set search_path='' as $$
declare p public.payment_orders%rowtype;
begin
 select * into p from public.payment_orders where gateway_payment_id=p_payment_id;
 if not found then raise exception 'Refund reconciliation pending';end if;
 perform 1 from public.bookings where id=p.booking_id for update;
 select * into p from public.payment_orders where gateway_payment_id=p_payment_id for update;
 if not found then raise exception 'Refund reconciliation pending';end if;
 if p.amount<>p_amount then raise exception 'Partial refund requires manual reconciliation';end if;
 if p.gateway_refund_id is not null and p.gateway_refund_id<>p_refund_id then raise exception 'Refund identity mismatch';end if;
 update public.payment_orders set status='refunded',gateway_refund_id=p_refund_id,updated_at=now() where id=p.id;
 update public.bookings set status='cancelled' where id=p.booking_id and status in ('pending','confirmed');
end;$$;

create or replace function public.guard_paid_booking()
returns trigger language plpgsql security definer set search_path='' as $$
declare s text;
begin
 select status into s from public.payment_orders where booking_id=old.id;
 if new.status='cancelled' and s is not null and s not in ('refund_pending','refunded') then raise exception 'Use the payment cancellation flow or contact support';end if;
 if new.status='completed' and s is not null and s<>'captured' then raise exception 'Payment is not captured';end if;
 return new;
end;$$;
drop trigger if exists booking_payment_guard on public.bookings;
create trigger booking_payment_guard before update of status on public.bookings for each row execute function public.guard_paid_booking();

create table if not exists public.support_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 category text not null check(category in ('booking','payment','privacy','complaint')),
 subject text not null check(char_length(subject) between 3 and 120),
 message text not null check(char_length(message) between 10 and 4000),
 status text not null default 'open' check(status in ('open','in_progress','resolved')),
 created_at timestamptz not null default now()
);
alter table public.support_requests enable row level security;
drop policy if exists "read own requests" on public.support_requests;
create policy "read own requests" on public.support_requests for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.support_requests from anon,authenticated;
grant select on public.support_requests to authenticated;
grant all on public.support_requests to service_role;

-- Atomic per-account limits shared across server instances, not process memory.
create table if not exists public.api_rate_limits (
 key text primary key, window_start timestamptz not null, hits integer not null
);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon,authenticated;
grant all on public.api_rate_limits to service_role;
create or replace function public.consume_api_limit(p_key text,p_max integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 insert into public.api_rate_limits(key,window_start,hits) values(p_key,date_trunc('minute',now()),1)
 on conflict(key) do update set hits=case when api_rate_limits.window_start=date_trunc('minute',now()) then api_rate_limits.hits+1 else 1 end, window_start=date_trunc('minute',now()) returning hits into n;
 return n<=p_max;
end;$$;
revoke all on function public.begin_payment(uuid,uuid,text),public.settle_payment(text,text,integer,text),public.begin_refund(uuid,uuid),public.settle_refund(text,text,integer),public.consume_api_limit(text,integer),public.guard_paid_booking() from public,anon,authenticated;
grant execute on function public.begin_payment(uuid,uuid,text),public.settle_payment(text,text,integer,text),public.begin_refund(uuid,uuid),public.settle_refund(text,text,integer),public.consume_api_limit(text,integer) to service_role;
commit;
