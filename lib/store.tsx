"use client";
import { createContext, useContext, type ReactNode } from "react";
import { LocalDemoProvider } from "./local-store";
import { CloudProvider } from "./cloud-store";
import type { Booking, BookingStatus, DemoUser, Vehicle } from "./types";

export type BookingInput = Pick<Booking,"vehicleId"|"date"|"start"|"end">;
export type VehicleInput = Omit<Vehicle,"id"|"ownerId"|"ownerName"|"rating"|"reviews"|"trips"|"status">;
export type ActionResult = {ok:true; booking?: Booking} | {ok:false; error:string};
export type ViewMode = "owner" | "renter";
export type Store = {
  user:string;
  mode:ViewMode;
  setMode:(mode:ViewMode)=>void;
  profile:{name:string;first:string;initials:string;role:string};
  cloudEnabled:boolean;
  authenticated:boolean;
  loading:boolean;
  lastError:string|null;
  vehicles:Vehicle[];
  bookings:Booking[];
  favorites:string[];
  toggleFavorite:(id:string)=>void;
  addVehicle:(vehicle:VehicleInput)=>Promise<ActionResult>;
  toggleVehicleStatus:(id:string)=>Promise<ActionResult>;
  createBooking:(request:BookingInput)=>Promise<ActionResult>;
  updateBooking:(id:string,status:BookingStatus)=>Promise<ActionResult>;
  availableFor:(vehicleId:string,date:string,start:string,end:string)=>string|null;
  resetDemo:()=>void;
  signIn:(email:string,password:string)=>Promise<ActionResult>;
  signUp:(name:string,email:string,password:string)=>Promise<ActionResult>;
  signOut:()=>Promise<void>;
  refresh:()=>Promise<void>;
};
export const StoreContext = createContext<Store|null>(null);
export const cloudConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export function DemoProvider({children}:{children:ReactNode}) {
  return cloudConfigured?<CloudProvider>{children}</CloudProvider>:<LocalDemoProvider>{children}</LocalDemoProvider>;
}
export function useDemo():Store {
  const value=useContext(StoreContext);
  if(!value)throw new Error("useDemo must be used within DemoProvider");
  return value;
}
export type {DemoUser};
