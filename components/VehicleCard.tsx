"use client";
import Link from "next/link";
import { ArrowUpRight, Heart, MapPin, Star } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { formatINR } from "@/lib/data";
import { useDemo } from "@/lib/store";
import VehicleArt from "./VehicleArt";
export default function VehicleCard({vehicle,bookingQuery=""}:{vehicle:Vehicle;bookingQuery?:string}){
  const {favorites,toggleFavorite}=useDemo();
  return <article className="vehicle-card">
    <div className={`vehicle-visual visual-${vehicle.color}`}>
      {vehicle.badge&&<span className="vehicle-tag">{vehicle.badge}</span>}
      <button className={`favorite-btn ${favorites.includes(vehicle.id)?"is-favorite":""}`} onClick={()=>toggleFavorite(vehicle.id)} aria-label={favorites.includes(vehicle.id)?"Remove saved vehicle":"Save vehicle"}><Heart size={19} fill={favorites.includes(vehicle.id)?"currentColor":"none"}/></button>
      <Link href={`/vehicles/${vehicle.id}${bookingQuery}`} className="vehicle-visual-link" aria-label={`View ${vehicle.title}`}><VehicleArt type={vehicle.type} color={vehicle.color}/></Link>
    </div>
    <div className="vehicle-meta"><span>{vehicle.type}</span><span className="vehicle-rating"><Star size={13} fill="currentColor"/>{vehicle.reviews?vehicle.rating.toFixed(1):"New"} <span>({vehicle.reviews})</span></span></div>
    <Link href={`/vehicles/${vehicle.id}${bookingQuery}`} className="vehicle-name">{vehicle.title}</Link>
    <div className="vehicle-location"><MapPin size={14}/>{vehicle.location}, {vehicle.city}</div>
    <div className="vehicle-bottom"><div><strong>{formatINR(vehicle.rate)}</strong><span> / hour</span></div><Link href={`/vehicles/${vehicle.id}${bookingQuery}`} className="card-arrow" aria-label={`View ${vehicle.title}`}><ArrowUpRight size={20}/></Link></div>
  </article>;
}
