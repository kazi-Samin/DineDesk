"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReservation } from "@/context/ReservationContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface TableBookingWidgetProps {
    restaurantName: string;
}

export default function TableBookingWidget({ restaurantName }: TableBookingWidgetProps) {
    const router = useRouter();
    const reservationContext = useReservation() as any;
    const { isAuthenticated } = useAuth();

    // Today's date formatted as YYYY-MM-DD for min date restriction
    const todayStr = new Date().toISOString().split("T")[0];

    // Date state
    const [selectedDateVal, setSelectedDateVal] = useState(todayStr);

    // Time states (3 separate portions)
    const [selectedHour, setSelectedHour] = useState("7:30");
    const [selectedAmPm, setSelectedAmPm] = useState("PM");
    const [selectedSession, setSelectedSession] = useState("Dinner");

    // Guests state & capacity popups
    const [guestsVal, setGuestsVal] = useState<number>(2);
    const [capacityMessage, setCapacityMessage] = useState<string | null>(null);
    const [authRestrictionMessage, setAuthRestrictionMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const chosenDate = e.target.value;
        if (chosenDate < todayStr) {
            setCapacityMessage("Past dates cannot be selected for reservations!");
            setTimeout(() => setCapacityMessage(null), 3500);
            return;
        }
        setCapacityMessage(null);
        setSelectedDateVal(chosenDate);
    };

    const handleGuestChange = (delta: number) => {
        setGuestsVal((prev) => {
            const updated = prev + delta;
            if (updated > 10) {
                setCapacityMessage("This is highest capacity (10 Guests)");
                setTimeout(() => setCapacityMessage(null), 3000);
                return 10;
            }
            if (updated < 1) {
                setCapacityMessage("This is lowest capacity (1 Guest)");
                setTimeout(() => setCapacityMessage(null), 3000);
                return 1;
            }
            setCapacityMessage(null);
            return updated;
        });
    };

    const handleConfirmBooking = async () => {
        setAuthRestrictionMessage(null);

        // Authentication guard restriction
        if (!isAuthenticated) {
            setAuthRestrictionMessage("Authentication required! Please sign in first to confirm your table reservation.");
            return;
        }

        setIsSubmitting(true);

        const formattedDateReadable = new Date(selectedDateVal).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        }).toUpperCase();

        const fullTimeString = `${selectedHour} ${selectedAmPm}`;

        // Safely update context if functions exist
        if (typeof reservationContext?.setSelectedRestaurant === "function") {
            reservationContext.setSelectedRestaurant(restaurantName);
        }
        if (typeof reservationContext?.setGuests === "function") {
            reservationContext.setGuests(guestsVal);
        }
        if (typeof reservationContext?.setSelectedDate === "function") {
            reservationContext.setSelectedDate(formattedDateReadable);
        }
        if (typeof reservationContext?.setSelectedTime === "function") {
            reservationContext.setSelectedTime(fullTimeString);
        }

        // Simulate brief loading delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Fire hot toast notification
        toast.success(`Table successfully reserved at ${restaurantName} for ${guestsVal} guests!`);

        setIsSubmitting(false);

        // Redirect user to the full /reservations route page
        router.push("/reservations");
    };

    return (
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 shadow-md flex flex-col gap-6 relative">

            {/* Header with single-line badge */}
            <div className="flex items-start justify-between gap-2 border-b border-outline-variant/60 pb-4">
                <div className="flex flex-col">
                    <h3 className="font-heading font-extrabold text-lg text-primary tracking-tight">
                        Book Your Table
                    </h3>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                        Dine-in table reservations with instant SMS &amp; DineDesk table confirmation.
                    </p>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-error/10 text-error uppercase tracking-wider shadow-2xs whitespace-nowrap shrink-0">
                    High Demand
                </span>
            </div>

            <div className="flex flex-col gap-4">

                {/* 1. Date Input with Calendar Icon & Past Date Restriction */}
                <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                        Date
                    </label>
                    <div className="relative flex items-center">
                        <input
                            type="date"
                            min={todayStr}
                            value={selectedDateVal}
                            onChange={handleDateChange}
                            className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-3 text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
                        />
                        <span className="absolute right-4 material-symbols-outlined text-primary text-lg pointer-events-none">
                            calendar_month
                        </span>
                    </div>
                </div>

                {/* 2. Time Input Split into 3 Separate Portions */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                        Time &amp; Session
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {/* Hour / Time Select */}
                        <select
                            value={selectedHour}
                            onChange={(e) => setSelectedHour(e.target.value)}
                            aria-label="Select reservation hour"
                            className="bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-3 text-xs font-bold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                        >
                            <option value="6:00">6:00</option>
                            <option value="6:30">6:30</option>
                            <option value="7:00">7:00</option>
                            <option value="7:30">7:30</option>
                            <option value="8:00">8:00</option>
                            <option value="8:30">8:30</option>
                            <option value="9:00">9:00</option>
                        </select>

                        {/* AM / PM Select */}
                        <select
                            value={selectedAmPm}
                            onChange={(e) => setSelectedAmPm(e.target.value)}
                            aria-label="Select AM or PM"
                            className="bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-3 text-xs font-bold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                        >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                        </select>

                        {/* Meal Session Select */}
                        <select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            aria-label="Select meal session"
                            className="bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-3 text-xs font-bold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                        >
                            <option value="Breakfast">Breakfast</option>
                            <option value="Brunch">Brunch</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                        </select>
                    </div>
                </div>

                {/* 3. Guests Selector with Up/Down Arrows & Capacity Alerts */}
                <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                        Guests Capacity
                    </label>
                    <div className="flex items-center justify-between bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2.5">
                        <span className="text-xs font-bold text-on-surface">
                            {guestsVal} {guestsVal === 1 ? "Guest" : "Guests"}
                        </span>

                        {/* Up & Down Stepper Arrows */}
                        <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg border border-outline-variant/40">
                            <button
                                onClick={() => handleGuestChange(-1)}
                                className="w-6 h-6 rounded-md bg-surface-container-lowest text-on-surface hover:text-primary font-bold flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                                type="button"
                                title="Decrease guests"
                            >
                                -
                            </button>
                            <span className="text-xs font-black text-primary w-4 text-center">
                                {guestsVal}
                            </span>
                            <button
                                onClick={() => handleGuestChange(1)}
                                className="w-6 h-6 rounded-md bg-surface-container-lowest text-on-surface hover:text-primary font-bold flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                                type="button"
                                title="Increase guests"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notification Popup Toast */}
                {capacityMessage && (
                    <div className="bg-primary/15 border border-primary/40 text-primary text-[11px] font-extrabold py-2 px-3 rounded-xl shadow-md text-center">
                        {capacityMessage}
                    </div>
                )}

            </div>

            {/* Confirm Button with Dynamic Loading State */}
            <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-bold text-xs shadow-lg hover:bg-primary/90 transition-all cursor-pointer tracking-wider uppercase mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                type="button"
            >
                {isSubmitting ? (
                    <>
                        <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                        <span>Confirming Reservation...</span>
                    </>
                ) : (
                    <span>Confirm Reservation Slot</span>
                )}
            </button>

            {/* Restricted Light Red State Banner below the reservation button */}
            {authRestrictionMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold py-3 px-4 rounded-2xl shadow-sm flex items-center justify-between gap-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base shrink-0 text-red-500">lock_person</span>
                        <span>{authRestrictionMessage}</span>
                    </div>
                    <button
                        onClick={() => router.push("/sign-in")}
                        className="text-[11px] font-bold underline text-red-800 hover:text-red-950 shrink-0 cursor-pointer"
                        type="button"
                    >
                        Sign In →
                    </button>
                </div>
            )}

            {/* Footer Guarantee */}
            <div className="flex items-center justify-center gap-4 text-[10px] font-medium text-on-surface-variant pt-1 border-t border-outline-variant/40">
                <span>No booking fee</span>
                <span>•</span>
                <span>Free cancellation up to 1 hour prior</span>
            </div>

        </div>
    );
}