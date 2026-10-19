import Link from "next/link";
export default function Brand({inverse=false}: {inverse?:boolean}) {
  return <Link href="/" className={`brand ${inverse?"brand-inverse":""}`} aria-label="Park2Earn home">
    <span className="brand-mark"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 25V7h9.2c5.2 0 8 2.9 8 7.1s-2.8 7-8 7H8" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/><path d="m16 25 4 3 5-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
    <span>park<span className="brand-accent">2</span>earn<span className="brand-dot">.</span></span>
  </Link>;
}
