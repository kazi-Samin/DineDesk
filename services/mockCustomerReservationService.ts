import { CustomerReservation } from "@/types/customerReservation";

const RESERVATIONS_STORAGE_KEY = "dinedesk_customer_reservations";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getAuthUserId(): string | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem("dinedesk_auth_user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || null;
  } catch {
    return null;
  }
}

function getReservationsKey(): string {
  const uid = getAuthUserId();
  return uid ? `dinedesk_reservations_${uid}` : RESERVATIONS_STORAGE_KEY;
}

export function getCustomerReservations(): CustomerReservation[] {
  if (!isClient()) return [];
  try {
    const key = getReservationsKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (err) {
    console.error("Error reading reservations from storage:", err);
    return [];
  }
}

export function saveCustomerReservations(
  reservations: CustomerReservation[]
): void {
  if (isClient()) {
    try {
      const key = getReservationsKey();
      localStorage.setItem(
        key,
        JSON.stringify(reservations)
      );
    } catch (err) {
      console.error("Error saving reservations to storage:", err);
    }
  }
}

export function updateReservation(
  reservations: CustomerReservation[],
  updated: CustomerReservation
): CustomerReservation[] {
  const result = reservations.map((r) => (r.id === updated.id ? updated : r));
  saveCustomerReservations(result);
  return result;
}

export function cancelCustomerReservation(
  reservations: CustomerReservation[],
  reservationId: string
): CustomerReservation[] {
  const result = reservations.map((r) => {
    if (r.id === reservationId) {
      return {
        ...r,
        status: "cancelled" as const,
        statusDisplay: "Cancelled" as const,
        isFeaturedUpcoming: false,
      };
    }
    return r;
  });
  saveCustomerReservations(result);
  return result;
}

export function rateCustomerReservation(
  reservations: CustomerReservation[],
  reservationId: string,
  rating: number,
  comment?: string
): CustomerReservation[] {
  const result = reservations.map((r) => {
    if (r.id === reservationId) {
      return {
        ...r,
        rating,
        reviewComment: comment,
      };
    }
    return r;
  });
  saveCustomerReservations(result);
  return result;
}

export function exportReservationsToCSV(
  reservations: CustomerReservation[]
): boolean {
  if (!isClient() || reservations.length === 0) return false;

  const headers = [
    "ID",
    "Restaurant",
    "Date",
    "Time",
    "Party Size",
    "Area",
    "Status",
    "Special Notes",
  ];

  const rows = reservations.map((r) => [
    `"${r.id}"`,
    `"${r.restaurantName.replace(/"/g, '""')}"`,
    `"${r.displayDate}"`,
    `"${r.time}"`,
    r.partySize,
    `"${r.seatingArea}"`,
    `"${r.statusDisplay}"`,
    `"${(r.specialNotes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `dinedesk_reservations_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
