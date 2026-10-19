"use client";
import Link from "next/link";
import { ArrowUpRight, MapPin, Navigation2 } from "lucide-react";
export default function MapIllustration({compact=false}:{compact?:boolean}) {
  return <div className={`demo-map ${compact?"demo-map-compact":""}`}>
    <div className="map-road map-r1"/><div className="map-road map-r2"/><div className="map-road map-r3"/><div className="map-road map-r4"/><div className="map-road map-r5"/>
    <div className="map-block block-one"/><div className="map-block block-two"/><div className="map-block block-three"/><div className="map-block block-four"/><div className="map-block block-five"/><div className="map-block block-six"/>
    <div className="map-park"/><div className="map-lake"/>
    <svg className="map-route" viewBox="0 0 500 340" fill="none" preserveAspectRatio="none"><path d="M116 228C155 218 155 148 216 142S339 169 373 90" stroke="#1fae93" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 11"/><circle cx="116" cy="228" r="10" fill="#25b699" stroke="white" strokeWidth="5"/><circle cx="373" cy="90" r="10" fill="#25b699" stroke="white" strokeWidth="5"/></svg>
    <div className="map-pin pin-one"><Navigation2 size={17} fill="currentColor"/></div><div className="map-pin pin-two"><MapPin size={18} fill="currentColor"/></div>
    {!compact&&<><div className="map-available"><span className="live-dot"/> 6 rides nearby</div><Link className="map-view-all" href="/explore">Explore map <ArrowUpRight size={14}/></Link></>}
  </div>;
}
