export type CustomerReservationStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled"
  | "declined";

export type SeatingAreaType =
  | "Courtyard Terrace"
  | "Courtyard"
  | "Main Dining"
  | "Omakase Counter"
  | "Family Hall"
  | "Patio Garden"
  | "Private Dining Room";

export interface CustomerReservation {
  id: string; // e.g. "RES-9402"
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  neighborhood: string;
  fullAddress: string;
  cuisine: string;
  date: string; // "YYYY-MM-DD" or formatted
  displayDate: string; // "Fri, Oct 24, 2026"
  time: string; // "8:00 PM"
  mealPeriod: "Dinner" | "Lunch" | "Brunch";
  partySize: number; // 4
  seatingArea: SeatingAreaType | string; // "Courtyard Seating #C-04"
  tableNumber?: string; // "C-04"
  specialNotes?: string;
  status: CustomerReservationStatus;
  statusDisplay: "Confirmed" | "Pending Venue" | "Completed" | "Fully Booked" | "Cancelled";
  isFeaturedUpcoming?: boolean;
  upcomingDaysLabel?: string; // "Upcoming Seating in 2 Days"
  rating?: number;
  reviewComment?: string;
  createdAt: string;
}

export type ReservationTabFilter =
  | "all"
  | "upcoming"
  | "pending"
  | "past"
  | "cancelled";
