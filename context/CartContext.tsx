"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, CartState } from "@/types/cart";
import { INITIAL_CART_ITEMS, CHEF_RECOMMENDATION } from "@/data/mockCartData";

interface CartContextType {
  cart: CartState;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  updateQuantity: (id: string, delta: number) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  addRecommendation: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => void;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>("FIRSTDINE");

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dinedesk_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("dinedesk_cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addRecommendation = () => {
    const existing = items.find((i) => i.id === CHEF_RECOMMENDATION.id);
    if (existing) {
      updateQuantity(CHEF_RECOMMENDATION.id, 1);
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: CHEF_RECOMMENDATION.id,
          name: CHEF_RECOMMENDATION.name,
          price: CHEF_RECOMMENDATION.price,
          quantity: 1,
          variant: CHEF_RECOMMENDATION.description,
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCXlFaQeRDn9jFNmgdgPFOudcqabGk9gAiwHC5wf94UmSr_pOnkXx85GJPYU9_jhU6oeSQ1pWXZCPXwZc71v1seuQLLHbJWqbSrUfFjGGyaK4si15mUm97_Sp_yRyCC-WY4KJBLnS0rOjElXmXqy7kaWldRlUckPGDyfAOxS5firejbUk4RBVXO4rrwvVCt2p7RFfYxmQLy2FlNK1Z461uSR-IzVGIJf23fOwJ5TAMaWV8QUn0ws3b-2A",
          imageAlt: "Firni & Zarda Duo dessert pairing",
        },
      ]);
    }
  };

  const applyCoupon = (code: string) => {
    if (code.trim().toUpperCase() === "FIRSTDINE") {
      setAppliedCoupon("FIRSTDINE");
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(undefined);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(undefined);
    try {
      localStorage.removeItem("dinedesk_cart");
    } catch {
      // ignore
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 5 : 0;
  const packagingFee = items.length > 0 ? 3 : 0;
  const tax = items.length > 0 ? Math.round(subtotal * 0.06) : 0;
  const discount = appliedCoupon && items.length > 0 ? Math.min(10, subtotal) : 0;
  const total = Math.max(0, subtotal + deliveryFee + packagingFee + tax - discount);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const cart: CartState = {
    restaurantId: "the-maple-and-vine",
    restaurantName: "The Maple & Vine",
    items,
    subtotal,
    deliveryFee,
    packagingFee,
    tax,
    discount,
    appliedCoupon,
    total,
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        toggleDrawer: () => setIsDrawerOpen(!isDrawerOpen),
        updateQuantity,
        addItem,
        removeItem,
        addRecommendation,
        applyCoupon,
        removeCoupon,
        clearCart,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
