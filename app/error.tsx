"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="wrap notfound"><h1>Let’s try that again.</h1><p>This page couldn’t load. Your saved bookings are not removed.</p><button className="btn btn-dark" onClick={reset}>Reload page</button><a className="simple-link" href="/explore">Back to rides</a></div>}
