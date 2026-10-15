export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "seated"
  | "completed"
  | "cancelled";

export type SeatingZone =
  | "Courtyard Terrace"
  | "Main Dining Hall"
  | "Private Heritage Dining";

export type TableStatus = "available" | "reserved" | "occupied" | "assigned";

export interface TableEntity {
  id: string; // e.g., "C-1", "T-3", "P-1"
  zone: SeatingZone;
  label: string; // e.g. "Table C-4 (Courtyard · 4-top)"
  shortName: string; // e.g. "C-4"
  capacity: number;
  status: TableStatus;
  reservationId?: string;
  currentGuest?: string;
  notes?: string;
}

export interface ActivityTimelineEvent {
  time: string;
  event: string;
  type?: "info" | "success" | "warning" | "alert";
}

export interface VendorReservation {
  id: string; // e.g., "#TB-4091"
  restaurantId: string;
  restaurantName: string;
  guestName: string;
  initials: string;
  phone: string;
  email?: string;
  guestType?: "VIP Diner" | "Corporate Guest" | "First-time Diner" | "Frequent Diner" | "Standard Diner";
  guestSubtitle?: string; // e.g., "3rd Visit", "Apex Holdings", "12 Visits"
  reservationDate: string; // "YYYY-MM-DD" or "Today, Oct 24, 2025"
  displayDate?: string; // "Tonight, Oct 24" or "Tomorrow, Oct 25"
  reservationTime: string; // e.g. "8:00 PM"
  mealPeriod: "Dinner" | "Lunch" | "Brunch";
  partySize: number;
  preferredZone: SeatingZone | string;
  assignedTableId?: string; // e.g., "C-4"
  occasion?: string; // e.g., "10th Wedding Anniversary"
  occasionBadge?: string; // e.g., "High Preference", "Acoustic Preference"
  occasionType?: "celebration" | "business" | "accessibility" | "standard";
  guestNotes?: string;
  status: ReservationStatus;
  createdAt: string;
  requestAge: string; // e.g., "15 mins ago", "1.5 hrs ago"
  rejectionReason?: string;
  activityTimeline: ActivityTimelineEvent[];
}

export interface WalkInFormInput {
  guestName: string;
  phone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  mealPeriod: "Dinner" | "Lunch" | "Brunch";
  preferredZone: SeatingZone;
  tableId: string;
  notes?: string;
}

export interface HostLogEntry {
  id: string;
  title: string;
  message: string;
  type: "kitchen_capacity" | "floral_stock" | "general";
  icon: string;
  timestamp: string;
}

export interface ReservationStats {
  confirmedCovers: number;
  allocatedTablesCount: number;
  pendingCount: number;
  oldestPendingAge: string;
  urgentSlots: boolean;
  occupancyRate: number;
  peakWindow: string;
  totalTables: number;
  availableWalkInCount: number;
  mainHallCount: number;
  courtyardCount: number;
  heritageCount: number;
}

export interface ReservationRequest {
  restaurantId: string;
  restaurantName: string;
  guests: number;
  date: string;
  time: string;
  seatingArea: "Main Dining Hall" | "Quiet Courtyard" | "Private Family Booth" | string;
  specialRequests: string[];
  notes?: string;
  status: "pending" | "confirmed" | "rejected";
}

export interface ReservationConfirmation extends ReservationRequest {
  id: string;
  createdAt: string;
}

