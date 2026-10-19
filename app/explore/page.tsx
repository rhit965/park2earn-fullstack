"use client";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, CarFront, Grid2X2, Heart, Map, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import MapIllustration from "@/components/MapIllustration";
import { useDemo } from "@/lib/store";
import type { VehicleType } from "@/lib/types";
export default function Explore(){
 const {vehicles,favorites,cloudEnabled}=useDemo();
 const [query,setQuery]=useState(""),[type,setType]=useState<"All"|VehicleType>("All"),[maxRate,setMaxRate]=useState(""),[sort,setSort]=useState("featured"),[savedOnly,setSavedOnly]=useState(false),[showMap,setShowMap]=useState(false);
 const list=useMemo(()=>vehicles.filter(v=>v.status==="active" &&(type==="All"||v.type===type)&&(!maxRate||v.rate<=Number(maxRate))&&(!savedOnly||favorites.includes(v.id))&&(`${v.title} ${v.brand} ${v.location} ${v.city}`).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="price-low"?a.rate-b.rate:sort==="price-high"?b.rate-a.rate:sort==="rating"?b.rating-a.rating:b.trips-a.trips),[vehicles,type,maxRate,sort,savedOnly,favorites,query]);
 const reset=()=>{setQuery("");setType("All");setMaxRate("");setSavedOnly(false);setSort("featured")};
 return <div className="page-shell explore-page"><div className="wrap"><div className="interior-hero"><div className="overline">YOUR NEXT RIDE STARTS HERE</div><h1>Find your <span className="serif-italic accent-text">kind of ride.</span></h1><p>Discover flexible, hourly vehicle options right in your neighborhood.</p></div>
 <div className="explore-toolbar"><div className="search-field"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search vehicles or neighborhood..." aria-label="Search vehicles"/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search"><X size={16}/></button>}</div>
 <div className="sort-field"><SlidersHorizontal size={18}/><select aria-label="Sort vehicles" value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Most popular</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Highest rated</option></select></div></div>
 <div className="filter-bar"><div className="filter-chips">{(["All","Scooter","Motorcycle","Car"] as const).map(t=><button className={`filter-chip ${type===t?"selected":""}`} key={t} onClick={()=>setType(t)}>{t==="All"?"All vehicles":t==="Car"?"Cars":`${t}s`}</button>)}
 <select className="filter-chip price-chip" value={maxRate} onChange={e=>setMaxRate(e.target.value)} aria-label="Maximum hourly price"><option value="">Any price</option><option value="60">Under ₹60 / hr</option><option value="100">Under ₹100 / hr</option><option value="200">Under ₹200 / hr</option></select>
 <button className={`filter-chip ${savedOnly?"selected":""}`} onClick={()=>setSavedOnly(v=>!v)}><Heart size={14} fill={savedOnly?"currentColor":"none"}/> Saved</button></div>
 <button className="map-toggle" onClick={()=>setShowMap(v=>!v)}>{showMap?<Grid2X2 size={17}/>:<Map size={17}/>} {showMap?"Grid view":"Map preview"}</button></div>
 <div className="result-label"><span><strong>{list.length}</strong> vehicles found <span className="result-location"><MapPin size={14}/> Nashik, Maharashtra</span></span><button className="reset-link" onClick={reset}>Reset filters</button></div>
 {showMap&&<div className="explore-map"><MapIllustration/><div className="map-legend">Illustrative map · Demo locations</div></div>}
 {list.length?<div className="vehicle-grid explore-grid">{list.map(v=><VehicleCard key={v.id} vehicle={v}/>)}</div>:<div className="empty-state"><CarFront size={44}/><h3>No rides found</h3><p>{cloudEnabled&&vehicles.length===0?"No listings in the database yet. Sign in and publish the first concept vehicle!":"Try a different vehicle type, neighborhood or price filter."}</p><button className="btn btn-dark" onClick={reset}>Clear filters <ArrowRight size={17}/></button></div>}
 <div className="explore-endnote"><span>✳</span><div><strong>Don&apos;t see the right ride?</strong><p>Try changing your filters. Add a fictional listing from your dashboard to try the backend.</p></div><a href="/list-vehicle" className="text-link">List a vehicle <ArrowUpRight size={17}/></a></div>
 </div></div>;
}
