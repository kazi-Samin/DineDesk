/**
 * DineDesk Dynamic Reservation Date Utilities
 *
 * Provides timezone-safe date generation and formatting for reservations:
 * - Dynamic calculation of TODAY, TOMORROW, and consecutive calendar dates.
 * - Calendar arithmetic handled safely across month, year, and leap-year boundaries.
 * - Prevents UTC date shifts by formatting local calendar components directly.
 */

export interface ReservationDateItem {
    label: string; // "TODAY", "TOMORROW", "SUN", "MON", etc.
    date: string;  // "OCT 30", "OCT 31", "NOV 01", etc.
    raw: string;   // "2026-10-30", "2026-10-31", etc.
    displayDate: string; // "TODAY, OCT 30", "TOMORROW, OCT 31", "SUN, NOV 01"
}

/**
 * Formats a Date object to YYYY-MM-DD using local calendar values (not UTC)
 * to avoid any timezone offset date shifting.
 */
export function formatDateToYMD(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a safe local Date object at noon (12:00:00)
 * to eliminate DST boundary jumps.
 */
export function parseYMDToLocalDate(ymd: string): Date {
    const [year, month, day] = ymd.split("-").map(Number);
    return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
}

/**
 * Generates dynamic reservation date options starting from baseDate.
 * Default is 7 consecutive days.
 */
export function getReservationDates(baseDate: Date = new Date(), count: number = 7): ReservationDateItem[] {
    const items: ReservationDateItem[] = [];
    const baseYear = baseDate.getFullYear();
    const baseMonth = baseDate.getMonth();
    const baseDay = baseDate.getDate();

    for (let i = 0; i < count; i++) {
        // Native JavaScript Date arithmetic safely handles month rollovers, leap years, and year rollovers
        const target = new Date(baseYear, baseMonth, baseDay + i, 12, 0, 0);

        let label: string;
        if (i === 0) {
            label = "TODAY";
        } else if (i === 1) {
            label = "TOMORROW";
        } else {
            label = target.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
        }

        const monthStr = target.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
        const dayStr = String(target.getDate()).padStart(2, "0");
        const dateStr = `${monthStr} ${dayStr}`;
        const raw = formatDateToYMD(target);

        items.push({
            label,
            date: dateStr,
            raw,
            displayDate: `${label}, ${dateStr}`,
        });
    }

    return items;
}

/**
 * Formats any arbitrary YYYY-MM-DD date selected via the calendar picker.
 * Computes difference in calendar days relative to baseDate (today)
 * to accurately display TODAY, TOMORROW, or day of the week.
 */
export function formatCustomDate(ymd: string, baseDate: Date = new Date()): ReservationDateItem {
    const target = parseYMDToLocalDate(ymd);
    const todayYMD = formatDateToYMD(baseDate);

    const [tY, tM, tD] = todayYMD.split("-").map(Number);
    const todayLocal = new Date(tY, tM - 1, tD, 12, 0, 0);
    const diffDays = Math.round((target.getTime() - todayLocal.getTime()) / (1000 * 60 * 60 * 24));

    let label: string;
    if (diffDays === 0) {
        label = "TODAY";
    } else if (diffDays === 1) {
        label = "TOMORROW";
    } else {
        label = target.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    }

    const monthStr = target.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const dayStr = String(target.getDate()).padStart(2, "0");
    const dateStr = `${monthStr} ${dayStr}`;
    const raw = formatDateToYMD(target);

    return {
        label,
        date: dateStr,
        raw,
        displayDate: `${label}, ${dateStr}`,
    };
}
