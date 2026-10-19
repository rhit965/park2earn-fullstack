import type { BookingStatus } from "@/lib/types";
export default function BookingBadge({status}:{status:BookingStatus}){return <span className={`status-badge status-${status}`}><span className="status-dot"/>{status[0].toUpperCase()+status.slice(1)}</span>}
