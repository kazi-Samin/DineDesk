"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
    id: string;
    menuId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    restaurantName: string;
}

interface CartContextType {
    cartItems: CartItem[];
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    toggleDrawer: () => void;
    addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => Promise<void>;
    updateQuantity: (menuId: string, delta: number) => Promise<void>;
    totalItemsCount: number;
    totalItemCount: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount & listen for storage events
    useEffect(() => {
        loadCartFromStorage();
        const handleStorageSync = () => loadCartFromStorage();
        window.addEventListener("storage", handleStorageSync);
        return () => window.removeEventListener("storage", handleStorageSync);
    }, []);

    const loadCartFromStorage = () => {
        try {
            const saved = localStorage.getItem("dine_desk_cart");
            if (saved) {
                setCartItems(JSON.parse(saved));
            }
        } catch (err) {
            console.error("Failed to load cart from storage:", err);
        }
    };

    const saveCartToStorage = (updatedItems: CartItem[]) => {
        setCartItems(updatedItems);
        localStorage.setItem("dine_desk_cart", JSON.stringify(updatedItems));
        window.dispatchEvent(new Event("storage"));
    };

    const toggleDrawer = () => setIsCartOpen((prev) => !prev);

    const addToCart = async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
        const qtyToAdd = item.quantity || 1;
        const targetId = item.menuId || item.id;

        const existingIndex = cartItems.findIndex((i) => i.menuId === targetId || i.id === targetId);
        let updated: CartItem[];

        if (existingIndex > -1) {
            updated = [...cartItems];
            updated[existingIndex].quantity += qtyToAdd;
        } else {
            updated = [
                ...cartItems,
                {
                    id: item.id || targetId,
                    menuId: targetId,
                    name: item.name,
                    price: Number(item.price || 0),
                    quantity: qtyToAdd,
                    image: item.image,
                    restaurantName: item.restaurantName || "Sultan's Heritage Kitchen",
                },
            ];
        }

        saveCartToStorage(updated);
        setIsCartOpen(true); // Open drawer instantly on add!
    };

    const updateQuantity = async (menuId: string, delta: number) => {
        const existingIndex = cartItems.findIndex((i) => i.menuId === menuId || i.id === menuId);
        if (existingIndex === -1) return;

        const updated = [...cartItems];
        updated[existingIndex].quantity += delta;

        if (updated[existingIndex].quantity <= 0) {
            updated.splice(existingIndex, 1);
        }

        saveCartToStorage(updated);
    };

    const totalItemsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                isCartOpen,
                setIsCartOpen,
                toggleDrawer,
                addToCart,
                updateQuantity,
                totalItemsCount,
                totalItemCount: totalItemsCount,
                subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}