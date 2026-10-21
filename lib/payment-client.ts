import {getSupabase} from "./supabase";
export async function paymentRequest(path:string,body?:unknown){
 const {data:{session}}=await getSupabase().auth.getSession();if(!session)throw new Error("Sign in to continue.");
 const r=await fetch(path,{method:body?"POST":"GET",headers:{Authorization:`Bearer ${session.access_token}`,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined,cache:"no-store"});
 const data=await r.json();if(!r.ok)throw new Error(data.error||"Unable to finish request.");return data;
}
export type CheckoutResult={razorpay_payment_id:string;razorpay_order_id:string;razorpay_signature:string};
type CheckoutInstance={open:()=>void;on:(event:string,callback:()=>void)=>void};
declare global{interface Window{Razorpay?:new(options:Record<string,unknown>)=>CheckoutInstance}}
let pending:Promise<void>|null=null;
export function loadCheckout():Promise<void>{
 if(window.Razorpay)return Promise.resolve();if(pending)return pending;
 pending=new Promise<void>((resolve,reject)=>{const script=document.createElement("script");script.src="https://checkout.razorpay.com/v1/checkout.js";script.async=true;
 const timer=setTimeout(()=>{script.remove();pending=null;reject(new Error("Checkout timed out. Please retry."));},15000);
 script.onload=()=>{clearTimeout(timer);if(window.Razorpay)resolve();else{pending=null;reject(new Error("Checkout is unavailable."));}};
 script.onerror=()=>{clearTimeout(timer);script.remove();pending=null;reject(new Error("Checkout could not load. Check your connection."));};document.body.appendChild(script);});return pending;
}
