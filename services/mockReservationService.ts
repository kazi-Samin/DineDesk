import { ReservationRequest, ReservationConfirmation } from "@/types/reservation";

const reservationsStore: ReservationConfirmation[] = [];

export async function createReservation(
  payload: ReservationRequest
): Promise<ReservationConfirmation> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const confirmation: ReservationConfirmation = {
    ...payload,
    id: `RES-${Date.now().toString().slice(-6)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  reservationsStore.push(confirmation);

  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(sessionStorage.getItem("dinedesk_reservations") || "[]");
      sessionStorage.setItem("dinedesk_reservations", JSON.stringify([...stored, confirmation]));
    } catch {
      // ignore storage errors
    }
  }

  return confirmation;
}

export function getSessionReservations(): ReservationConfirmation[] {
  if (typeof window !== "undefined") {
    try {
      return JSON.parse(sessionStorage.getItem("dinedesk_reservations") || "[]");
    } catch {
      return reservationsStore;
    }
  }
  return reservationsStore;
}
