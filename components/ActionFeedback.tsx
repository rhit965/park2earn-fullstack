"use client";
import { useRef, useState, type ReactNode } from "react";
import { StoreContext, useDemo, type ActionResult, type Store } from "@/lib/store";
export default function ActionFeedback({children}:{children:ReactNode}) {
 const store=useDemo(), locks=useRef(new Set<string>());
 const [notice,setNotice]=useState<{error:boolean;text:string}|null>(null);
 const [pending,setPending]=useState(false);
 async function run(key:string,action:()=>Promise<ActionResult>,success?:string):Promise<ActionResult>{
  if(locks.current.has(key))return {ok:false,error:"This request is already processing."};
  locks.current.add(key);setPending(true);setNotice(null);
  try {
   const result=await action();
   if(!result.ok)setNotice({error:true,text:result.error});
   else if(success)setNotice({error:false,text:success});
   return result;
  } catch {const error="Could not connect. Check your connection and refresh your bookings before retrying.";setNotice({error:true,text:error});return {ok:false,error};}
  finally{locks.current.delete(key);setPending(locks.current.size>0);}
 }
 const value:Store={...store,
  createBooking:input=>run("booking",()=>store.createBooking(input),"Booking request sent. Track it in My bookings."),
  updateBooking:(id,status)=>run(`booking:${id}`,()=>store.updateBooking(id,status),`Booking ${status}.`),
  addVehicle:input=>run("listing",()=>store.addVehicle(input),"Your listing is published."),
  toggleVehicleStatus:id=>run(`listing:${id}`,()=>store.toggleVehicleStatus(id),"Listing availability updated."),
  signIn:(email,password)=>run("auth",()=>store.signIn(email,password)),
  signUp:(name,email,password)=>run("auth",()=>store.signUp(name,email,password)),
 };
 return <StoreContext.Provider value={value}>{pending&&<div className="operation-progress" role="status">Saving your changes…</div>}{children}{notice&&<div className={`action-toast ${notice.error?"toast-error":""}`} role={notice.error?"alert":"status"}><span>{notice.text}</span><button onClick={()=>setNotice(null)} aria-label="Dismiss notification">×</button></div>}</StoreContext.Provider>;
}
