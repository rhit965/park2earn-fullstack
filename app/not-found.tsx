import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound(){return <div className="wrap notfound"><div className="overline">404 / WRONG TURN</div><h1>Looks like you took<br/>a <em>different road.</em></h1><p>We couldn&apos;t find the page you were looking for.</p><Link href="/" className="btn btn-dark"><ArrowLeft size={18}/> Back home</Link></div>}
