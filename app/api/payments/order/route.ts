import {authenticate,jsonBody,paymentConfig,gateway,apiResponse,apiFailure,ApiError} from "@/lib/server/payments";
import {isUUID,TERMS_VERSION} from "@/lib/payment-rules";
export const runtime="nodejs";
export async function POST(req:Request){try{
 const {key}=paymentConfig();const {db,user}=await authenticate(req,"order");const body=await jsonBody(req);
 if(!isUUID(body.bookingId)||body.acceptTerms!==true||body.termsVersion!==TERMS_VERSION)throw new ApiError("Accept the current terms and refund policy before checkout.");
 const {data,error}=await db.rpc("begin_payment",{p_booking_id:body.bookingId,p_user_id:user.id,p_terms_version:TERMS_VERSION});
 if(error)throw new ApiError("Booking must be yours, accepted by the owner and before pickup.",409);
 const payment=data.payment;
 if(["captured","refund_pending","refunded"].includes(payment.status))throw new ApiError("This booking already has a payment. Refresh status.",409);
 if(!data.fresh&&!payment.gateway_order_id)throw new ApiError("An earlier checkout is being reconciled. Contact support; do not create a second payment.",409);
 let orderId=payment.gateway_order_id;
 if(data.fresh){
  const order=await gateway<{id:string;amount:number;currency:string}>("orders",{amount:payment.amount,currency:"INR",receipt:payment.id,notes:{booking_id:body.bookingId,payment_record:payment.id},partial_payment:false});
  if(order.amount!==payment.amount||order.currency!=="INR"||!/^order_[a-zA-Z0-9]+$/.test(order.id))throw new ApiError("Payment order could not be verified.",502);
  const saved=await db.from("payment_orders").update({gateway_order_id:order.id,status:"created"}).eq("id",payment.id).eq("status","creating").select("id").single();
  if(saved.error)throw new ApiError("Checkout reconciliation pending. Contact support before retrying.",503);
  orderId=order.id;
 }
 return apiResponse({key,orderId,amount:payment.amount,currency:"INR",mode:"test"});
}catch(e){return apiFailure(e)}}
