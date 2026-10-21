import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { capturedPaymentMatches } from "../payment-rules";
export class ApiError extends Error { constructor(message: string, public status = 400) { super(message) } }
export function admin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new ApiError("Server setup is incomplete. Contact support.", 503);
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function paymentConfig() {
    const key = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
    if (process.env.PAYMENTS_ENABLED !== "true" || !key || !secret) throw new ApiError("Test checkout is not enabled yet.", 503);
    // This package deliberately cannot take live money. Legal/operator approval and
    // marketplace settlement design must be completed before a live release.
    if (!key.startsWith("rzp_test_")) throw new ApiError("Live payment keys are disabled in this pre-launch release.", 503);
    return { key, secret };
}
export async function authenticate(req: Request, scope: string) {
    const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    if (!token) throw new ApiError("Please sign in again.", 401);
    const db = admin(); const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) throw new ApiError("Your session has expired. Sign in again.", 401);
    const limited = await db.rpc("consume_api_limit", { p_key: `${data.user.id}:${scope}`, p_max: scope === "support" ? 5 : 30 });
    if (limited.error) throw new ApiError("Service temporarily unavailable.", 503);
    if (!limited.data) throw new ApiError("Too many requests. Please wait a minute.", 429);
    return { db, user: data.user };
}
export async function jsonBody(req: Request) {
    if (!req.headers.get("content-type")?.includes("application/json")) throw new ApiError("JSON request required.", 415);
    const raw = await req.text(); if (raw.length > 12000) throw new ApiError("Request too large.", 413);
    try { const data = JSON.parse(raw); if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(); return data; } catch { throw new ApiError("Invalid request."); }
}
export function apiResponse(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } }) }
export function apiFailure(e: unknown) { return apiResponse({ error: e instanceof ApiError ? e.message : "Could not finish this request. Refresh payment status before retrying." }, e instanceof ApiError ? e.status : 503) }
export type GatewayPayment = { id: string; order_id: string; amount: number; currency: string; status: string };
export type PaymentRow = { id: string; booking_id: string; renter_id: string; owner_id: string; amount: number; currency: string; status: string; gateway_order_id: string; gateway_payment_id: string; gateway_refund_id: string | null };
export async function gateway<T>(path: string, body?: unknown, extraHeaders: Record<string, string> = {}): Promise<T> {
    const { key, secret } = paymentConfig();
    if (path.endsWith("/refund")) {
        console.log("Refund request check:", {
            path,
            body,
            idempotencyKey: extraHeaders["X-Refund-Idempotency"],
        });
    }
    const response = await fetch(`https://api.razorpay.com/v1/${path}`, { method: body ? "POST" : "GET", headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`, "Content-Type": "application/json", ...extraHeaders }, body: body ? JSON.stringify(body) : undefined, cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
        const details = await response.json().catch(() => null);

        console.error("Razorpay request failed:", {
            status: response.status,
            code: details?.error?.code,
            description: details?.error?.description,
        });

        throw new ApiError(
            "Payment provider could not complete the request. Check payment status or contact support.",
            502
        );
    }
    return response.json() as Promise<T>;
}
export async function reconcilePayment(db: ReturnType<typeof admin>, row: PaymentRow, paymentId: string) {
    if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId)) throw new ApiError("Invalid payment reference.");
    const payment = await gateway<GatewayPayment>(`payments/${paymentId}`);
    if (payment.id !== paymentId || !capturedPaymentMatches(payment, row)) throw new ApiError("Payment is not captured or does not match this booking. Refresh status shortly.", 409);
    const result = await db.rpc("settle_payment", { p_order_id: row.gateway_order_id, p_payment_id: payment.id, p_amount: payment.amount, p_currency: payment.currency });
    if (result.error) throw new ApiError("Payment received; reconciliation pending. Contact support.", 503);
}
