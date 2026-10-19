"use client";

import React, { createContext, useContext, useState } from "react";
import { ReservationRequest, ReservationConfirmation } from "@/types/reservation";
import { createReservation } from "@/services/mockReservationService";

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
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState({
    id: "the-maple-and-vine",
    name: "The Maple & Vine",
    neighborhood: "Corktown, Detroit, MI",
  });
  const [lastReservation, setLastReservation] = useState<ReservationConfirmation | null>(null);

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
