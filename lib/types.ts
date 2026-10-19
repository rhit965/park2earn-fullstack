export type VehicleType = "Scooter" | "Motorcycle" | "Car";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
export type DemoUser = "renter-demo" | "owner-demo";

export interface Vehicle {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  brand: string;
  type: VehicleType;
  location: string;
  city: string;
  rate: number;
  from: string;
  to: string;
  rating: number;
  reviews: number;
  trips: number;
  features: string[];
  color: string;
  badge?: string;
  description: string;
  status: "active" | "paused";
}
export interface Booking {
  id: string;
  vehicleId: string;
  ownerId: string;
  renterId: string;
  renterName: string;
  date: string;
  start: string;
  end: string;
  hours: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
}
