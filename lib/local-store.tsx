"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StoreContext, type Store, type BookingInput, type VehicleInput, type ActionResult, type ViewMode } from "./store";
import { INITIAL_VEHICLES, PEOPLE, dayOffset, hoursBetween, overlaps } from "./data";
import { seedBookings } from "./data";
import type { Booking, BookingStatus, DemoUser, Vehicle } from "./types";


const STORAGE = "park2earn-demo-v1";

export function LocalDemoProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser>("renter-demo");
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [favorites, setFavorites] = useState<string[]>(["mint-activa"]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.user === "owner-demo" || saved.user === "renter-demo") setUser(saved.user);
        if (Array.isArray(saved.vehicles)) setVehicles(saved.vehicles);
        if (Array.isArray(saved.bookings)) setBookings(saved.bookings);
        if (Array.isArray(saved.favorites)) setFavorites(saved.favorites);
      }
    } catch { /* Ignore corrupted demo cache */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE, JSON.stringify({ user,vehicles,bookings,favorites }));
  }, [loaded,user,vehicles,bookings,favorites]);

  function availableFor(vehicleId:string, date:string, start:string, end:string):string|null {
    const vehicle=vehicles.find(v=>v.id===vehicleId);
    if (!vehicle) return "Vehicle not found.";
    if (vehicle.status !== "active") return "This listing is currently paused.";
    if (!date || date < dayOffset(0)) return "Choose today or a future date.";
    if (!start || !end || hoursBetween(start,end)<=0) return "Return time must be after pickup time.";
    if (hoursBetween(start,end)>8) return "Demo bookings support up to 8 hours.";
    if (start<vehicle.from || end>vehicle.to) return `This vehicle is listed between ${vehicle.from} and ${vehicle.to}.`;
    if (bookings.some(b=>b.vehicleId===vehicleId && b.date===date && (b.status==="pending"||b.status==="confirmed") && overlaps(start,end,b.start,b.end))) return "This slot overlaps an existing booking. Try another time.";
    return null;
  }
  async function createBooking(request:BookingInput):Promise<ActionResult> {
    const vehicle=vehicles.find(v=>v.id===request.vehicleId);
    if (!vehicle) return {ok:false,error:"Vehicle not found."};
    if (vehicle.ownerId===user) return {ok:false,error:"You cannot book your own vehicle."};
    const error=availableFor(request.vehicleId,request.date,request.start,request.end);
    if (error) return {ok:false,error};
    const hours=hoursBetween(request.start,request.end);
    const booking:Booking={
      id:`P2E-${Math.floor(10000+Math.random()*89999)}`,vehicleId:vehicle.id,ownerId:vehicle.ownerId,
      renterId:user,renterName:PEOPLE[user].name,date:request.date,start:request.start,end:request.end,
      hours,total:Math.round(vehicle.rate*hours),status:"pending",createdAt:new Date().toISOString()
    };
    setBookings(prev=>[booking,...prev]);
    return {ok:true,booking};
  }
  async function updateBooking(id:string,status:BookingStatus):Promise<ActionResult>{
    setBookings(prev=>prev.map(b=> {
      if (b.id!==id) return b;
      const allowed = b.ownerId===user ? ["confirmed","rejected","completed"] : ["cancelled"];
      if (!allowed.includes(status)) return b;
      if (status==="confirmed" && b.status!=="pending") return b;
      if (status==="rejected" && b.status!=="pending") return b;
      if (status==="completed" && b.status!=="confirmed") return b;
      if (status==="cancelled" && !(b.status==="pending"||b.status==="confirmed")) return b;
      return {...b,status};
    }));
    return {ok:true};
  }
  async function addVehicle(input:VehicleInput):Promise<ActionResult> {
    setVehicles(prev=>[{...input,id:`listing-${Date.now()}`,ownerId:user,ownerName:PEOPLE[user].name,rating:5,reviews:0,trips:0,status:"active"},...prev]);
    return {ok:true};
  }
  async function toggleVehicleStatus(id:string):Promise<ActionResult>{
    setVehicles(prev=>prev.map(v=>v.id===id && v.ownerId===user ? {...v,status:v.status==="active"?"paused":"active"}:v));
    return {ok:true};
  }
  function resetDemo(){
    setUser("renter-demo");setVehicles(INITIAL_VEHICLES);setBookings(seedBookings());setFavorites(["mint-activa"]);
  }
  const mode:ViewMode=user==="owner-demo"?"owner":"renter";
  const setMode=(next:ViewMode)=>setUser(next==="owner"?"owner-demo":"renter-demo");
  const value=useMemo<Store>(()=>({ user,mode,setMode,profile:PEOPLE[user],cloudEnabled:false,authenticated:true,loading:false,lastError:null,vehicles,bookings,favorites,
    toggleFavorite:(id:string)=>setFavorites(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]),
    addVehicle,toggleVehicleStatus,createBooking,updateBooking,availableFor,resetDemo,
    signIn:async()=>({ok:false,error:"Enable Supabase first to use real accounts."}),
    signUp:async()=>({ok:false,error:"Enable Supabase first to use real accounts."}),
    signOut:async()=>{},refresh:async()=>{}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }),[user,vehicles,bookings,favorites]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
