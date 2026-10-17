import { CustomerReservation } from "@/types/customerReservation";
import { INITIAL_CUSTOMER_RESERVATIONS } from "@/data/mockCustomerReservations";

const RESERVATIONS_STORAGE_KEY = "dinedesk_customer_reservations";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getCustomerReservations(): CustomerReservation[] {
  if (!isClient()) return INITIAL_CUSTOMER_RESERVATIONS;
  try {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        RESERVATIONS_STORAGE_KEY,
        JSON.stringify(INITIAL_CUSTOMER_RESERVATIONS)
      );
      return INITIAL_CUSTOMER_RESERVATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(
        RESERVATIONS_STORAGE_KEY,
        JSON.stringify(INITIAL_CUSTOMER_RESERVATIONS)
      );
      return INITIAL_CUSTOMER_RESERVATIONS;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading reservations from storage:", err);
    return INITIAL_CUSTOMER_RESERVATIONS;
  }
}

export function saveCustomerReservations(
  reservations: CustomerReservation[]
): void {
  if (isClient()) {
    try {
      localStorage.setItem(
        RESERVATIONS_STORAGE_KEY,
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
  if (!reservations || reservations.length === 0) return false;

  const headers = [
    "Reservation Reference",
    "Restaurant Name",
    "Neighborhood & Location",
    "Reservation Date",
    "Reservation Time",
    "Party Size",
    "Seating Area",
    "Special Instructions",
    "Reservation Status",
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const clean = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, " ");
    return `"${clean}"`;
  };

  const rows = reservations.map((res) => [
    escapeCSV(`#${res.id}`),
    escapeCSV(res.restaurantName),
    escapeCSV(res.neighborhood),
    escapeCSV(res.displayDate),
    escapeCSV(res.time),
    escapeCSV(`${res.partySize} Guests`),
    escapeCSV(res.seatingArea),
    escapeCSV(res.specialNotes || "None"),
    escapeCSV(res.statusDisplay),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `dinedesk-reservations_${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
}
