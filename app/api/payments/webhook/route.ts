import {admin,reconcilePayment,gateway,apiResponse,apiFailure,ApiError} from "@/lib/server/payments";
import {signatureValid} from "@/lib/payment-rules";
export const runtime="nodejs";
export async function POST(req:Request){try{
 const raw=await req.text();if(raw.length>131072)throw new ApiError("Payload too large.",413);
 const secret=process.env.RAZORPAY_WEBHOOK_SECRET;if(!secret)throw new ApiError("Webhook is not configured.",503);
 if(!signatureValid(raw,req.headers.get("x-razorpay-signature")||"",secret))throw new ApiError("Invalid webhook signature.",401);
 const event=JSON.parse(raw);const db=admin();
 if(event.event==="payment.captured"){
  const entity=event.payload?.payment?.entity;if(!entity?.order_id||!entity?.id)throw new ApiError("Invalid payment event.");
  const {data:row}=await db.from("payment_orders").select("*").eq("gateway_order_id",entity.order_id).maybeSingle();
  // Unknown orders can belong to other products. Retry if our order is still being attached.
  if(!row){if(entity.notes?.payment_record)throw new ApiError("Order reconciliation pending.",503);return apiResponse({received:true});}
  await reconcilePayment(db,row,entity.id);
 }
 if(event.event==="refund.processed"){
  const entity=event.payload?.refund?.entity;if(!/^rfnd_[a-zA-Z0-9]+$/.test(entity?.id||""))throw new ApiError("Invalid refund event.");
  const refund=await gateway<{id:string;payment_id:string;amount:number;status:string}>(`refunds/${entity.id}`);
  if(refund.status!=="processed")throw new ApiError("Refund not processed.",409);
  const {data:row}=await db.from("payment_orders").select("id").eq("gateway_payment_id",refund.payment_id).maybeSingle();
  if(row){const result=await db.rpc("settle_refund",{p_payment_id:refund.payment_id,p_refund_id:refund.id,p_amount:refund.amount});if(result.error)throw new Error();}
 }
 return apiResponse({received:true});
}catch(e){return apiFailure(e)}}
