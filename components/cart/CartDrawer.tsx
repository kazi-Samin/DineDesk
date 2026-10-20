"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CartDrawer() {
  const cartContext = useCart() as any;
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const checkCart = () => {
      const saved = JSON.parse(localStorage.getItem("dine_desk_cart") || "[]");
      setCartItems(saved);
    };

    checkCart();
    window.addEventListener("storage", checkCart);
    window.addEventListener("open-cart-drawer", () => setIsOpen(true));

    return () => {
      window.removeEventListener("storage", checkCart);
      window.removeEventListener("open-cart-drawer", () => setIsOpen(true));
    };
  }, []);

  useEffect(() => {
    if (cartContext?.isCartOpen !== undefined) {
      setIsOpen(cartContext.isCartOpen);
    }
  }, [cartContext?.isCartOpen]);

  const handleClose = () => {
    setIsOpen(false);
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
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover shadow-xs shrink-0"
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

                <button
                  onClick={() => {
                    alert("Proceeding to secure checkout!");
                    handleClose();
                  }}
                  className="w-full mt-2 py-4 rounded-2xl bg-primary text-on-primary font-bold text-xs tracking-wider uppercase shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  type="button"
                >
                  <span>Proceed to Checkout</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}