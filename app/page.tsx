"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarClock, Check, CirclePlay, Clock3, Coins, LocateFixed, MapPin, MoveUpRight, ShieldCheck, Sparkles, Star, Wallet2 } from "lucide-react";
import { useDemo } from "@/lib/store";
import { INITIAL_VEHICLES } from "@/lib/data";
import VehicleCard from "@/components/VehicleCard";
import VehicleArt from "@/components/VehicleArt";
import MapIllustration from "@/components/MapIllustration";
export default function Home(){
 const {vehicles}=useDemo();
 return <>
 <section className="hero-section"><div className="hero-haze one"/><div className="hero-haze two"/><div className="wrap hero-layout">
   <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-pulse"/> SMARTER SHARING, BETTER MOVING <Sparkles size={14}/></div>
    <h1>Make your<br/><span className="serif-italic">idle time</span><br/><span className="hero-green">move.</span></h1>
    <p>Why let your vehicle sit around? Share it when you&apos;re not using it, or find a ride right when you need one. Simple, flexible, local.</p>
    <div className="hero-actions"><Link href="/explore" className="btn btn-lime">Find your ride <ArrowUpRight size={19}/></Link><Link href="/list-vehicle" className="btn btn-outline-light">List your vehicle <ArrowRight size={18}/></Link></div>
    <div className="hero-proof"><div className="proof-avatars"><span>RM</span><span>AP</span><span>DK</span><span>NS</span></div><div><div className="proof-stars">★★★★★ <span>Demo marketplace</span></div><small>Built for neighbors, campuses & communities</small></div></div>
   </div>
   <div className="hero-art"><div className="hero-grid-lines"/><div className="hero-vehicle-glow"/><div className="hero-main-vehicle"><VehicleArt type="Scooter" color="mint"/></div>
    <div className="hero-orbit orbit-top"><div className="orbit-icon"><MapPin size={21}/></div><span>Vehicle nearby<strong>College Road, Nashik</strong></span></div>
    <div className="hero-orbit orbit-mid"><span className="tiny-green-dot"/> AVAILABLE TO RIDE</div>
    <div className="hero-orbit orbit-bottom"><div className="orbit-icon yellow"><Coins size={20}/></div><span>Potential earnings<strong>From just ₹60 / hr</strong></span><ArrowUpRight size={16}/></div>
    <div className="hero-art-caption">MOVE SMARTER <span>↗</span> 01 / 03</div>
   </div>
 </div><div className="hero-bottom-strip"><div className="wrap strip-inner"><span>YOUR CITY. YOUR SCHEDULE.</span><span>SHARE MORE. OWN LESS.</span><span>UNLOCK WHAT&apos;S PARKED.</span><span className="strip-star">✳</span></div></div>
 </section>
 <section className="section discover-section"><div className="wrap"><div className="section-head"><div><div className="overline">DISCOVER THE POSSIBILITIES</div><h2>Good rides.<br/><span className="muted-heading">Better plans.</span></h2></div><div className="section-head-side"><p>From quick errands to longer plans, your next ride could be right around the corner.</p><Link href="/explore" className="text-link">Explore all vehicles <ArrowUpRight size={17}/></Link></div></div>
 <div className="vehicle-grid">{vehicles.filter(v=>v.status==="active").slice(0,3).map(v=><VehicleCard key={v.id} vehicle={v}/>)}</div>
 </div></section>
 <section className="section feature-section"><div className="wrap"><div className="feature-header"><div className="overline">THE IDEA IS SIMPLE</div><h2>One platform.<br/><span className="muted-heading">Two ways to win.</span></h2></div>
 <div className="feature-grid"><div className="feature-panel dark-feature"><div className="feature-panel-top"><div className="feature-number">01 / FOR OWNERS</div><span className="feature-circle"><ArrowUpRight size={20}/></span></div><div className="owner-panel-art"><div className="owner-clock"><Clock3 size={20}/> 10:00 AM – 4:00 PM</div><VehicleArt color="lilac" type="Motorcycle"/><div className="owner-earn"><span>THIS WEEK&apos;S POTENTIAL</span><strong>₹1,280 <span>↗</span></strong></div></div><h3>Park it.<br/>Share it. Earn.</h3><p>Your vehicle has downtime. Turn those hours into possibilities, entirely on your schedule.</p><Link href="/list-vehicle" className="feature-btn">List a vehicle <ArrowUpRight size={17}/></Link></div>
 <div className="feature-panel light-feature"><div className="feature-panel-top"><div className="feature-number">02 / FOR RIDERS</div><span className="feature-circle"><ArrowUpRight size={20}/></span></div><div className="rider-panel-art"><MapIllustration compact/><div className="rider-float"><span className="rider-float-icon"><LocateFixed size={20}/></span><span><strong>Nearby rides</strong><small>Ready when you are</small></span><ArrowUpRight size={18}/></div></div><h3>Find a ride.<br/>Make it happen.</h3><p>Need a scooter for a couple of hours? Discover nearby options and send a request in minutes.</p><Link href="/explore" className="feature-btn">Find a vehicle <ArrowUpRight size={17}/></Link></div></div>
 </div></section>
 <section className="section steps-section"><div className="wrap"><div className="section-head"><div><div className="overline">HOW IT WORKS</div><h2>From parked<br/><span className="muted-heading">to purposeful.</span></h2></div><Link href="/how-it-works" className="text-link">See the full process <ArrowUpRight size={18}/></Link></div>
 <div className="steps-grid"><div className="step-item"><span className="step-counter">01</span><div className="step-icon"><CalendarClock size={30}/></div><h3>List or discover</h3><p>Owners publish their free hours. Riders search for vehicles available nearby.</p></div><div className="step-item"><span className="step-counter">02</span><div className="step-icon"><BadgeCheck size={30}/></div><h3>Request & confirm</h3><p>Pick your time slot, send a booking request, and get the owner&apos;s approval.</p></div><div className="step-item"><span className="step-counter">03</span><div className="step-icon"><Wallet2 size={30}/></div><h3>Ride & wrap up</h3><p>Meet at the agreed pickup spot, return on time, and complete the demo trip.</p></div></div>
 </div></section>
 <section className="cta-section"><div className="wrap"><div className="cta-card"><span className="cta-ring ring-one"/><span className="cta-ring ring-two"/><div className="cta-content"><div className="overline">THE ROAD IS YOURS</div><h2>Every parked ride<br/>has <em>potential.</em></h2><p>Start exploring a new way to move around your neighborhood.</p><div className="cta-buttons"><Link href="/explore" className="btn btn-lime">Explore rides <ArrowUpRight size={18}/></Link><Link href="/list-vehicle" className="btn btn-outline-light">List your vehicle <ArrowRight size={18}/></Link></div></div><div className="cta-vehicle"><VehicleArt type="Scooter" color="peach"/></div></div></div></section>
 <div className="demo-notice"><ShieldCheck size={16}/> This is a concept demo. Vehicle listings, payments and availability are fictional examples for learning purposes.</div>
 </>;
}
