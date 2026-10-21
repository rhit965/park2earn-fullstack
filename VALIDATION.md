# V4 validation record

- 38 inherited booking/validation/export assertions: passed.
- 25 payment security and mocked API checks: passed (signatures, tampering, amount/order/currency checks, test-mode guard, consent, ownership denial, order reuse).
- 16 PostgreSQL/PGlite checks: passed. Original schema, v3 and v4 SQL executed; v4 rerun succeeded. Tested overlap rejection, SQL ownership, pricing, refund states, replay handling, rate limiting, RLS and denied client writes/RPC execution.
- Total: 79 checks. `npm test` runs 63; the optional PGlite suite runs 16 separately.
- TypeScript and production build: passed.

PGlite is an isolated PostgreSQL engine with stubbed Supabase auth schema, not your Supabase deployment. It uses one connection, so the check is not proof of multi-session race safety. Supabase Auth email confirmation, actual gateway checkout/webhooks, concurrent race/load tests and browser/device visual QA remain unverified.

No real or test gateway charge was submitted during development. No live keys are accepted by the app. No secrets are bundled. No deployment was changed.

Dependency lockfile is inherited from the verified v3 install: production-only npm audit reported zero findings in that run; the full tree had 5 high findings in the Tailwind 3/braces development chain. No new production package was added for payments. These are known remaining build-tool risks, not a clean full-tree security bill. Recheck audit before release and plan the tooling migration.

Known functional boundaries: abandoned checkout needs operator reconciliation; partial refunds are manual; policy texts are drafts; owner payouts and commercial compliance checks are absent; privacy requests and support responses need manual operations; test-mode UI is deliberate. See PAYMENT_SETUP.md and LEGAL_LAUNCH.md.
