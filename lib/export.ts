import type { Booking, Vehicle } from "./types";
export function csvCell(value:string|number):string {
 let s=String(value);
 if(/^[\s]*[=+@-]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
export function bookingsCSV(bookings:Booking[],vehicles:Vehicle[]):string {
 const rows:(string|number)[][]=[["Booking ID","Vehicle","Date (IST)","Pickup (IST)","Return (IST)","Hours","Amount (INR, simulated)","Status"]];
 for(const b of bookings)rows.push([b.id,vehicles.find(v=>v.id===b.vehicleId)?.title||"Vehicle",b.date,b.start,b.end,b.hours,b.total,b.status]);
 return '\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
export function downloadBookings(bookings:Booking[],vehicles:Vehicle[]){
 const url=URL.createObjectURL(new Blob([bookingsCSV(bookings,vehicles)],{type:"text/csv;charset=utf-8"}));
 const link=document.createElement("a");link.href=url;link.download="park2earn-bookings.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
