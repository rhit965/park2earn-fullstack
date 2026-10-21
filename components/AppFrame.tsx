"use client";
import {useEffect,useState,type ReactNode} from "react";
import { DemoProvider, useDemo } from "@/lib/store";
import Header from "./Header";
import Footer from "./Footer";
import ActionFeedback from "./ActionFeedback";
function Content({children}:{children:ReactNode}) {
 const {loading,lastError,refresh,cloudEnabled}=useDemo();
 const [online,setOnline]=useState(true);
 useEffect(()=>{const update=()=>setOnline(navigator.onLine);update();window.addEventListener("online",update);window.addEventListener("offline",update);return()=>{window.removeEventListener("online",update);window.removeEventListener("offline",update);};},[]);
 return <><a className="skip-link" href="#main-content">Skip to content</a><Header/>{!online&&<div className="connection-banner" role="status">You are offline. {cloudEnabled?"Reconnect before saving changes.":"The demo still works in this browser."}</div>}{lastError&&<div className="connection-banner" role="alert"><span>{lastError}</span><button onClick={()=>void refresh()}>Retry sync</button></div>}<main id="main-content" tabIndex={-1}>{loading?<div className="wrap page-skeleton" role="status" aria-label="Loading Park2Earn"><div className="skeleton skeleton-heading"/><div className="skeleton skeleton-line"/><div className="skeleton-grid">{[1,2,3].map(i=><div key={i} className="skeleton skeleton-card"/>)}</div><p>Getting your rides ready…</p></div>:children}</main><Footer/></>;
}
export default function AppFrame({children}:{children:ReactNode}){return <DemoProvider><ActionFeedback><Content>{children}</Content></ActionFeedback></DemoProvider>}
