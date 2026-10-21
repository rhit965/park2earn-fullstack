"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bike, CheckCircle2, CircleUserRound, ShieldCheck } from "lucide-react";
import { useDemo } from "@/lib/store";

export default function Login(){
 const router=useRouter();
 const {mode,setMode,cloudEnabled,authenticated,signIn,signUp}=useDemo();
 const [form,setForm]=useState<"login"|"signup">("login");
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [accepted,setAccepted]=useState(false);
 const [working,setWorking]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const [nextPage,setNextPage]=useState("/dashboard");
 useEffect(()=>{const intended=new URLSearchParams(window.location.search).get("next")||"/dashboard";setNextPage(/^\/(?![\/\\])[^\\\x00-\x1f]*$/.test(intended)?intended:"/dashboard");},[]);
 useEffect(()=>{if(cloudEnabled&&authenticated)router.replace(nextPage);},[cloudEnabled,authenticated,nextPage,router]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setMessage("");if(form==="signup"&&!accepted){setError("Confirm you are 18 or older and accept the terms.");return;}setWorking(true);
  const result=form==="signup"?await signUp(name,email,password):await signIn(email,password);
  setWorking(false);
  if(!result.ok){setError(result.error);return;}
  if(form==="signup")setMessage("Account created! If email confirmation is enabled, verify your email, then sign in. Otherwise you will enter automatically.");
  else router.push(nextPage);
 }
 if(!cloudEnabled)return <DemoPersonas mode={mode} setMode={setMode} onNavigate={()=>router.push("/dashboard")}/>;
 return <div className="page-shell login-page"><div className="wrap"><div className="login-panel">
  <div className="login-intro"><div className="overline">REAL ACCOUNTS. STILL A SAFE DEMO.</div><h1>Let's get<br/><em>moving.</em></h1><p>Sign in to save concept vehicle listings, requests, approvals and favorites in the database. Rentals and payments are simulated.</p><div className="login-benefits"><span><CheckCircle2 size={17}/> Supabase authentication</span><span><CheckCircle2 size={17}/> Private booking history</span><span><CheckCircle2 size={17}/> No real rental charges</span></div></div>
  <div className="auth-form-panel"><div className="auth-tabs"><button className={form==="login"?"auth-tab-active":""} onClick={()=>{setForm("login");setError("");setMessage("");}}>Sign in</button><button className={form==="signup"?"auth-tab-active":""} onClick={()=>{setForm("signup");setError("");setMessage("");}}>Create account</button></div>
   <h2>{form==="login"?"Welcome back":"Join Park2Earn"}</h2><p>One account can list vehicles and request other owners' vehicles.</p>
   <form className="auth-fields" onSubmit={submit}>
    {form==="signup"&&<label className="field"><span>YOUR NAME</span><input minLength={2} maxLength={80} required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label>}
    <label className="field"><span>EMAIL ADDRESS</span><input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
    <label className="field"><span>PASSWORD</span><input type="password" minLength={form==="signup"?8:1} required autoComplete={form==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters for signup"/></label>
    {form==="signup"&&<label className="consent-row"><input type="checkbox" required checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>I am 18 or older and agree to the <Link href="/terms">Terms</Link>. I have read the <Link href="/privacy">Privacy Notice</Link>.</span></label>}
    {error&&<div className="booking-error" role="alert">{error}</div>}
    {message&&<div className="auth-message" role="status">{message}</div>}
    <button className="btn btn-dark full-width" disabled={working} type="submit">{working?"Working...":form==="login"?"Sign in":"Create account"} <ArrowRight size={18}/></button>
   </form>
   <div className="widget-disclaimer"><ShieldCheck size={14}/> Demo only. Do not enter driving license or vehicle-registration information.</div>
  </div>
 </div></div></div>;
}

function DemoPersonas({mode,setMode,onNavigate}:{mode:"owner"|"renter";setMode:(mode:"owner"|"renter")=>void;onNavigate:()=>void}){
 function go(next:"owner"|"renter"){setMode(next);onNavigate();}
 return <div className="page-shell login-page"><div className="wrap"><div className="login-panel"><div className="login-intro"><div className="overline">PICK A DEMO PERSONA</div><h1>Take a look<br/>from <em>both sides.</em></h1><p>No signup, password, or payment required. Choose a role to explore the vehicle-sharing concept.</p><div className="login-benefits"><span><CheckCircle2 size={17}/> Local demo data</span><span><CheckCircle2 size={17}/> Interactive flows</span><span><CheckCircle2 size={17}/> No real bookings</span></div></div><div className="login-choices"><button onClick={()=>go("renter")} className={`persona-card ${mode==="renter"?"current-persona":""}`}><div className="persona-icon"><CircleUserRound size={28}/></div><span className="persona-label">RENTER EXPERIENCE</span><h3>Riya Sharma</h3><p>Browse nearby vehicles, make requests, and save favorites.</p><strong>Enter as renter <ArrowRight size={18}/></strong></button><button onClick={()=>go("owner")} className={`persona-card ${mode==="owner"?"current-persona":""}`}><div className="persona-icon mint"><Bike size={28}/></div><span className="persona-label">OWNER EXPERIENCE</span><h3>Aarav Mehta</h3><p>List vehicles, manage availability and accept or decline requests.</p><strong>Enter as owner <ArrowRight size={18}/></strong></button></div></div><div className="auth-demo-note">Want real database-backed accounts? Follow <Link href="https://supabase.com/dashboard">Supabase setup</Link> in the included README.</div></div></div>;
}
