import {createHmac,timingSafeEqual} from "node:crypto";
export const TERMS_VERSION="2026-10-20-v1";
export function signatureValid(body:string,signature:string,secret:string):boolean {
 if(!secret||!/^([a-f0-9]{64})$/i.test(signature))return false;
 const expected=createHmac("sha256",secret).update(body).digest();
 return timingSafeEqual(expected,Buffer.from(signature,"hex"));
}
export function capturedPaymentMatches(payment:{status:string;order_id:string;amount:number;currency:string},order:{gateway_order_id:string;amount:number;currency:string}){
 return payment.status==="captured"&&payment.order_id===order.gateway_order_id&&payment.amount===order.amount&&payment.currency===order.currency;
}
export function isUUID(s:unknown):s is string{return typeof s==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);}
