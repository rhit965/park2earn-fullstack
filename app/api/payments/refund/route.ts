import { authenticate, jsonBody, gateway, apiResponse, apiFailure, ApiError } from "@/lib/server/payments";
import { isUUID } from "@/lib/payment-rules";
export const runtime = "nodejs";
export async function POST(req: Request) {
    try {
        const { db, user } = await authenticate(req, "refund"); const b = await jsonBody(req); if (!isUUID(b.bookingId) || b.confirm !== true) throw new ApiError("Confirm cancellation and refund.");
        const { data, error } = await db.rpc("begin_refund", {
            p_booking_id: b.bookingId,
            p_user_id: user.id,
        });

        if (error) {
            throw new ApiError(
                "Self-service refund is only available before pickup.",
                409
            );
        }

        const p = Array.isArray(data)
            ? (data.length === 1 ? data[0] : null)
            : data;

        if (
            !p ||
            !isUUID(p.id) ||
            !/^pay_[a-zA-Z0-9]+$/.test(p.gateway_payment_id ?? "") ||
            !Number.isInteger(p.amount) ||
            p.amount <= 0
        ) {
            throw new ApiError("Invalid payment record. Refund not sent.", 503);
        }
        if (p.status === "refunded") return apiResponse({ status: "refunded" });
        if (p.gateway_refund_id) return apiResponse({ status: "refund_pending" });
        // DEBUG: Check Razorpay payment before refund
        const payment = await gateway<{
            id: string;
            status: string;
            captured: boolean;
            amount: number;
            amount_refunded: number;
        }>(`payments/${p.gateway_payment_id}`);

        console.log("RAZORPAY PAYMENT CHECK:", {
            status: payment.status,
            captured: payment.captured,
            originalAmount: payment.amount,
            alreadyRefunded: payment.amount_refunded,
            remainingAmount: payment.amount - payment.amount_refunded,
            requestedRefund: p.amount,
        });
        const refund = await gateway<{ id: string; payment_id: string; amount: number; status: string }>(`payments/${p.gateway_payment_id}/refund`, { amount: p.amount, speed: "normal", notes: { booking_id: p.booking_id } }, { "X-Refund-Idempotency": p.id });
        if (refund.payment_id !== p.gateway_payment_id || refund.amount !== p.amount) throw new ApiError("Refund reconciliation pending.", 503);
        const saved = await db.from("payment_orders").update({ gateway_refund_id: refund.id }).eq("id", p.id); if (saved.error) throw new Error();
        if (refund.status === "processed") { const settled = await db.rpc("settle_refund", { p_payment_id: refund.payment_id, p_refund_id: refund.id, p_amount: refund.amount }); if (settled.error) throw new Error(); }
        return apiResponse({ status: refund.status === "processed" ? "refunded" : "refund_pending" });
    } catch (e) { return apiFailure(e) }
}
