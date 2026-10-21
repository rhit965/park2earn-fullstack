import {authenticate,jsonBody,paymentConfig,reconcilePayment,apiResponse,apiFailure,ApiError} from "@/lib/server/payments";
import {isUUID,signatureValid} from "@/lib/payment-rules";
export const runtime="nodejs";
export async function POST(req:Request){try{
 const {secret}=paymentConfig();const {db,user}=await authenticate(req,"verify");const b=await jsonBody(req);
 if(!isUUID(b.bookingId)||typeof b.paymentId!=="string"||typeof b.signature!=="string")throw new ApiError("Invalid verification request.");
 const {data:row,error}=await db.from("payment_orders").select("*").eq("booking_id",b.bookingId).eq("renter_id",user.id).single();
 if(error||!row?.gateway_order_id)throw new ApiError("Payment order not found.",404);
 if(b.orderId!==row.gateway_order_id||!signatureValid(`${row.gateway_order_id}|${b.paymentId}`,b.signature,secret))throw new ApiError("Payment signature could not be verified.");
 await reconcilePayment(db,row,b.paymentId);return apiResponse({ok:true});
}catch(e){return apiFailure(e)}}
