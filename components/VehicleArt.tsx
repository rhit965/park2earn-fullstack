import type { VehicleType } from "@/lib/types";

export default function VehicleArt({ type="Scooter", color="mint", className="" }: {type?:VehicleType;color?:string;className?:string}) {
  const palette:Record<string,[string,string]>={ mint:["#92ecc7","#209c84"],sky:["#97d4f8","#397fcd"],lilac:["#c3b2ff","#6957bc"],peach:["#ffc69e","#d87e71"],sand:["#f5cf88","#bc824b"],cream:["#eee4c9","#aaa080"] };
  const [light,dark]=palette[color]||palette.mint;
  return <svg className={className} viewBox="0 0 470 280" role="img" aria-label={`${type} illustration`} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`paint-${color}-${type}`} x1="0" x2="1" y1="0" y2="1"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></linearGradient>
      <linearGradient id={`steel-${color}-${type}`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#dce5ef"/><stop offset="1" stopColor="#637585"/></linearGradient>
      <filter id={`shadow-${color}-${type}`} x="-40%" width="180%" y="-60%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <ellipse cx="237" cy="244" rx="158" ry="10" fill="#101924" opacity=".19" filter={`url(#shadow-${color}-${type})`}/>
    {type==="Scooter" && <>
      <g stroke="#233241" strokeWidth="8" fill="#152332"><circle cx="142" cy="209" r="39"/><circle cx="335" cy="209" r="39"/></g>
      <g fill="#aebdc7"><circle cx="142" cy="209" r="24"/><circle cx="335" cy="209" r="24"/></g>
      <g fill="#2d404c"><circle cx="142" cy="209" r="12"/><circle cx="335" cy="209" r="12"/></g>
      <path d="M143 209 164 151 284 151 333 207" stroke="#586b7a" strokeWidth="11" fill="none" strokeLinecap="round"/>
      <path d="M121 169c-6-13-2-27 15-31l78-16 19 33-20 44-51 2-18-18z" fill={`url(#paint-${color}-${type})`} stroke={dark} strokeWidth="4"/>
      <path d="M220 181c20-15 31-34 37-69l9-48 21-3 17 112-17 26-48 2z" fill={`url(#paint-${color}-${type})`} stroke={dark} strokeWidth="4"/>
      <path d="M277 69c0-6 7-10 14-10h31" stroke="#283848" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <rect x="307" y="55" width="25" height="7" rx="3.5" fill="#192836"/>
      <rect x="266" y="57" width="27" height="11" rx="5.5" fill="#263a4b"/>
      <path d="M127 133c0-13 12-22 28-22h55c12 0 17 7 17 16 0 9-13 17-29 17h-56c-9 0-15-4-15-11z" fill="#27333d"/>
      <path d="m151 168 24 19 32-3" stroke="#effff7" opacity=".48" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M274 93c8-5 17-2 20 5l5 26-31 3z" fill="#f1f5e8" stroke="#8aaba1" strokeWidth="3"/>
      <path d="M246 193h52" stroke="#293948" strokeWidth="9" strokeLinecap="round"/>
      <path d="M112 163h-16" stroke="#647384" strokeWidth="5" strokeLinecap="round"/>
    </>}
    {type==="Motorcycle" && <>
      <g stroke="#253440" strokeWidth="9" fill="#121f2c"><circle cx="130" cy="209" r="48"/><circle cx="353" cy="209" r="48"/></g>
      <g fill="#c9d3df"><circle cx="130" cy="209" r="29"/><circle cx="353" cy="209" r="29"/></g>
      <g stroke="#526576" strokeWidth="4"><path d="M130 180v58M101 209h58M353 180v58M324 209h58"/></g>
      <path d="M130 209 200 145 282 154 353 209 247 209 207 170 130 209" fill="none" stroke="#536879" strokeWidth="12" strokeLinejoin="round"/>
      <path d="M188 125c16-19 52-30 79-20l32 17-25 36-70-7z" fill={`url(#paint-${color}-${type})`} stroke={dark} strokeWidth="4"/>
      <path d="M145 128h67c11 0 18 5 18 14v3h-74l-13-8z" fill="#283542"/>
      <path d="M271 127 330 135 344 195" fill="none" stroke="#52687c" strokeWidth="12" strokeLinecap="round"/>
      <path d="M318 126 346 87" fill="none" stroke="#566b7d" strokeWidth="9" strokeLinecap="round"/>
      <path d="m331 88 37-3" stroke="#1c2f3e" strokeWidth="8" strokeLinecap="round"/>
      <path d="m339 104 20 7" stroke="#253746" strokeWidth="6" strokeLinecap="round"/>
      <path d="M154 155c-27 5-42 20-44 40" stroke="#354653" strokeWidth="8" fill="none"/>
      <path d="M178 196h100" stroke="#253844" strokeWidth="14" strokeLinecap="round"/>
      <ellipse cx="252" cy="198" rx="35" ry="30" fill="#596c7d" stroke="#263746" strokeWidth="7"/>
      <circle cx="252" cy="198" r="11" fill="#a9b8c4"/>
      <path d="M280 227h55" stroke="#7c91a2" strokeWidth="8" strokeLinecap="round"/>
      <path d="M193 121q32-12 60-8" stroke="#f5f7fa" strokeWidth="5" fill="none" opacity=".44"/>
      <path d="M309 137l25 3" stroke="#eef6fa" strokeWidth="10" strokeLinecap="round"/>
    </>}
    {type==="Car" && <>
      <g fill="#172737"><circle cx="138" cy="209" r="39"/><circle cx="343" cy="209" r="39"/></g>
      <g fill="#d4dfe5"><circle cx="138" cy="209" r="23"/><circle cx="343" cy="209" r="23"/></g>
      <g fill="#62798a"><circle cx="138" cy="209" r="10"/><circle cx="343" cy="209" r="10"/></g>
      <path d="M66 174c2-18 10-28 26-32l42-11 36-41c10-11 20-15 37-15h82c17 0 30 7 41 21l30 38 37 13c15 5 20 16 20 29v28h-35a41 41 0 0 0-82 0H179a41 41 0 0 0-82 0H65z" fill={`url(#paint-${color}-${type})`} stroke={dark} strokeWidth="4"/>
      <path d="m171 99-28 41h105V88h-43c-13 0-24 3-34 11z" fill="#496982" stroke="#eaf3fb" strokeWidth="4"/>
      <path d="M262 88v52h94l-31-37c-10-11-17-15-34-15z" fill="#496982" stroke="#eaf3fb" strokeWidth="4"/>
      <path d="M261 140v48" stroke={dark} strokeWidth="3" opacity=".5"/>
      <path d="M282 156h24" stroke="#f5f5e6" strokeWidth="6" strokeLinecap="round"/>
      <path d="M174 158h24" stroke="#f5f5e6" strokeWidth="6" strokeLinecap="round"/>
      <path d="M66 179h28" stroke="#fff5c9" strokeWidth="10" strokeLinecap="round"/>
      <path d="M389 177h28" stroke="#ff6862" strokeWidth="10" strokeLinecap="round"/>
      <path d="M105 151h24" stroke="#efffff" strokeWidth="4" opacity=".6"/>
    </>}
  </svg>;
}
