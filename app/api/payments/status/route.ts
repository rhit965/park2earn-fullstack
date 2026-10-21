import {authenticate,gateway,reconcilePayment,apiResponse,apiFailure,ApiError,type GatewayPayment} from "@/lib/server/payments";
import {isUUID} from "@/lib/payment-rules";
export const runtime="nodejs";
export async function GET(req:Request){try{
 const {db,user}=await authenticate(req,"status");const id=new URL(req.url).searchParams.get("bookingId");if(!isUUID(id))throw new ApiError("Invalid booking.");
 const {data:booking}=await db.from("bookings").select("id").eq("id",id).or(`renter_id.eq.${user.id},owner_id.eq.${user.id}`).maybeSingle();
 if(!booking)throw new ApiError("Booking not found.",404);
 let {data:row,error}=await db.from("payment_orders").select("*").eq("booking_id",id).maybeSingle();if(error)throw new ApiError("Unable to load payment status.",503);
 if(row?.status==="created"&&row.gateway_order_id){
  const payments=await gateway<{items:GatewayPayment[]}>(`orders/${row.gateway_order_id}/payments`);
  const paid=payments.items.find(p=>p.status==="captured");if(paid){await reconcilePayment(db,row,paid.id);row={...row,status:"captured",gateway_payment_id:paid.id};}
 }
 if(row?.status==="refund_pending"&&row.gateway_refund_id){
  const refund=await gateway<{id:string;payment_id:string;amount:number;status:string}>(`refunds/${row.gateway_refund_id}`);
  if(refund.status==="failed")throw new ApiError("The refund failed at the provider. Contact support; no second refund has been created.",409);
  if(refund.status==="processed"&&refund.payment_id===row.gateway_payment_id&&refund.amount===row.amount){const result=await db.rpc("settle_refund",{p_payment_id:refund.payment_id,p_refund_id:refund.id,p_amount:refund.amount});if(result.error)throw new Error();row={...row,status:"refunded"};}
 }
 return apiResponse({payment:row?{status:row.status,amount:row.amount,currency:row.currency,paymentId:row.gateway_payment_id,refundId:row.gateway_refund_id}:null});
}catch(e){return apiFailure(e)}}
