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
