"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { StoreContext, type Store, type BookingInput, type VehicleInput, type ActionResult, type ViewMode } from "./store";
import type { Booking, BookingStatus, Vehicle } from "./types";
import { slotError, listingError } from "./validation";
import { dayOffset, hoursBetween, overlaps } from "./data";

type VehicleRow={
 id:string;owner_id:string;owner_name:string;title:string;brand:string;vehicle_type:Vehicle["type"];
 location:string;city:string;rate:number;available_from:string;available_to:string;rating:number;
 reviews:number;trips:number;features:string[];color:string;badge:string|null;description:string;status:Vehicle["status"];
};
type BookingRow={
 id:string;vehicle_id:string;owner_id:string;renter_id:string;renter_name:string;ride_date:string;
 start_time:string;end_time:string;hours:number;total:number;status:BookingStatus;created_at:string;
};
const fromVehicle=(v:VehicleRow):Vehicle=>({
 id:v.id,ownerId:v.owner_id,ownerName:v.owner_name,title:v.title,brand:v.brand,type:v.vehicle_type,
 location:v.location,city:v.city,rate:Number(v.rate),from:v.available_from.slice(0,5),to:v.available_to.slice(0,5),
 rating:Number(v.rating),reviews:v.reviews,trips:v.trips,features:v.features||[],color:v.color,
 badge:v.badge||undefined,description:v.description,status:v.status
});
const fromBooking=(b:BookingRow):Booking=>({
 id:b.id,vehicleId:b.vehicle_id,ownerId:b.owner_id,renterId:b.renter_id,renterName:b.renter_name,
 date:b.ride_date,start:b.start_time.slice(0,5),end:b.end_time.slice(0,5),hours:Number(b.hours),
 total:Number(b.total),status:b.status,createdAt:b.created_at
});
const readableError=(error:unknown):string=>{
 if(error && typeof error==="object" && "message" in error && typeof error.message==="string")return error.message;
 return "An unexpected database error occurred.";
};

export function CloudProvider({children}:{children:ReactNode}){
 const supabase=useMemo(getSupabase,[]);
 const [account,setAccount]=useState<User|null>(null);
 const [ready,setReady]=useState(false);
 const [loading,setLoading]=useState(true);
 const [mode,setMode]=useState<ViewMode>("renter");
 const [vehicles,setVehicles]=useState<Vehicle[]>([]);
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [favorites,setFavorites]=useState<string[]>([]);
 const [lastError,setLastError]=useState<string|null>(null);
 const loadEpoch=useRef(0);
 const favoriteLocks=useRef(new Set<string>());
 const user=account?.id||"guest";
 const name=(account?.user_metadata?.full_name as string|undefined)?.trim() || (account?.email?.split("@")[0]) || "Guest";
 const initials=name.split(/\s+/).map(s=>s[0]||"").join("").slice(0,2).toUpperCase();
 const profile={name,first:name.split(" ")[0],initials,role:mode==="owner"?"Vehicle owner":"Renter"};
 const authenticated=!!account;

 const reload=useCallback(async (currentUser:User|null)=>{
  const epoch=++loadEpoch.current;
  const [{data:vehicleRows,error:vehicleError}, bookingResult, favResult]=await Promise.all([
   supabase.from("vehicles").select("*").order("created_at",{ascending:false}),
   currentUser?supabase.from("bookings").select("*").order("created_at",{ascending:false}):Promise.resolve({data:[],error:null}),
   currentUser?supabase.from("favorites").select("vehicle_id"):Promise.resolve({data:[],error:null})
  ]);
  if(epoch!==loadEpoch.current)return;
  if(vehicleError)throw vehicleError;
  if(bookingResult.error)throw bookingResult.error;
  if(favResult.error)throw favResult.error;
  setVehicles(((vehicleRows||[]) as VehicleRow[]).map(fromVehicle));
  setBookings(((bookingResult.data||[]) as BookingRow[]).map(fromBooking));
  setFavorites((favResult.data||[]).map((row:{vehicle_id:string})=>row.vehicle_id));
 },[supabase]);
 const refresh=useCallback(async()=>{
  setLoading(true);
  try{const {data:{session},error}=await supabase.auth.getSession();if(error)throw error;
   const current=session?.user||null;setAccount(current);await reload(current);setLastError(null);
  }catch(e){setLastError(readableError(e));}finally{setLoading(false);}
 },[reload,supabase]);

 useEffect(()=>{
  let active=true;
  supabase.auth.getSession().then(async({data,error})=>{
   if(!active)return;
   if(error)throw error;
   const current=data.session?.user||null;setAccount(current);
   await reload(current);
  }).catch(e=>{if(active)setLastError(readableError(e));}).finally(()=>{if(active){setLoading(false);setReady(true);}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(!active)return;
   if(event==="SIGNED_IN"||event==="SIGNED_OUT"||event==="USER_UPDATED"){
    const next=session?.user||null;
    ++loadEpoch.current;setBookings([]);setFavorites([]);setAccount(next);
    // Defer async database reads out of the auth callback.
    Promise.resolve().then(()=>reload(next)).catch(e=>{if(active)setLastError(readableError(e));});
   }
  });
  return()=>{active=false;subscription.unsubscribe();};
 },[reload,supabase]);

 const signIn=async(email:string,password:string):Promise<ActionResult>=>{
  const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
  if(error)return {ok:false,error:error.message};
  setAccount(data.user);setMode("renter");
  try{await reload(data.user);}catch(e){setLastError(readableError(e));}
  return {ok:true};
 };
 const signUp=async(fullName:string,email:string,password:string):Promise<ActionResult>=>{
  if(fullName.trim().length<2)return {ok:false,error:"Enter your name (at least 2 characters)."};
  if(password.length<8)return {ok:false,error:"Password must be at least 8 characters."};
  const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:fullName.trim().slice(0,80),terms_version:"2026-10-20-v1",adult_declaration:true}}});
  if(error)return {ok:false,error:error.message};
  if(data.session&&data.user){setAccount(data.user);await reload(data.user);return {ok:true};}
  return {ok:true}; // Login screen explains email verification if no active session.
 };
 const signOut=async()=>{
  const {error}=await supabase.auth.signOut();
  if(error){setLastError(error.message);return;}
  ++loadEpoch.current;setAccount(null);setMode("renter");setBookings([]);setFavorites([]);
 };
 const availableFor=(vehicleId:string,date:string,start:string,end:string):string|null=>{
  const vehicle=vehicles.find(v=>v.id===vehicleId);
  if(!vehicle)return "Vehicle not found.";
  if(vehicle.status!=="active")return "This listing is currently paused.";
  const slotIssue=slotError(date,start,end); if(slotIssue)return slotIssue;
  if(!start||!end||hoursBetween(start,end)<=0)return "Return time must be after pickup time.";
  if(hoursBetween(start,end)>8)return "Bookings are limited to eight hours.";
  if(start<vehicle.from||end>vehicle.to)return `Available between ${vehicle.from} and ${vehicle.to}.`;
  // Other renters' bookings are private; PostgreSQL performs the authoritative conflict check.
  if(bookings.some(b=>b.vehicleId===vehicleId&&b.date===date&&["pending","confirmed"].includes(b.status)&&overlaps(start,end,b.start,b.end)))return "This time overlaps one of your existing bookings.";
  return null;
 };
 const createBooking=async(input:BookingInput):Promise<ActionResult>=>{
  if(!account)return {ok:false,error:"Please sign in before requesting a booking."};
  const error=availableFor(input.vehicleId,input.date,input.start,input.end);
  if(error)return {ok:false,error};
  const {data,error:dbError}=await supabase.rpc("request_booking",{
   p_vehicle_id:input.vehicleId,p_ride_date:input.date,p_start_time:input.start,p_end_time:input.end
  });
  if(dbError)return {ok:false,error:dbError.message};
  const booking=fromBooking(data as BookingRow);
  setBookings(prev=>[booking,...prev.filter(b=>b.id!==booking.id)]);
  try{await reload(account);}catch{setLastError("Request saved. Refresh to synchronize your dashboard.");}
  return {ok:true,booking};
 };
 const updateBooking=async(id:string,status:BookingStatus):Promise<ActionResult>=>{
  if(!account)return {ok:false,error:"Please sign in."};
  const {error}=await supabase.rpc("change_booking_status",{p_booking_id:id,p_new_status:status});
  if(error){setLastError(error.message);return {ok:false,error:error.message};}
  setBookings(prev=>prev.map(b=>b.id===id?{...b,status}:b));
  try{await reload(account);setLastError(null);}catch{setLastError("Change saved. Refresh to synchronize your dashboard.");}return {ok:true};
 };
 const addVehicle=async(input:VehicleInput):Promise<ActionResult>=>{
  if(!account)return {ok:false,error:"Please sign in to publish a listing."};
  const issue=listingError(input); if(issue)return {ok:false,error:issue};
  const {error}=await supabase.from("vehicles").insert({
   owner_id:account.id,owner_name:name,title:input.title,brand:input.brand,vehicle_type:input.type,
   location:input.location,city:input.city,rate:input.rate,available_from:input.from,available_to:input.to,
   features:input.features,color:input.color,description:input.description,status:"active"
  });
  if(error)return {ok:false,error:error.message};
  setMode("owner");try{await reload(account);}catch{setLastError("Listing saved. Refresh to load the latest data.");}return {ok:true};
 };
 const toggleVehicleStatus=async(id:string):Promise<ActionResult>=>{
  if(!account)return {ok:false,error:"Please sign in."};
  const vehicle=vehicles.find(v=>v.id===id);
  if(!vehicle||vehicle.ownerId!==account.id)return {ok:false,error:"Only the owner can update this vehicle."};
  const {error}=await supabase.from("vehicles").update({status:vehicle.status==="active"?"paused":"active"}).eq("id",id).eq("owner_id",account.id);
  if(error)return {ok:false,error:error.message};
  setVehicles(prev=>prev.map(v=>v.id===id?{...v,status:vehicle.status==="active"?"paused":"active"}:v));
  try{await reload(account);}catch{setLastError("Listing updated. Refresh to synchronize.");}return {ok:true};
 };
 const toggleFavorite=(id:string)=>{
  if(!account){setLastError("Sign in to save vehicles.");return;}
  if(favoriteLocks.current.has(id))return;
  favoriteLocks.current.add(id);const epoch=loadEpoch.current;
  const saved=favorites.includes(id);
  setFavorites(prev=>saved?prev.filter(x=>x!==id):[...prev,id]);
  void (async()=>{
   try{const {error}=saved
    ? await supabase.from("favorites").delete().eq("user_id",account.id).eq("vehicle_id",id)
    : await supabase.from("favorites").insert({user_id:account.id,vehicle_id:id});
   if(error)throw error;
   }catch(e){if(epoch===loadEpoch.current){setLastError(readableError(e));setFavorites(prev=>saved?Array.from(new Set([...prev,id])):prev.filter(x=>x!==id));}}finally{favoriteLocks.current.delete(id);}
  })();
 };
 const store:Store={user,mode,setMode,profile,cloudEnabled:true,authenticated,loading:loading||!ready,lastError,vehicles,bookings,favorites,
  toggleFavorite,addVehicle,toggleVehicleStatus,createBooking,updateBooking,availableFor,
  resetDemo:()=>{},signIn,signUp,signOut,refresh};
 return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
