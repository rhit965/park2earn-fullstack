# Razorpay test integration setup

## 1. Database

Apply SQL through your Supabase SQL Editor:

- Fresh project: `supabase/setup.sql` once, then `upgrade-v3.sql`, then `upgrade-v4-payments.sql`.
- Existing v2 project: v3 then v4 upgrades only.
- Existing v3 project: v4 only.

Back up an existing database first. The upgrades retain records. V4 is transactional and rerunnable. Never run the fresh setup twice: its original policy declarations are one-time setup.

The migration adds payment_orders, support_requests and api_rate_limits, with RLS and service-role-only mutation RPCs. Existing bookings keep their status. Existing owner view toggles do not create a second identity.

## 2. Environment

Keep these in `.env.local` for development and in protected server environment settings for deployment. Never commit them or send them in chat.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_SEPARATE_WEBHOOK_SECRET
PAYMENTS_ENABLED=true
```

Only the Supabase URL/public key may be public. The service-role key bypasses RLS and must stay server-side. Razorpay's public checkout key is returned by the order API; the secret never is. Restart/rebuild after changing environment settings. `.env.example` also contains operator/contact variables; fill them with real information only.

`paymentConfig()` rejects all non-test Razorpay key IDs. There is no environment switch that silently enables real charges in this release. Do not remove that guard merely to launch; complete the separate legal, security, settlement and operational work first.

## 3. Gateway and webhook

Use Razorpay Test Mode and test API keys. Configure automatic capture in the gateway dashboard. Register an HTTPS webhook URL:

`https://YOUR-DEPLOYMENT/api/payments/webhook`

Subscribe to `payment.captured` and `refund.processed`, using the same webhook secret as the server. The webhook verifies the original raw-body signature before processing and fetches authoritative provider data. Replayed events are idempotent at the database layer. Failed payment attempts do not mark bookings paid; the same order can be retried. Test-mode events and credentials must correspond to the same account.

Localhost cannot directly receive provider callbacks; use a private HTTPS staging deployment or a trusted development tunnel and set its environment secrets privately.

## 4. Full test

1. Create Owner A and Renter B with separate emails/browser profiles. Complete confirmation if enabled.
2. Owner A lists a fictional vehicle. Renter B requests a future slot. Owner A accepts it.
3. Renter B opens My bookings → Payment & refund.
4. Read and accept the test terms, then Test pay. Use only the gateway's documented test instruments; do not enter real card details.
5. The server creates one order using the saved booking total in paise. On callback it validates the signature against the server-stored order ID, then fetches the payment and checks captured status, amount, currency and order binding.
6. Check captured status, gateway dashboard record and database row. Simulate a page close after payment, then refresh status to verify recovery through polling/webhooks.
7. Before pickup, confirm cancellation/refund. The booking becomes cancelled; the payment stays refund_pending until provider confirmation. Repeating the request reuses the same refund idempotency key.
8. Verify another user cannot view/pay/refund this booking; cannot call service-only SQL; cannot change amounts; duplicate requests reuse the order.

## Failure recovery and operation

- `creating` with no gateway order ID: an external request may have succeeded despite timeout. The code intentionally does not create another order. An authorised operator must inspect gateway orders using the payment row UUID as receipt, compare booking, amount and currency, then reconcile the existing order. Do not delete the row or create a second order without resolving its financial state.
- A created but abandoned checkout blocks direct cancellation to avoid a late payment arriving after the slot was released. This prototype requires support reconciliation for that case; automatic expiry/cancellation is a remaining production task.
- For captured but unverified payments, refresh status or replay the signed webhook after resolving service errors. Do not use the browser success callback alone as proof.
- Pending refund: retry uses the same UUID idempotency key and the same request body. If a refund ID exists, poll/replay its webhook; do not issue a new refund. A failed provider refund requires operator review.
- Partial refunds are not automated. The full-refund handler rejects mismatched amounts; reconcile partial/manual adjustments separately.
- Support requests are in the Supabase table. There is no public admin interface or notification worker; a designated authorised operator must monitor and update status manually.
- Rate limits are database-backed per account/per minute (30 payment API calls per route, 5 support submissions). Broader WAF/IP controls and monitoring remain production tasks.
- Normal order creation is not retried automatically after an uncertain provider response. This is intentional duplicate-charge protection.

## Settlement and accounting boundary

The implementation collects test payments into a single test merchant account. It does not pay vehicle owners, hold escrow, split settlements or produce GST tax invoices. Design and obtain approval for the marketplace settlement model with the gateway and your accountant before any live rollout. Dashboard “owner earnings” remain illustrative, not balances owed or paid.

## Primary technical references

- https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
- https://razorpay.com/docs/webhooks/validate-test/
- https://github.com/razorpay/markdown-docs/blob/master/api/refunds/normal-refunds-idempotent.md

No payment credentials were supplied during implementation; external gateway transactions have not been executed or verified.
