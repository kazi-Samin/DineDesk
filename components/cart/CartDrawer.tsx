"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { initiateStripeCheckout } from "../services/stripeService";

export default function CartDrawer() {
  const cartContext = useCart() as any;
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [authRestrictionMessage, setAuthRestrictionMessage] = useState<string | null>(null);

  const checkCart = () => {
    try {

      const saved = JSON.parse(localStorage.getItem("dine_desk_cart") || "[]");
      setCartItems(Array.isArray(saved) ? saved : []);
    } catch (e) {
      setCartItems([]);
    }
  };

  useEffect(() => {





    checkCart();
    window.addEventListener("storage", checkCart);
    window.addEventListener("cart-updated", checkCart);
    window.addEventListener("open-cart-drawer", () => {
      checkCart();
      setIsOpen(true);
    });

    return () => {
      window.removeEventListener("storage", checkCart);
      window.removeEventListener("cart-updated", checkCart);
      window.removeEventListener("open-cart-drawer", () => setIsOpen(true));

    };
  }, []);

  useEffect(() => {
    if (cartContext?.isCartOpen !== undefined) {
      setIsOpen(cartContext.isCartOpen);
    }
  }, [cartContext?.isCartOpen]);

  useEffect(() => {
    if (isOpen) {
      checkCart();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setAuthRestrictionMessage(null);
    if (cartContext?.setIsCartOpen) {
      cartContext.setIsCartOpen(false);
    }
  };

  const updateQty = (id: string, delta: number) => {
    let saved = JSON.parse(localStorage.getItem("dine_desk_cart") || "[]");
    const idx = saved.findIndex((i: any) => i.id === id || i.menuId === id);
    if (idx > -1) {
      saved[idx].quantity += delta;
      if (saved[idx].quantity <= 0) {
        saved.splice(idx, 1);
      }
      localStorage.setItem("dine_desk_cart", JSON.stringify(saved));
      setCartItems([...saved]);
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleCheckoutClick = async () => {
    setAuthRestrictionMessage(null);

    // Authentication restriction check
    if (!isAuthenticated) {
      setAuthRestrictionMessage("Authentication required! Please sign in first to proceed with checkout.");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Explicitly typed line items array to prevent TS property mismatch errors
      const lineItems: Array<{ name: string; price: number; quantity: number; image?: string }> = cartItems.map((item: any) => ({
        name: item.name,
        price: Number(item.price || 0),
        quantity: item.quantity || 1,
        image: item.image,
      }));

      if (deliveryFee > 0) {
        lineItems.push({ name: "Delivery Fee", price: deliveryFee, quantity: 1 });
      }
      if (packagingFee > 0) {
        lineItems.push({ name: "Restaurant Packaging", price: packagingFee, quantity: 1 });
      }
      if (tax > 0) {
        lineItems.push({ name: "State & Local Tax (6%)", price: Number(tax.toFixed(2)), quantity: 1 });
      }

      // Automatically clear cart storage upon initiating checkout redirect
      localStorage.removeItem("dine_desk_cart");
      setCartItems([]);
      window.dispatchEvent(new Event("storage"));

      // Pass user?.email so Stripe pre-fills the customer's email automatically
      await initiateStripeCheckout(lineItems, user?.email);
    } catch (error) {
      toast.error("Stripe checkout session failed.");
      setIsCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce((acc, i) => acc + Number(i.price || 0) * Number(i.quantity || 0), 0);
  const deliveryFee = cartItems.length > 0 ? 5.00 : 0;
  const packagingFee = cartItems.length > 0 ? 3.00 : 0;
  const tax = subtotal * 0.06;
  const grandTotal = subtotal + deliveryFee + packagingFee + tax;

  // Group items by restaurantName
  const groupedItems = cartItems.reduce((acc: any, item: any) => {
    const restName = item.restaurantName || "Sultan's Heritage Kitchen";
    if (!acc[restName]) acc[restName] = [];
    acc[restName].push(item);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-surface-container-lowest shadow-2xl flex flex-col border-l border-outline-variant"
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/60">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary">
                  Your Order
                </span>
                <h3 className="font-heading font-extrabold text-lg text-primary">
                  Multi-Kitchen Order
                </h3>
                <p className="text-[11px] text-on-surface-variant font-medium">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} total items ready
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface hover:text-primary cursor-pointer transition-colors"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center text-primary shadow-inner">
                    <span className="material-symbols-outlined text-4xl">remove_shopping_cart</span>
                  </div>
                  <h4 className="font-heading font-extrabold text-xl text-on-surface">
                    Your Cart is Empty
                  </h4>
                  <Link
                    href="/explore"
                    onClick={handleClose}
                    className="mt-2 px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all"
                  >
                    Explore Menus
                  </Link>
                </div>
              ) : (
                Object.entries(groupedItems).map(([restaurantName, items]: [string, any]) => (
                  <div key={restaurantName} className="flex flex-col gap-3">
                    {/* Restaurant Section Header */}
                    <div className="flex items-center gap-2 pb-1 border-b border-primary/20">
                      <span className="material-symbols-outlined text-sm text-primary">storefront</span>
                      <h4 className="font-heading font-bold text-xs text-primary uppercase tracking-wider">
                        {restaurantName}
                      </h4>
                    </div>

                    {/* Items List for this Restaurant */}
                    <div className="flex flex-col gap-3">
                      {items.map((item: any) => (
                        <div
                          key={item.id || item.menuId}
                          className="flex items-center gap-4 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/60 shadow-2xs"
                        >
                          <img
                            src={item.image && item.image.startsWith("http") ? item.image : "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"}
                            alt={item.name || "Menu item"}
                            className="w-14 h-14 rounded-xl object-cover shadow-xs shrink-0 bg-surface-container"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80";
                            }}
                          />

                          <div className="flex-1 flex flex-col justify-center">
                            <h5 className="font-heading font-bold text-xs text-on-surface line-clamp-1">
                              {item.name}
                            </h5>
                            <span className="text-[11px] font-medium text-on-surface-variant mt-0.5">
                              ${Number(item.price || 0).toFixed(2)} each
                            </span>

                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQty(item.id || item.menuId, -1)}
                                className="w-6 h-6 rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary font-bold flex items-center justify-center shadow-2xs cursor-pointer border border-outline-variant/40 text-xs"
                                type="button"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-primary w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQty(item.id || item.menuId, 1)}
                                className="w-6 h-6 rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary font-bold flex items-center justify-center shadow-2xs cursor-pointer border border-outline-variant/40 text-xs"
                                type="button"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-primary">
                              ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-outline-variant/60 bg-surface-container-low flex flex-col gap-3">
                <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-on-surface">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-on-surface">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                  <span>Restaurant Packaging</span>
                  <span className="font-bold text-on-surface">${packagingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                  <span>State &amp; Local Tax (6%)</span>
                  <span className="font-bold text-on-surface">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-3 border-t border-outline-variant/60 text-base font-black text-primary">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>

                {/* Restricted Light Red State Banner */}
                {authRestrictionMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold py-3 px-4 rounded-2xl shadow-sm flex items-center justify-between gap-2.5 animate-fadeIn mt-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base shrink-0 text-red-500">lock_person</span>
                      <span>{authRestrictionMessage}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleClose();
                        router.push("/sign-in");
                      }}
                      className="text-[11px] font-bold underline text-red-800 hover:text-red-950 shrink-0 cursor-pointer"
                      type="button"
                    >
                      Sign In →
                    </button>
                  </div>
                )}

                <button
                  onClick={handleCheckoutClick}
                  disabled={isCheckingOut}
                  className="w-full mt-2 py-4 rounded-2xl bg-primary text-on-primary font-bold text-xs tracking-wider uppercase shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  type="button"
                >
                  {isCheckingOut ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Redirecting to Stripe...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}