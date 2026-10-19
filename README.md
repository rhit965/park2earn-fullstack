# Park2Earn — Full-Stack Learning Project (v2)

This is the **backend upgrade** of the original Park2Earn frontend. It preserves the premium responsive visual design while introducing a real Supabase Auth + PostgreSQL backend, persistent listings, private booking records, favorites, secure owner-only status changes, and database-authoritative booking-conflict checks.

**It's still a learning/concept prototype.** No real vehicle rental, money transfer, permission, insurance or verification is provided. All payments/earnings are illustrative. Do not use it to offer real paid rentals.

## Quick start: Windows + VS Code

1. Unzip the **new `park2earn-fullstack.zip`** into a new folder. Don't overwrite your existing original website.
2. Open the `park2earn-fullstack` folder (the one containing `package.json`) in VS Code.
3. In **Terminal > New Terminal**, enter:

   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```

4. Open http://localhost:3000

**At first it still runs your old local demo mode**. This is intentional. Real cloud mode starts only when you finish the steps below.

> Important: Stop the old frontend dev server with **Ctrl+C** first. Otherwise Next.js may run this version on port 3001, and you may think the old frontend is still showing.

## Enable the real backend in Supabase (free-tier account works for prototyping)

### 1. Create a Supabase project

- Visit https://supabase.com/dashboard and log in / sign up.
- Click **New project**. Choose any project name (e.g., `park2earn-demo`), create a database password and select a region.
- Wait for provisioning.

### 2. Install the database schema and secure booking functions

- Open your project > **SQL Editor** > **New query**.
- In VS Code, open the included **`supabase/setup.sql`** file.
- Copy **the whole SQL file** into the Supabase SQL editor, and click **Run**.
- You should get a success notice. This file should be run **once, in a fresh project**. If it fails, check its exact SQL error before continuing.

It creates four tables: `profiles`, `vehicles`, `bookings`, `favorites`; Row Level Security; auth-signup profile trigger; and `request_booking` / `change_booking_status` RPCs. Only these RPC functions can create/change bookings. The booking RPC obtains a database transaction lock per vehicle and checks overlapping reserved slots, so concurrent booking requests cannot double-book the same vehicle through the app.

### 3. Connect this website using a public project key

In Supabase Dashboard, find your **Project URL** and **Publishable key** (legacy **anon public** key also works); you can usually find them under Project Settings > API or Connect.

In the website's top-level folder, make a file named **`.env.local`**. You may copy `.env.example` to start. Paste:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_PUBLIC_KEY
```

**NEVER paste a Supabase service_role key, secret key, database password or private API key into this file or into chat.** `NEXT_PUBLIC_` fields are readable by browser users. Safe access relies on the database's Row Level Security policies included in the SQL.

Restart the terminal (**Ctrl+C**, then `npm.cmd run dev`). The site now automatically switches from local demo mode to **real Supabase mode**.

### 4. Create two accounts and test the booking workflow

> Depending on your Supabase Auth settings, new signups may need **email confirmation** before login. Check your inbox. For an isolated development-only test project, you can change Auth > Providers > Email > Confirm email, but **keep email verification enabled for a public deployment**.

1. Go to `/login`. Create an account for **Owner A** (use an email you control), and sign in.
2. Click **List your vehicle**, add a **fictional** Activa with 09:00–17:00 availability and ₹60/hour. It is now saved in PostgreSQL.
3. **Sign out**. Create a separate **Renter B** account (another email you control), and sign in.
4. Open **Explore rides**, select Owner A's vehicle, choose **tomorrow 11:00–13:00**, and click **Request booking**.
5. Sign out of Renter B; sign in as Owner A. Choose **Owner view** from the top-right menu or dashboard; click **Refresh data**. The booking appears. **Accept** it.
6. Sign in as Renter B. Go to **My bookings**; the request is **Confirmed**. Owner A can mark the trip Completed after the simulated ride.
7. Try to request the exact same time slot with another account: the database should reject it as already taken.

You can use separate browser profiles to test Owner A and Renter B simultaneously. Otherwise log out and back in between accounts. **Owner and Renter view toggles are not separate identities in Supabase mode.**

## Routes and data flow

| Route | Behavior |
|---|---|
| `/` | Premium motion-designed concept landing page (original design preserved) |
| `/explore` | Live listings from the `vehicles` table; filters and favorites |
| `/vehicles/[id]` | Booking form; submit through secure PostgreSQL `request_booking` RPC |
| `/list-vehicle` | Publish a concept vehicle (logged-in user; RLS allows only own listings) |
| `/login` | Supabase email/password signup, confirmation and login flow |
| `/dashboard` | Switch Owner/Renter view, manage vehicles, accept/reject, refresh data |
| `/bookings` | Current user only: see owned/requested bookings, cancel/complete |
| `/admin` | Disabled when Supabase mode is enabled (secure admin RBAC not built) |

### How backend mode works

- `lib/cloud-store.tsx` is the real data store: API queries and Supabase Auth session.
- `lib/supabase.ts` creates the client with the **public key**.
- `supabase/setup.sql` is the source-of-truth schema and transactional booking authorization.
- `lib/local-store.tsx` preserves the original two-person local demo when `.env.local` is missing.
- `lib/store.tsx` automatically chooses between the real backend and local demo.

There is no need to deploy a separate Express API: **Supabase provides the Postgres-backed data API and authentication**. All sensitive booking validation happens inside PostgreSQL, not browser JavaScript.

## Key security notes / prototype limitations

- Server-enforced row ownership (RLS), secure functions and booking-overlap locking are included.
- This remains a **learning backend**, not production-ready: no real vehicle verification, fraud prevention, legal rental compliance, insurance integration, billing, deposits, or ID/licence verification.
- The owner can view their requests; renters can view only their own; public browsing sees vehicle listing details only.
- `Refresh data` is manual. Realtime push notifications are not yet integrated.
- The local availability display only knows about **your own bookings** because other renters' bookings are private. The **final booking request** is always validated against **all bookings** by the database.
- The demonstration uses **Asia/Kolkata** time when validating whether a booking is in the future. Adapt for multiple timezones before expanding to other regions.
- Signed-in users can have both owner and renter view, but cannot book their own vehicle.
- Signup behavior depends on Supabase project email confirmation settings. Avoid automated signup testing using strangers' email addresses.
- Check `npm audit` and upgrade packages before hosting publicly. Do **not** blindly run `npm audit fix --force`.
- No real payments; earnings shown are **illustrative** using a 20% example fee.

## Troubleshooting

| Symptom | What to check |
|---|---|
| `npm.ps1 cannot be loaded` | On PowerShell use `npm.cmd install`, `npm.cmd run dev` |
| Port 3000 already in use | Ctrl+C in the original Park2Earn terminal; restart the new project |
| Still shows Riya/Aarav demo switch | `.env.local` missing, misnamed or dev server not restarted |
| `Invalid API key` | Use the Publishable/anon key for the same Supabase project as the URL |
| `relation public.vehicles does not exist` / `Could not find table` | Run **supabase/setup.sql** in that project's SQL editor |
| `permission denied for table` | Ensure entire schema ran successfully; verify RLS and grants |
| `Email not confirmed` | Confirm email with your real inbox; check Supabase Auth settings |
| Owner can't see request | Sign in as the correct Owner A, switch to Owner view and click Refresh data |
| `Slot already taken` | Pick another time; the backend prevents booking overlaps |

---

This version upgrades the same website you've already seen. Your original ZIP and local demo remain unaffected.
