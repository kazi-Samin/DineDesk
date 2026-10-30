"use client";

import { useState, useMemo, useEffect } from "react";
import { useReservation } from "@/context/ReservationContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getReservationDates, formatCustomDate, formatDateToYMD } from "@/lib/reservationDates";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

const LUNCH_TIMES = ["12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"];
const DINNER_TIMES = ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM"];

const SEATING_AREAS = [
    { title: "Main Hall", desc: "Warm & lively ambiance near the chef's hearth" },
    { title: "Courtyard", desc: "Quiet outdoor garden with ambient lantern lighting" },
    { title: "Family Booth", desc: "Enclosed alcove dining designed for intimate gatherings" },
];

export default function ReservationsPage() {
    const router = useRouter();
    const authContext = useAuth() as any;
    const { isAuthenticated } = authContext;
    const {
        restaurantInfo,
        guests,
        setGuests,
        selectedDate,
        setSelectedDate,
        selectedRawDate: contextRawDate,
        setSelectedRawDate,
        selectedTime,
        setSelectedTime,
        seatingArea,
        setSeatingArea,
    } = useReservation() as any;

    // Dynamically calculate 7 consecutive reservation dates starting with TODAY at runtime
    const dateOptions = useMemo(() => getReservationDates(), []);
    const todayItem = dateOptions[0];

    // Track active raw date (YYYY-MM-DD)
    const [localRawDate, setLocalRawDate] = useState<string>(() => {
        if (contextRawDate) return contextRawDate;
        const match = dateOptions.find((d) => d.displayDate === selectedDate);
        return match ? match.raw : todayItem.raw;
    });

    const activeRawDate = contextRawDate || localRawDate || todayItem.raw;

    // Automatically ensure valid TODAY default selection on page load, removing any stale hardcoded dates
    useEffect(() => {
        if (!selectedDate || selectedDate.includes("OCT 20")) {
            setSelectedDate?.(todayItem.displayDate);
            if (setSelectedRawDate) setSelectedRawDate(todayItem.raw);
            setLocalRawDate(todayItem.raw);
        }
    }, [selectedDate, setSelectedDate, setSelectedRawDate, todayItem]);

    // Professional reservation date label for confirmation button
    // Hidden when today is selected; shows "Tomorrow" or "on <Date>" for future dates
    const buttonDateText = useMemo(() => {
        if (!selectedDate) return "";
        const upper = selectedDate.toUpperCase();
        if (upper.includes("TODAY") || activeRawDate === todayItem.raw) {
            return "";
        }
        if (upper.includes("TOMORROW")) {
            return " Tomorrow";
        }
        return ` on ${selectedDate}`;
    }, [selectedDate, activeRawDate, todayItem.raw]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authRestrictionMessage, setAuthRestrictionMessage] = useState<string | null>(null);

    const currentRestaurant = restaurantInfo?.name || "The Culinary House";
    const restaurantId = restaurantInfo?.id || "restaurant-1";

    const handleConfirmReservation = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthRestrictionMessage(null);

        if (!isAuthenticated) {
            setAuthRestrictionMessage("Authentication required! Please sign in first to confirm your table reservation.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Retrieve token robustly from AuthContext or LocalStorage/Cookies
            const token =
                authContext?.token ||
                authContext?.user?.token ||
                authContext?.user?.accessToken ||
                (typeof window !== "undefined" ? (
                    localStorage.getItem("token") ||
                    localStorage.getItem("accessToken") ||
                    localStorage.getItem("authToken") ||
                    localStorage.getItem("dinedesk_auth_token") ||
                    localStorage.getItem("dinedesk_token") ||
                    localStorage.getItem("auth_token") ||
                    JSON.parse(localStorage.getItem("user") || "{}")?.token ||
                    JSON.parse(localStorage.getItem("user") || "{}")?.accessToken
                ) : "");

            console.log("Resolved Auth Token:", token ? "Found ✅" : "Missing ❌");

            const effectiveRawDate = activeRawDate || todayItem.raw;
            const effectiveDisplayDate = selectedDate || todayItem.displayDate;

            const reservationPayload = {
                restaurantId: String(restaurantId),
                restaurantName: String(currentRestaurant),
                restaurantImage: String(restaurantInfo?.coverUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"),
                neighborhood: String(restaurantInfo?.neighborhood || "Downtown"),
                fullAddress: String(restaurantInfo?.address || "Global City"),
                cuisine: String(restaurantInfo?.cuisine || "Fine Dining"),
                date: effectiveRawDate,
                displayDate: String(effectiveDisplayDate),
                time: String(selectedTime || "8:00 PM"),
                mealPeriod: "Dinner",
                partySize: Number(guests) || 2,
                seatingArea: String(seatingArea || "Main Hall"),
                tableNumber: "12",
                reservedFor: `${effectiveRawDate}T12:00:00.000Z`,
                specialNotes: "Confirmed via DineDesk Web Portal",
            };

            const response = await fetch(`${API_BASE_URL}/api/v1/reservations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(reservationPayload),
                credentials: "include",
            });

            if (response.ok) {
                toast.success(`Table successfully reserved at ${currentRestaurant} for ${guests} guests!`);
                router.push("/dashboard/customer/reservations");
            } else {
                const errData = await response.json();
                toast.error(errData.message || "Failed to confirm reservation.");
            }
        } catch (error) {
            console.error("Reservation submission network error:", error);
            toast.error("Network error. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f8f9f6] text-[#1b3b2b] pt-32 pb-24 px-4 sm:px-8 lg:px-16 selection:bg-[#1b3b2b] selection:text-white">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">

                {/* Header Banner */}
                <div className="flex flex-col gap-2 text-center sm:text-left">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#C05621]">
                        Instant Executive Reservation
                    </span>
                    <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1b3b2b] tracking-tight">
                        Reserve Your Table Stewardship
                    </h1>
                    <p className="text-sm text-[#1b3b2b]/70 font-medium">
                        Securing VIP seating across premier culinary establishments.
                    </p>
                </div>

                {/* Main Reservation Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/90 backdrop-blur-2xl border border-[#1b3b2b]/15 p-6 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(27,59,43,0.06)] flex flex-col gap-8"
                >
                    {/* Active Restaurant Display */}
                    <div className="flex flex-col gap-2 bg-[#f8f9f6] p-4 rounded-2xl border border-[#1b3b2b]/15">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C05621]">
                            Selected Establishment
                        </span>
                        <h3 className="font-heading font-extrabold text-lg text-[#1b3b2b]">
                            {currentRestaurant}
                        </h3>
                    </div>

                    {/* Number of Guests */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-extrabold uppercase tracking-wider text-[#1b3b2b]">
                                Number of Diners
                            </label>
                            <span className="text-xs font-bold text-[#C05621] bg-[#C05621]/10 px-3 py-1 rounded-full">
                                Table for {guests} {guests === 1 ? "guest" : "guests"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setGuests((prev: number) => Math.max(1, prev - 1))}
                                className="w-12 h-12 rounded-2xl bg-[#f8f9f6] border border-[#1b3b2b]/20 text-[#1b3b2b] font-black flex items-center justify-center hover:bg-[#1b3b2b] hover:text-white transition-all cursor-pointer shadow-xs"
                                type="button"
                            >
                                -
                            </button>
                            <div className="flex-1 grid grid-cols-5 sm:grid-cols-8 gap-2">
                                {[1, 2, 4, 6, 8].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setGuests(num)}
                                        className={`py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${guests === num
                                            ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-md"
                                            : "bg-[#f8f9f6] text-[#1b3b2b] border-[#1b3b2b]/15 hover:border-[#1b3b2b]"
                                            }`}
                                        type="button"
                                    >
                                        {num === 8 ? "8+" : num}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setGuests((prev: number) => prev + 1)}
                                className="w-12 h-12 rounded-2xl bg-[#f8f9f6] border border-[#1b3b2b]/20 text-[#1b3b2b] font-black flex items-center justify-center hover:bg-[#1b3b2b] hover:text-white transition-all cursor-pointer shadow-xs"
                                type="button"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Select Date: Quick Pills + Custom Calendar Picker */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-extrabold uppercase tracking-wider text-[#1b3b2b]">
                                Select Reservation Date
                            </label>

                            <div className="flex items-center gap-2 bg-[#f8f9f6] px-3 py-1.5 rounded-xl border border-[#1b3b2b]/20">
                                <span className="material-symbols-outlined text-sm text-[#C05621]">calendar_month</span>
                                <input
                                    type="date"
                                    min={todayItem.raw}
                                    value={activeRawDate}
                                    onChange={(e) => {
                                        const chosenVal = e.target.value;
                                        if (!chosenVal) return;
                                        if (chosenVal < todayItem.raw) {
                                            toast.error("Past dates cannot be selected for reservations!");
                                            return;
                                        }
                                        const formatted = formatCustomDate(chosenVal);
                                        setLocalRawDate(formatted.raw);
                                        if (setSelectedRawDate) setSelectedRawDate(formatted.raw);
                                        setSelectedDate(formatted.displayDate);
                                    }}
                                    className="bg-transparent text-xs font-bold text-[#1b3b2b] focus:outline-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Quick Date Pills */}
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {dateOptions.map((item) => {
                                const isSelected = activeRawDate === item.raw;
                                return (
                                    <button
                                        key={item.raw}
                                        onClick={() => {
                                            setLocalRawDate(item.raw);
                                            if (setSelectedRawDate) setSelectedRawDate(item.raw);
                                            setSelectedDate(item.displayDate);
                                        }}
                                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border transition-all cursor-pointer ${isSelected
                                            ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-md"
                                            : "bg-[#f8f9f6] text-[#1b3b2b] border-[#1b3b2b]/15 hover:border-[#1b3b2b]"
                                            }`}
                                        type="button"
                                    >
                                        <span className={`text-[10px] font-black uppercase ${isSelected ? "text-[#C05621]" : "text-[#C05621]"}`}>
                                            {item.label}
                                        </span>
                                        <span className="font-heading font-extrabold text-xs mt-0.5">
                                            {item.date}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Seating Time Sessions */}
                    <div className="flex flex-col gap-4">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-[#1b3b2b]">
                            Seating Time Session
                        </label>

                        {/* Lunch */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-[#1b3b2b]/60 uppercase tracking-widest">
                                ☀️ Lunch Experience
                            </span>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {LUNCH_TIMES.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${selectedTime === time
                                            ? "bg-[#1b3b2b] text-white border-[#1b3b2b]"
                                            : "bg-[#f8f9f6] text-[#1b3b2b] border-[#1b3b2b]/15 hover:border-[#1b3b2b]"
                                            }`}
                                        type="button"
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dinner */}
                        <div className="flex flex-col gap-2 pt-2">
                            <span className="text-[11px] font-bold text-[#1b3b2b]/60 uppercase tracking-widest">
                                🌙 Dinner Experience
                            </span>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {DINNER_TIMES.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${selectedTime === time
                                            ? "bg-[#1b3b2b] text-white border-[#1b3b2b]"
                                            : "bg-[#f8f9f6] text-[#1b3b2b] border-[#1b3b2b]/15 hover:border-[#1b3b2b]"
                                            }`}
                                        type="button"
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preferred Seating Area */}
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-[#1b3b2b]">
                            Preferred Seating Area
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {SEATING_AREAS.map((area) => (
                                <button
                                    key={area.title}
                                    onClick={() => setSeatingArea(area.title)}
                                    className={`flex flex-col text-left p-4 rounded-2xl border transition-all cursor-pointer ${seatingArea === area.title
                                        ? "bg-[#1b3b2b]/10 border-[#1b3b2b]"
                                        : "bg-[#f8f9f6] border-[#1b3b2b]/15 hover:border-[#1b3b2b]"
                                        }`}
                                    type="button"
                                >
                                    <span className="font-heading font-bold text-sm text-[#1b3b2b]">
                                        {area.title}
                                    </span>
                                    <span className="text-[11px] text-[#1b3b2b]/70 mt-1">
                                        {area.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Restricted Light Red State Banner */}
                    {authRestrictionMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold py-3 px-4 rounded-2xl shadow-sm flex items-center justify-between gap-2.5">
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

                    {/* Confirmation Submit Button with Dynamic Loading State */}
                    <button
                        onClick={handleConfirmReservation}
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-2xl bg-[#1b3b2b] text-white font-bold text-xs uppercase tracking-wider shadow-xl hover:bg-[#1b3b2b]/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        type="button"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>Confirming Reservation...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-base">event_available</span>
                                <span>Confirm Reservation for {guests} {guests === 1 ? "Guest" : "Guests"}{buttonDateText} at {selectedTime || "8:00 PM"}</span>
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </main>
    );
}
