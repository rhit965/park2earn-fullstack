import type { Booking, BookingStatus, Vehicle } from "./types";
import type { VehicleInput } from "./store";
export const timeValid = (s:string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export function slotError(date:string,start:string,end:string,now=Date.now()):string|null {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!timeValid(start)||!timeValid(end)) return "Enter a valid date and time.";
 const midnight=new Date(`${date}T00:00:00Z`);
 if(!Number.isFinite(midnight.getTime())||midnight.toISOString().slice(0,10)!==date)return "Enter a valid calendar date.";
 const pickup=Date.parse(`${date}T${start}:00+05:30`), dropoff=Date.parse(`${date}T${end}:00+05:30`);
 if(pickup<=now)return "Choose a future pickup time (India time).";
 if(dropoff<=pickup)return "Return time must be after pickup time.";
 if(dropoff-pickup>8*3600000)return "Bookings are limited to eight hours.";
 return null;
}
export function transitionError(b:Booking|undefined,user:string,status:BookingStatus):string|null {
 if(!b)return "Booking not found.";
 const allowed=b.ownerId===user
  ? (b.status==="pending"&&["confirmed","rejected"].includes(status))||(b.status==="confirmed"&&status==="completed")
  : b.renterId===user&&["pending","confirmed"].includes(b.status)&&status==="cancelled";
 return allowed?null:"You cannot make this change to this booking.";
}
export function listingError(v:VehicleInput):string|null {
 for(const [name,value,max] of [["Vehicle name",v.title,120],["Brand",v.brand,80],["Location",v.location,120],["City",v.city,80]] as const)
  if(value.trim().length<2||value.trim().length>max)return `${name} must contain 2–${max} characters.`;
 if(!["Scooter","Motorcycle","Car"].includes(v.type))return "Choose a valid vehicle type.";
 if(!Number.isFinite(v.rate)||v.rate<10||v.rate>10000)return "Hourly rate must be between ₹10 and ₹10,000.";
 if(!timeValid(v.from)||!timeValid(v.to)||Date.parse(`2000-01-01T${v.to}:00Z`)-Date.parse(`2000-01-01T${v.from}:00Z`)<3600000)return "Availability must be at least one hour, ending the same day.";
 if(v.description.length>2000)return "Keep the description under 2,000 characters.";
 return null;
}
export function isVehicle(v:unknown):v is Vehicle {
 if(!v||typeof v!=="object")return false;
 const x=v as Vehicle;
 return [x.id,x.ownerId,x.ownerName,x.title,x.brand,x.location,x.city,x.description,x.color].every(s=>typeof s==="string")&&["Scooter","Motorcycle","Car"].includes(x.type)&&["active","paused"].includes(x.status)&&Number.isFinite(x.rate)&&Number.isFinite(x.rating)&&Number.isFinite(x.reviews)&&Number.isFinite(x.trips)&&typeof x.from==="string"&&typeof x.to==="string"&&timeValid(x.from)&&timeValid(x.to)&&Array.isArray(x.features)&&x.features.every(s=>typeof s==="string");
}
export function isBooking(v:unknown):v is Booking {
 if(!v||typeof v!=="object")return false;
 const b=v as Booking;
 return [b.id,b.vehicleId,b.ownerId,b.renterId,b.renterName,b.date,b.start,b.end,b.createdAt].every(s=>typeof s==="string")&&Number.isFinite(b.total)&&Number.isFinite(b.hours)&&["pending","confirmed","completed","cancelled","rejected"].includes(b.status);
}
