import {
  VendorReservation,
  TableEntity,
  ReservationStats,
  WalkInFormInput,
} from "@/types/reservation";
import {
  DEFAULT_TABLES,
  SEED_VENDOR_RESERVATIONS,
} from "@/data/mockVendorReservations";

const RESERVATIONS_STORAGE_KEY = "dinedesk_vendor_reservations";
const TABLES_STORAGE_KEY = "dinedesk_vendor_tables";

// Safe local storage helpers
function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getVendorReservations(): VendorReservation[] {
  if (!isClient()) return SEED_VENDOR_RESERVATIONS;
  try {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        RESERVATIONS_STORAGE_KEY,
        JSON.stringify(SEED_VENDOR_RESERVATIONS)
      );
      return SEED_VENDOR_RESERVATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading vendor reservations:", err);
    return SEED_VENDOR_RESERVATIONS;
  }
}

export function saveVendorReservations(reservations: VendorReservation[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
  } catch (err) {
    console.error("Error writing vendor reservations:", err);
  }
}

export function getVendorTables(): TableEntity[] {
  if (!isClient()) return DEFAULT_TABLES;
  try {
    const raw = localStorage.getItem(TABLES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(DEFAULT_TABLES));
      return DEFAULT_TABLES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading vendor tables:", err);
    return DEFAULT_TABLES;
  }
}

export function saveVendorTables(tables: TableEntity[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
  } catch (err) {
    console.error("Error writing vendor tables:", err);
  }
}

export function resetReservationData(): {
  reservations: VendorReservation[];
  tables: TableEntity[];
} {
  if (isClient()) {
    try {
      localStorage.removeItem(RESERVATIONS_STORAGE_KEY);
      localStorage.removeItem(TABLES_STORAGE_KEY);
    } catch (e) {
      console.error("Reset error:", e);
    }
  }
  return {
    reservations: SEED_VENDOR_RESERVATIONS,
    tables: DEFAULT_TABLES,
  };
}

export function confirmReservation(
  reservationId: string,
  tableId: string
): { success: boolean; message: string; reservations: VendorReservation[]; tables: TableEntity[] } {
  const reservations = getVendorReservations();
  const tables = getVendorTables();

  const resIndex = reservations.findIndex((r) => r.id === reservationId);
  if (resIndex === -1) {
    return { success: false, message: "Reservation not found", reservations, tables };
  }

  const reservation = reservations[resIndex];
  const table = tables.find((t) => t.id === tableId);

  if (!table) {
    return { success: false, message: `Table ${tableId} not found`, reservations, tables };
  }

  if (table.capacity < reservation.partySize) {
    return {
      success: false,
      message: `Table ${table.shortName} capacity (${table.capacity} pax) is too small for party of ${reservation.partySize}`,
      reservations,
      tables,
    };
  }

  if (table.status === "occupied") {
    return {
      success: false,
      message: `Table ${table.shortName} is currently occupied by seated diners`,
      reservations,
      tables,
    };
  }

  // Update reservation
  const updatedRes: VendorReservation = {
    ...reservation,
    status: "confirmed",
    assignedTableId: tableId,
    activityTimeline: [
      {
        time: "Just now",
        event: `Reservation confirmed for ${reservation.partySize} guests. Allocated Table ${table.shortName}. Notification sent to diner.`,
        type: "success",
      },
      ...reservation.activityTimeline,
    ],
  };
  reservations[resIndex] = updatedRes;

  // Update table
  const updatedTables = tables.map((t) => {
    if (t.id === tableId) {
      return {
        ...t,
        status: "reserved" as const,
        reservationId: reservation.id,
        currentGuest: `${reservation.guestName} (${reservation.partySize} Guests)`,
      };
    }
    // If table previously assigned to this res, free it
    if (t.reservationId === reservation.id && t.id !== tableId) {
      return {
        ...t,
        status: "available" as const,
        reservationId: undefined,
        currentGuest: undefined,
      };
    }
    return t;
  });

  saveVendorReservations(reservations);
  saveVendorTables(updatedTables);

  return {
    success: true,
    message: `Reservation ${reservation.id} confirmed at ${table.shortName}`,
    reservations,
    tables: updatedTables,
  };
}

export function rejectReservation(
  reservationId: string,
  reason?: string
): { success: boolean; message: string; reservations: VendorReservation[]; tables: TableEntity[] } {
  const reservations = getVendorReservations();
  const tables = getVendorTables();

  const resIndex = reservations.findIndex((r) => r.id === reservationId);
  if (resIndex === -1) {
    return { success: false, message: "Reservation not found", reservations, tables };
  }

  const reservation = reservations[resIndex];
  const defaultReason =
    reason || "Declined due to peak shift capacity and kitchen load constraints.";

  const updatedRes: VendorReservation = {
    ...reservation,
    status: "rejected",
    rejectionReason: defaultReason,
    activityTimeline: [
      {
        time: "Just now",
        event: `Booking rejected by Host. Reason: ${defaultReason}`,
        type: "warning",
      },
      ...reservation.activityTimeline,
    ],
  };
  reservations[resIndex] = updatedRes;

  // Release table if it was assigned
  const updatedTables = tables.map((t) => {
    if (t.reservationId === reservation.id) {
      return {
        ...t,
        status: "available" as const,
        reservationId: undefined,
        currentGuest: undefined,
      };
    }
    return t;
  });

  saveVendorReservations(reservations);
  saveVendorTables(updatedTables);

  return {
    success: true,
    message: `Reservation ${reservation.id} rejected and archived`,
    reservations,
    tables: updatedTables,
  };
}

export function seatReservation(
  reservationId: string
): { success: boolean; message: string; reservations: VendorReservation[]; tables: TableEntity[] } {
  const reservations = getVendorReservations();
  const tables = getVendorTables();

  const resIndex = reservations.findIndex((r) => r.id === reservationId);
  if (resIndex === -1) {
    return { success: false, message: "Reservation not found", reservations, tables };
  }

  const reservation = reservations[resIndex];
  const tableId = reservation.assignedTableId;

  const updatedRes: VendorReservation = {
    ...reservation,
    status: "seated",
    activityTimeline: [
      {
        time: "Just now",
        event: `Guest arrived at front desk and marked Seated at Table ${tableId || "assigned floor"}`,
        type: "success",
      },
      ...reservation.activityTimeline,
    ],
  };
  reservations[resIndex] = updatedRes;

  const updatedTables = tables.map((t) => {
    if (t.id === tableId || t.reservationId === reservation.id) {
      return {
        ...t,
        status: "occupied" as const,
        reservationId: reservation.id,
        currentGuest: `${reservation.guestName} (${reservation.partySize} Guests)`,
      };
    }
    return t;
  });

  saveVendorReservations(reservations);
  saveVendorTables(updatedTables);

  return {
    success: true,
    message: `${reservation.guestName} marked as Seated`,
    reservations,
    tables: updatedTables,
  };
}

export function completeReservation(
  reservationId: string
): { success: boolean; message: string; reservations: VendorReservation[]; tables: TableEntity[] } {
  const reservations = getVendorReservations();
  const tables = getVendorTables();

  const resIndex = reservations.findIndex((r) => r.id === reservationId);
  if (resIndex === -1) {
    return { success: false, message: "Reservation not found", reservations, tables };
  }

  const reservation = reservations[resIndex];

  const updatedRes: VendorReservation = {
    ...reservation,
    status: "completed",
    activityTimeline: [
      {
        time: "Just now",
        event: "Service concluded, table departed, dining bill closed",
        type: "info",
      },
      ...reservation.activityTimeline,
    ],
  };
  reservations[resIndex] = updatedRes;

  const updatedTables = tables.map((t) => {
    if (t.reservationId === reservation.id) {
      return {
        ...t,
        status: "available" as const,
        reservationId: undefined,
        currentGuest: undefined,
      };
    }
    return t;
  });

  saveVendorReservations(reservations);
  saveVendorTables(updatedTables);

  return {
    success: true,
    message: `Table service completed for ${reservation.guestName}`,
    reservations,
    tables: updatedTables,
  };
}

export function cancelReservation(
  reservationId: string,
  reason?: string
): { success: boolean; message: string; reservations: VendorReservation[]; tables: TableEntity[] } {
  const reservations = getVendorReservations();
  const tables = getVendorTables();

  const resIndex = reservations.findIndex((r) => r.id === reservationId);
  if (resIndex === -1) {
    return { success: false, message: "Reservation not found", reservations, tables };
  }

  const reservation = reservations[resIndex];
  const cancelReason = reason || "Cancelled by host desk.";

  const updatedRes: VendorReservation = {
    ...reservation,
    status: "cancelled",
    rejectionReason: cancelReason,
    activityTimeline: [
      {
        time: "Just now",
        event: `Reservation cancelled. Note: ${cancelReason}`,
        type: "warning",
      },
      ...reservation.activityTimeline,
    ],
  };
  reservations[resIndex] = updatedRes;

  const updatedTables = tables.map((t) => {
    if (t.reservationId === reservation.id) {
      return {
        ...t,
        status: "available" as const,
        reservationId: undefined,
        currentGuest: undefined,
      };
    }
    return t;
  });

  saveVendorReservations(reservations);
  saveVendorTables(updatedTables);

  return {
    success: true,
    message: `Reservation ${reservation.id} cancelled and table released`,
    reservations,
    tables: updatedTables,
  };
}

export function createWalkInReservation(
  input: WalkInFormInput
): { success: boolean; message: string; reservations: VendorReservation[]; tables: TableEntity[] } {
  const reservations = getVendorReservations();
  const tables = getVendorTables();

  const table = tables.find((t) => t.id === input.tableId);
  if (!table) {
    return { success: false, message: `Table ${input.tableId} not found`, reservations, tables };
  }

  if (table.capacity < input.partySize) {
    return {
      success: false,
      message: `Table ${table.shortName} capacity (${table.capacity}) is too small for ${input.partySize} guests`,
      reservations,
      tables,
    };
  }

  if (table.status === "occupied") {
    return {
      success: false,
      message: `Table ${table.shortName} is already occupied`,
      reservations,
      tables,
    };
  }

  const initials = input.guestName
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "WI";

  const newId = `#TB-${Math.floor(1000 + Math.random() * 9000)}`;

  const newReservation: VendorReservation = {
    id: newId,
    restaurantId: "the-maple-and-vine",
    restaurantName: "The Maple & Vine",
    guestName: input.guestName,
    initials,
    phone: input.phone || "(313) 555-0100",
    guestType: "Standard Diner",
    guestSubtitle: "Manual Walk-in",
    reservationDate: input.reservationDate,
    displayDate: "Today",
    reservationTime: input.reservationTime,
    mealPeriod: input.mealPeriod,
    partySize: Number(input.partySize),
    preferredZone: input.preferredZone,
    assignedTableId: input.tableId,
    occasion: "Walk-in Diner",
    occasionBadge: "Direct Entry",
    occasionType: "standard",
    guestNotes: input.notes || "Host created direct floor seating ticket.",
    status: "seated",
    createdAt: new Date().toISOString(),
    requestAge: "Just now",
    activityTimeline: [
      {
        time: "Just now",
        event: `Walk-in party seated directly at Table ${table.shortName}`,
        type: "success",
      },
    ],
  };

  const updatedReservations = [newReservation, ...reservations];

  const updatedTables = tables.map((t) => {
    if (t.id === input.tableId) {
      return {
        ...t,
        status: "occupied" as const,
        reservationId: newId,
        currentGuest: `${input.guestName} (${input.partySize} Guests)`,
      };
    }
    return t;
  });

  saveVendorReservations(updatedReservations);
  saveVendorTables(updatedTables);

  return {
    success: true,
    message: `Walk-in ${newId} created and seated at ${table.shortName}`,
    reservations: updatedReservations,
    tables: updatedTables,
  };
}

export function sendGuestMessage(
  reservationId: string,
  message: string
): { success: boolean; reservations: VendorReservation[] } {
  const reservations = getVendorReservations();
  const resIndex = reservations.findIndex((r) => r.id === reservationId);
  if (resIndex === -1) {
    return { success: false, reservations };
  }

  const reservation = reservations[resIndex];
  const updatedRes: VendorReservation = {
    ...reservation,
    activityTimeline: [
      {
        time: "Just now",
        event: `Host message sent: "${message}"`,
        type: "info",
      },
      ...reservation.activityTimeline,
    ],
  };
  reservations[resIndex] = updatedRes;
  saveVendorReservations(reservations);

  return { success: true, reservations };
}

export function getReservationStats(
  reservations: VendorReservation[],
  tables: TableEntity[]
): ReservationStats {
  const confirmedOrSeated = reservations.filter(
    (r) => r.status === "confirmed" || r.status === "seated"
  );
  const confirmedCovers = confirmedOrSeated.reduce((acc, r) => acc + r.partySize, 0);

  const pending = reservations.filter((r) => r.status === "pending");
  const pendingCount = pending.length;
  const oldestPending = pending[pending.length - 1];
  const oldestPendingAge = oldestPending ? oldestPending.requestAge : "None";

  const totalTables = tables.length;
  const occupiedOrReserved = tables.filter(
    (t) => t.status === "occupied" || t.status === "reserved" || t.status === "assigned"
  ).length;

  const occupancyRate = totalTables > 0 ? Math.round((occupiedOrReserved / totalTables) * 100) : 0;
  const availableWalkInCount = tables.filter((t) => t.status === "available").length;

  const mainHallCount = tables.filter((t) => t.zone === "Main Dining Hall").length;
  const courtyardCount = tables.filter((t) => t.zone === "Courtyard Terrace").length;
  const heritageCount = tables.filter((t) => t.zone === "Private Heritage Dining").length;

  return {
    confirmedCovers: confirmedCovers || 64,
    allocatedTablesCount: occupiedOrReserved || 18,
    pendingCount,
    oldestPendingAge: oldestPendingAge.includes("ago") ? oldestPendingAge : "1.5 hrs ago",
    urgentSlots: pendingCount > 0,
    occupancyRate: occupancyRate || 82,
    peakWindow: "8:00 PM – 10:00 PM",
    totalTables: 24,
    availableWalkInCount: availableWalkInCount || 6,
    mainHallCount: 8,
    courtyardCount: 6,
    heritageCount: 4,
  };
}
