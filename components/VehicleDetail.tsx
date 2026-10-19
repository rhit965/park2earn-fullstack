"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, CheckCircle2, Clock, Heart, Info, MapPin, ShieldAlert, Star, Users, Wallet2 } from "lucide-react";
import VehicleArt from "./VehicleArt";
import { dayOffset, formatINR, hoursBetween, platformFeeRate, prettyDate } from "@/lib/data";
import { useDemo } from "@/lib/store";
export default function VehicleDetail(){
 const params=useParams<{id:string}>();const router=useRouter();const {vehicles,user,authenticated,cloudEnabled,favorites,toggleFavorite,availableFor,createBooking}=useDemo();
 const vehicle=vehicles.find(v=>v.id===params.id);
 const [date,setDate]=useState(dayOffset(1)),[start,setStart]=useState("11:00"),[end,setEnd]=useState("13:00"),[error,setError]=useState(""),[justBooked,setJustBooked]=useState(false);
 const hours=hoursBetween(start,end),total=vehicle&&hours>0?Math.round(hours*vehicle.rate):0;
 const avail=vehicle?availableFor(vehicle.id,date,start,end):"Vehicle not found";
 const owner=vehicle?.ownerId===user;
 if(!vehicle)return <div className="wrap notfound"><h1>That ride isn&apos;t here.</h1><p>Maybe it took a different turn.</p><Link href="/explore" className="btn btn-dark">Back to rides <ArrowRight size={18}/></Link></div>;
 async function submit(){setError("");if(cloudEnabled&&!authenticated){router.push(`/login?next=${encodeURIComponent(`/vehicles/${vehicle!.id}`)}`);return;}const result=await createBooking({vehicleId:vehicle!.id,date,start,end});if(!result.ok){setError(result.error);return;}setJustBooked(true)}
 return <div className="page-shell detail-page"><div className="wrap"><div className="detail-breadcrumb"><Link href="/explore"><ArrowLeft size={15}/> All rides</Link><span>/</span><span>{vehicle.type}</span><span>/</span><strong>{vehicle.title}</strong></div>
 <div className="detail-layout"><div className="detail-main"><div className="detail-head"><div><span className="eyebrow-dark">{vehicle.brand.toUpperCase()} · {vehicle.type.toUpperCase()}</span><h1>{vehicle.title}</h1><div className="detail-location"><MapPin size={16}/>{vehicle.location}, {vehicle.city} <span>·</span> <Star size={15} fill="currentColor"/> <strong>{vehicle.rating.toFixed(1)}</strong> ({vehicle.reviews} reviews)</div></div><button className={`detail-save ${favorites.includes(vehicle.id)?"active":""}`} onClick={()=>toggleFavorite(vehicle.id)}><Heart size={18} fill={favorites.includes(vehicle.id)?"currentColor":"none"}/>{favorites.includes(vehicle.id)?"Saved":"Save"}</button></div>
 <div className={`detail-hero visual-${vehicle.color}`}><span className="detail-art-label">YOUR NEXT RIDE <span>↗</span></span><VehicleArt type={vehicle.type} color={vehicle.color}/><span className="detail-art-id">P2E / {vehicle.id.slice(0,6).toUpperCase()}</span></div>
 <div className="detail-section"><h2>Meet your ride</h2><p>{vehicle.description}</p><div className="detail-chips">{vehicle.features.map(f=><span key={f}><Check size={15}/>{f}</span>)}</div></div>
 <div className="detail-section"><h2>The details</h2><div className="spec-grid"><div><span>VEHICLE TYPE</span><strong>{vehicle.type}</strong></div><div><span>AVAILABILITY</span><strong>{vehicle.from} – {vehicle.to}</strong></div><div><span>TRIPS IN DEMO</span><strong>{vehicle.trips}</strong></div><div><span>PICKUP NEIGHBORHOOD</span><strong>{vehicle.location}</strong></div></div></div>
 <div className="detail-section owner-info"><span className="owner-profile-avatar">{vehicle.ownerName.split(" ").map(s=>s[0]).join("").slice(0,2)}</span><div><small>LISTED BY</small><strong>{vehicle.ownerName}</strong><span><BadgeCheck size={15}/> Demo vehicle owner</span></div></div>
 <div className="detail-warning"><ShieldAlert size={21}/><p><strong>Concept demonstration.</strong> This listing is fictional. No real vehicle access, insurance, commercial rental arrangement or payment is offered.</p></div>
 </div>
 <aside className="booking-sidebar"><div className="booking-widget"><div className="price-heading"><strong>{formatINR(vehicle.rate)} <span>/ hour</span></strong><div className="small-rating"><Star size={13} fill="currentColor"/> {vehicle.rating.toFixed(1)}</div></div><div className="booking-widget-divider"/>
 {justBooked?<div className="booking-success"><CheckCircle2 size={48}/><h3>Request sent!</h3><p>Your demo booking request has been created. The owner can sign in separately to accept it.</p><Link href="/bookings" className="btn btn-dark full-width">View my booking <ArrowRight size={17}/></Link><button className="simple-link" onClick={()=>setJustBooked(false)}>Make another request</button></div>:<>
 <div className="widget-label">WHEN DO YOU NEED IT?</div><label className="date-picker-label"><CalendarDays size={19}/><span><small>PICKUP DATE</small><input type="date" min={dayOffset(0)} value={date} onChange={e=>setDate(e.target.value)}/></span></label>
 <div className="time-grid"><label><small>FROM</small><input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label><small>TO</small><input type="time" value={end} onChange={e=>setEnd(e.target.value)}/></label></div>
 <div className="time-note"><Clock size={14}/> Available daily {vehicle.from} – {vehicle.to}</div>
 {avail&&<div className="booking-error"><Info size={15}/>{avail}</div>}{error&&error!==avail&&<div className="booking-error"><Info size={15}/>{error}</div>}
 {hours>0&&<div className="price-lines"><div><span>{formatINR(vehicle.rate)} × {hours.toLocaleString("en-IN",{maximumFractionDigits:1})} hours</span><strong>{formatINR(total)}</strong></div><div><span>Platform demo fee (included)</span><strong>{formatINR(Math.round(total*platformFeeRate))}</strong></div><div><span>Owner share (illustrative)</span><strong>{formatINR(total-Math.round(total*platformFeeRate))}</strong></div><div className="price-total"><span>Demo total</span><strong>{formatINR(total)}</strong></div></div>}
 {owner?<div className="owner-only-booking">You&apos;re viewing your own vehicle. You cannot request your own vehicle.</div>:<button className="btn btn-lime full-width" disabled={!!avail} onClick={submit}>{cloudEnabled&&!authenticated?"Sign in to request":"Request booking"} <ArrowRight size={18}/></button>}
 {cloudEnabled&&<div className="widget-disclaimer">Availability is confirmed by the database when you submit.</div>}<div className="widget-disclaimer"><ShieldAlert size={13}/> No real charges. Demo only.</div>
 </>}
 </div><div className="booking-assist"><Wallet2 size={21}/><span><strong>Flexible time slots</strong><small>Reserve only the hours you need.</small></span></div></aside>
 </div></div></div>;
}
