# Park2Earn v4 — payment integration and launch preparation

This upgrade uses the supplied `park2earn-fullstack(1).zip` as its base. It retains the idle-vehicle-sharing concept and includes v3 stability, validation, accessibility, filters and CSV improvements.

## Run

```powershell
npm.cmd ci
npm.cmd run dev
```

Without Supabase configuration the local demo works. Cloud features use Supabase; payment routes use the Next.js Node server. No separate Express service is required. Node 22 LTS is a suitable environment for this tested dependency set.

## New features

- Razorpay Standard Checkout test integration: server-created orders, database pricing, consent, signature verification and captured-payment confirmation.
- Signed payment/refund webhooks, polling reconciliation and retry-safe full refunds.
- Database ownership checks, private payment records, shared per-account API rate limits and booking/payment transition guards.
- Checkout page linked from each cloud booking; owner approval precedes payment.
- Terms, Privacy, Cancellation & Refund, Contact and Support pages; footer links.
- Signup adult/terms declaration (self-declaration, not identity verification); versioned checkout acceptance persisted by the server.
- Support ticket creation, status history and downloadable complaint copies.
- Configurable real operator/grievance details with honest pre-launch placeholders.

## Guides

- `PAYMENT_SETUP.md`: credentials, database migrations, webhook setup, tests and recovery.
- `LEGAL_LAUNCH.md`: India-focused commercial launch blockers and primary sources.
- `VALIDATION.md`: exactly what was verified and what remains unverified.

## Routes

| Route | Purpose |
|---|---|
| `/explore` | Search/filter vehicles and availability |
| `/vehicles/[id]` | View vehicle and request a booking |
| `/dashboard` | Owner/renter overview; accept/reject requests |
| `/bookings` | Booking history, CSV and payment link |
| `/checkout/[id]` | Test checkout, status reconciliation and refund request |
| `/support` | Authenticated support requests and complaint copies |
| `/terms`, `/privacy`, `/refund-policy`, `/contact` | Draft trust/policy pages |
| `/api/payments/order`, `/verify`, `/status`, `/refund` | Authenticated payment APIs |
| `/api/payments/webhook` | Raw-body HMAC-verified provider events |
| `/api/support` | Authenticated ticket creation |

The API routes in the table use the full `/api/payments/` prefix for verify, status and refund.

## What this is not

This package does not make the business legally approved. Live Razorpay keys are rejected by code, and real rentals remain unavailable. No owner payouts/Route splitting, document verification, insurance integration, production admin panel, staffed support, automatic emails, tax invoicing or live mapping is included. Account deletion/privacy requests are tracked for manual handling, not automatically fulfilled.

A test payment is not a commercial booking. The gateway integration needs sandbox end-to-end testing with your credentials. See the guides before publishing.

## Checks

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

The default test command runs 63 checks. A separate optional PostgreSQL/PGlite suite contains 16 database checks. It was executed during development; it is not added to production dependencies. To run it, install `@electric-sql/pglite` in a separate directory and set `PGLITE_MODULE` to that package's absolute directory before running `node tests/sql-integration.cjs`.

## Upgrade your existing repository

Back up your project, compare files, copy this source and lockfile into the existing repository while retaining its `.git` and private `.env.local`, run the migrations appropriate to its version, and verify the build. Push only after testing. This delivery does not change your existing GitHub/Vercel deployment.
