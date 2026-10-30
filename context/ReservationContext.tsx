"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ReservationRequest, ReservationConfirmation } from "@/types/reservation";
import { createReservation } from "@/services/mockReservationService";
import { getReservationDates } from "@/lib/reservationDates";

interface ReservationContextType {
  isModalOpen: boolean;
  restaurantInfo: {
    id: string;
    name: string;
    neighborhood: string;
  };
  openReservationModal: (restaurant?: { id: string; name: string; neighborhood: string }) => void;
  closeReservationModal: () => void;
  submitReservation: (payload: ReservationRequest) => Promise<ReservationConfirmation>;
  lastReservation: ReservationConfirmation | null;

  // Dedicated /reservations page states
  guests: number;
  setGuests: (guests: number | ((prev: number) => number)) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedRawDate?: string;
  setSelectedRawDate?: (raw: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  seatingArea: string;
  setSeatingArea: (area: string) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState({
    id: "the-maple-and-vine",
    name: "The Maple & Vine",
    neighborhood: "Corktown, Detroit, MI",
  });
  const [lastReservation, setLastReservation] = useState<ReservationConfirmation | null>(null);

  // Dynamically calculate initial reservation date based on current runtime date
  const defaultInitialDate = getReservationDates()[0];

  // Additional state for the full dedicated reservations page
  const [guests, setGuests] = useState<number>(2);
  const [selectedDate, setSelectedDate] = useState(defaultInitialDate.displayDate);
  const [selectedRawDate, setSelectedRawDate] = useState(defaultInitialDate.raw);
  const [selectedTime, setSelectedTime] = useState("8:00 PM");
  const [seatingArea, setSeatingArea] = useState("Main Hall");

  const openReservationModal = (restaurant?: { id: string; name: string; neighborhood: string }) => {
    if (restaurant) {
      setRestaurantInfo(restaurant);
    }
    setIsModalOpen(true);
  };

  const closeReservationModal = () => {
    setIsModalOpen(false);
  };

  const submitReservation = async (payload: ReservationRequest) => {
    const res = await createReservation(payload);
    setLastReservation(res);
    return res;
  };

  return (
    <ReservationContext.Provider
      value={{
        isModalOpen,
        restaurantInfo,
        openReservationModal,
        closeReservationModal,
        submitReservation,
        lastReservation,
        guests,
        setGuests,
        selectedDate,
        setSelectedDate,
        selectedRawDate,
        setSelectedRawDate,
        selectedTime,
        setSelectedTime,
        seatingArea,
        setSeatingArea,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
}
