"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/lib/store";
import Brand from "./Brand";
export default function Header(){
 const pathname=usePathname(),router=useRouter();
 const {user,mode,setMode,profile,cloudEnabled,authenticated,signOut}=useDemo();
 const [open,setOpen]=useState(false),[accountOpen,setAccountOpen]=useState(false);
 const nav=[{href:"/explore",label:"Explore rides"},{href:"/how-it-works",label:"How it works"},{href:"/bookings",label:"My bookings"},{href:"/dashboard",label:"Dashboard"}];
 function switchView(next:"owner"|"renter"){setMode(next);setAccountOpen(false);setOpen(false);}
 async function exit(){await signOut();setAccountOpen(false);router.push("/login");}
 return <header className="site-header"><div className="nav-container">
  <Brand/>
  <nav className={`main-nav ${open?"nav-open":""}`} aria-label="Main navigation">
   {nav.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={pathname===item.href?"nav-active":""}>{item.label}</Link>)}
   <Link className="mobile-nav-cta" href="/list-vehicle" onClick={()=>setOpen(false)}>List a vehicle <ArrowUpRight size={16}/></Link>
  </nav>
  <div className="nav-actions">
   <Link className="nav-list-btn" href="/list-vehicle">List your vehicle <ArrowUpRight size={16}/></Link>
   <div className="account-wrapper">
    {cloudEnabled&&!authenticated?<Link className="account-btn" href="/login"><span className="avatar">?</span><span className="account-name">Sign in</span><ArrowUpRight size={14}/></Link>:<>
     <button className="account-btn" onClick={()=>setAccountOpen(v=>!v)} aria-expanded={accountOpen} aria-label="Account menu"><span className="avatar">{profile.initials}</span><span className="account-name">{profile.first}</span><ChevronDown size={14}/></button>
     {accountOpen&&<div className="account-popover">
      <div className="popover-kicker">{cloudEnabled?"YOUR ACCOUNT — CHANGE VIEW":"SWITCH DEMO ACCOUNT"}</div>
      <button className={mode==="renter"?"account-choice choice-active":"account-choice"} onClick={()=>switchView("renter")}><span className="mini-avatar purple">{cloudEnabled?"R":"RS"}</span><span><strong>{cloudEnabled?"Renter view":"Riya Sharma"}</strong><small>{cloudEnabled?profile.name:"Renter account"}</small></span></button>
      <button className={mode==="owner"?"account-choice choice-active":"account-choice"} onClick={()=>switchView("owner")}><span className="mini-avatar green">{cloudEnabled?"O":"AM"}</span><span><strong>{cloudEnabled?"Owner view":"Aarav Mehta"}</strong><small>{cloudEnabled?"Manage your listed vehicles":"Owner account"}</small></span></button>
      {cloudEnabled?<button className="account-choice logout-choice" onClick={exit}><LogOut size={17}/><span><strong>Sign out</strong><small>End this session</small></span></button>:<div className="popover-note">Demo mode · No real accounts or payments</div>}
     </div>}
    </>}
   </div>
   <button className="mobile-toggle" aria-label="Toggle navigation" onClick={()=>setOpen(v=>!v)}>{open?<X size={24}/>:<Menu size={24}/>}</button>
  </div>
 </div></header>;
}
