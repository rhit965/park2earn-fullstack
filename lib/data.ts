import type { Booking, DemoUser, Vehicle } from "./types";

export const PEOPLE: Record<DemoUser, { name: string; first: string; initials: string; role: string }> = {
  "renter-demo": { name: "Riya Sharma", first: "Riya", initials: "RS", role: "Renter" },
  "owner-demo": { name: "Aarav Mehta", first: "Aarav", initials: "AM", role: "Vehicle owner" },
};

export const INITIAL_VEHICLES: Vehicle[] = [
  { id: "mint-activa", ownerId: "owner-demo", ownerName: "Aarav Mehta", title: "Honda Activa 6G", brand: "Honda", type: "Scooter", location: "College Road", city: "Nashik", rate: 60, from: "09:00", to: "17:00", rating: 4.9, reviews: 28, trips: 42, features: ["Helmet included", "Great mileage", "Easy city rides"], color: "mint", badge: "Most popular", description: "A comfortable, easy-to-ride city scooter. Ideal for running errands around campus or exploring the neighborhood.", status: "active" },
  { id: "blue-access", ownerId: "other-nishant", ownerName: "Nishant Patil", title: "Suzuki Access 125", brand: "Suzuki", type: "Scooter", location: "Panchavati", city: "Nashik", rate: 55, from: "10:00", to: "19:00", rating: 4.8, reviews: 17, trips: 31, features: ["Smooth ride", "Helmet included", "Phone holder"], color: "sky", badge: "Great value", description: "A reliable 125cc scooter, easy to handle and a great companion for quick city trips.", status: "active" },
  { id: "violet-hunter", ownerId: "owner-demo", ownerName: "Aarav Mehta", title: "Royal Enfield Hunter", brand: "Royal Enfield", type: "Motorcycle", location: "Gangapur Road", city: "Nashik", rate: 110, from: "08:00", to: "16:00", rating: 5.0, reviews: 12, trips: 22, features: ["Full-face helmet", "Comfort seat", "Premium ride"], color: "lilac", badge: "Premium pick", description: "A distinctive, nimble motorcycle for riders who enjoy a little more character in their daily adventures.", status: "active" },
  { id: "peach-jupiter", ownerId: "other-ananya", ownerName: "Ananya Kulkarni", title: "TVS Jupiter", brand: "TVS", type: "Scooter", location: "Indira Nagar", city: "Nashik", rate: 50, from: "09:00", to: "18:00", rating: 4.7, reviews: 23, trips: 56, features: ["Under-seat storage", "Helmet included", "Easy pickup"], color: "peach", description: "A practical and friendly scooter for commuting, errands and everyday adventures.", status: "active" },
  { id: "amber-pulsar", ownerId: "other-dev", ownerName: "Dev Deshmukh", title: "Bajaj Pulsar N160", brand: "Bajaj", type: "Motorcycle", location: "Mahatma Nagar", city: "Nashik", rate: 95, from: "11:00", to: "20:00", rating: 4.9, reviews: 15, trips: 29, features: ["Disc brakes", "Helmet included", "Well maintained"], color: "sand", description: "A responsive motorcycle with comfortable handling for short local journeys.", status: "active" },
  { id: "cream-hatch", ownerId: "other-sam", ownerName: "Samir Shah", title: "Maruti Swift", brand: "Maruti Suzuki", type: "Car", location: "Canada Corner", city: "Nashik", rate: 220, from: "09:00", to: "17:00", rating: 4.8, reviews: 19, trips: 26, features: ["Air conditioned", "5 seats", "Bluetooth audio"], color: "cream", badge: "4 wheels", description: "A compact, comfortable hatchback for when your plans call for more space and flexibility.", status: "active" },
];

export function dayOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
export const seedBookings = (): Booking[] => [
  { id: "P2E-1042", vehicleId: "mint-activa", ownerId: "owner-demo", renterId: "renter-demo", renterName: "Riya Sharma", date: dayOffset(1), start: "11:00", end: "13:00", hours: 2, total: 120, status: "pending", createdAt: new Date().toISOString() },
  { id: "P2E-1028", vehicleId: "blue-access", ownerId: "other-nishant", renterId: "renter-demo", renterName: "Riya Sharma", date: dayOffset(3), start: "13:00", end: "15:00", hours: 2, total: 110, status: "confirmed", createdAt: new Date().toISOString() },
  { id: "P2E-0993", vehicleId: "violet-hunter", ownerId: "owner-demo", renterId: "other-dev", renterName: "Dev Deshmukh", date: dayOffset(-5), start: "10:00", end: "13:00", hours: 3, total: 330, status: "completed", createdAt: new Date().toISOString() },
];

export function formatINR(value: number): string { return `₹${value.toLocaleString("en-IN")}`; }
export function prettyDate(iso: string): string {
  if (!iso) return "Select date";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}
export function hoursBetween(start:string,end:string):number {
  const [sh,sm] = start.split(":").map(Number), [eh,em] = end.split(":").map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
}
export function toMinutes(time:string):number { const [h,m]=time.split(":").map(Number); return h*60+m; }
export function overlaps(startA:string,endA:string,startB:string,endB:string):boolean {
  return toMinutes(startA)<toMinutes(endB) && toMinutes(endA)>toMinutes(startB);
}
export const platformFeeRate = 0.2;
