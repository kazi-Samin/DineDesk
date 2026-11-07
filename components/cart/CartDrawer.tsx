"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import EmbeddedStripeCheckout from "@/components/checkout/EmbeddedStripeCheckout";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

const getAuthToken = () => {
  if (typeof window === "undefined") return "";

  const match = document.cookie.match(
    /(?:^|;\s*)(?:token|dinedesk_auth_token|better-auth\.session_token|auth_token|accessToken)=([^;]+)/
  );
  if (match && match[1]) return match[1].trim();

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("dinedesk_auth_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  ).trim();
};

export default function CartDrawer() {
  const cartContext = useCart() as any;
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [authRestrictionMessage, setAuthRestrictionMessage] = useState<string | null>(null);

  // Review Your Order Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isInitializingStripe, setIsInitializingStripe] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeOrderId, setStripeOrderId] = useState<string | null>(null);
  const [stripeVerifiedTotal, setStripeVerifiedTotal] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkCart = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("dine_desk_cart") ||
        localStorage.getItem("dinedesk_cart") ||
        "[]"
      );
      setCartItems(Array.isArray(saved) ? saved : []);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    checkCart();
    window.addEventListener("storage", checkCart);
    window.addEventListener("cart-updated", checkCart);
    const handleOpen = () => {
      checkCart();
      setIsOpen(true);
    };
    window.addEventListener("open-cart-drawer", handleOpen);

    return () => {
      window.removeEventListener("storage", checkCart);
      window.removeEventListener("cart-updated", checkCart);
      window.removeEventListener("open-cart-drawer", handleOpen);
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
    let saved = JSON.parse(
      localStorage.getItem("dine_desk_cart") ||
      localStorage.getItem("dinedesk_cart") ||
      "[]"
    );
    const idx = saved.findIndex((i: any) => i.id === id || i.menuId === id);
    if (idx > -1) {
      saved[idx].quantity += delta;
      if (saved[idx].quantity <= 0) {
        saved.splice(idx, 1);
      }
      localStorage.setItem("dine_desk_cart", JSON.stringify(saved));
      localStorage.setItem("dinedesk_cart", JSON.stringify(saved));
      setCartItems([...saved]);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  const clearEntireCart = () => {
    try {
      localStorage.removeItem("dine_desk_cart");
      localStorage.removeItem("dinedesk_cart");
    } catch {
      // ignore
    }
    setCartItems([]);
    if (cartContext?.clearCart) {
      cartContext.clearCart();
    }
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleProceedToReview = () => {
    setAuthRestrictionMessage(null);

    // Authentication restriction check
    if (!isAuthenticated) {
      setAuthRestrictionMessage("Authentication required! Please sign in first to proceed with checkout.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    handleClose();
    setErrorMessage(null);
    setStripeClientSecret(null);
    setIsReviewModalOpen(true);
  };

  const subtotal = cartItems.reduce((acc, i) => acc + Number(i.price || 0) * Number(i.quantity || 0), 0);
  const deliveryFee = cartItems.length > 0 ? 5.00 : 0;
  const packagingFee = cartItems.length > 0 ? 3.00 : 0;
  const tax = subtotal * 0.06;
  const grandTotal = subtotal + deliveryFee + packagingFee + tax;

  // Initialize Embedded Stripe
  const handleInitializePayment = async () => {
    setIsInitializingStripe(true);
    setErrorMessage(null);

    try {
      const token = getAuthToken();

      const checkoutItems = [
        ...cartItems.map((item: any) => ({
          id: item.id || item.menuId,
          name: item.name,
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          image: item.image,
          restaurantId: item.restaurantId,
        })),
        ...(deliveryFee > 0 ? [{ id: "delivery-fee", name: "Delivery Fee", price: deliveryFee, quantity: 1 }] : []),
        ...(packagingFee > 0 ? [{ id: "packaging-fee", name: "Restaurant Packaging", price: packagingFee, quantity: 1 }] : []),
        ...(tax > 0 ? [{ id: "tax-fee", name: "State & Local Tax (6%)", price: Number(tax.toFixed(2)), quantity: 1 }] : []),
      ];

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems,
          customerEmail: user?.email,
          token,
          orderType: "DELIVERY",
        }),
      });

      const data = await response.json();

      if (response.ok && data.clientSecret) {
        setStripeClientSecret(data.clientSecret);
        setStripeOrderId(data.orderId || `DD-${Math.floor(10000 + Math.random() * 90000)}`);
        setStripeVerifiedTotal(Number(data.total) || grandTotal);
      } else {
        throw new Error(data.error || "Failed to initialize embedded Stripe payment gateway.");
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      setErrorMessage(error?.message || "Could not initialize payment gateway. Please try again.");
      toast.error(error?.message || "Could not initialize payment gateway.");
    } finally {
      setIsInitializingStripe(false);
    }
  };

  const handlePaymentSuccess = async (orderId: string) => {
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/api/v1/orders/confirm-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          orderId,
          paymentIntentId: stripeClientSecret ? stripeClientSecret.split("_secret_")[0] : undefined,
        }),
      }).catch(() => null);

      clearEntireCart();
      toast.success("Payment authorized successfully! Order placed.");
      setIsReviewModalOpen(false);
      router.push(`/order-confirmation/${orderId}`);
    } catch {
      clearEntireCart();
      setIsReviewModalOpen(false);
      router.push(`/order-confirmation/${orderId}`);
    }
  };

  // Group items by restaurantName for Cart Drawer
  const groupedItems = cartItems.reduce((acc: any, item: any) => {
    const restName = item.restaurantName || "DineDesk Flagship Premium Kitchen";
    if (!acc[restName]) acc[restName] = [];
    acc[restName].push(item);
    return acc;
  }, {});

  return (
    <>
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
                    onClick={handleProceedToReview}
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

      {/* Review Your Order Modal Popup */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col gap-4 sm:gap-5 relative border border-outline-variant max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsReviewModalOpen(false);
                setStripeClientSecret(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface hover:text-primary cursor-pointer transition-colors shadow-xs"
              type="button"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-primary/10 text-primary uppercase tracking-wider">
                Secure Checkout
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-primary mt-2">
                {stripeClientSecret ? "Complete Your Payment" : "Review Your Order"}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {stripeClientSecret
                  ? "Enter your payment details below to complete your order securely on DineDesk."
                  : "Review your selected gourmet items before table payment confirmation."}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-sm shrink-0">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Cart Items List in Modal */}
            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item: any, idx: number) => (
                <div
                  key={item.id || item.menuId || idx}
                  className="flex items-center gap-3 p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-surface-container-low to-surface-container border border-outline-variant/60 shadow-sm"
                >
                  <img
                    src={item.image && item.image.startsWith("http") ? item.image : "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80"}
                    alt={item.name || "Dish"}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs border border-outline-variant/40"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-on-surface truncate">
                      {item.name}
                    </h4>
                    <span className="text-[10px] sm:text-[11px] font-medium text-on-surface-variant">
                      Qty: <span className="text-primary font-bold">{item.quantity}</span> × ${Number(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-primary">
                      ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Billing Breakdown */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/60 text-xs font-medium text-on-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-on-surface">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-on-surface">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Restaurant Packaging</span>
                <span className="font-bold text-on-surface">${packagingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>State &amp; Local Tax (6%)</span>
                <span className="font-bold text-on-surface">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline-variant/40 text-sm md:text-base font-black text-primary">
                <span>Total Payable</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Embedded Stripe or Action Buttons */}
            {stripeClientSecret ? (
              <div className="pt-2 border-t border-outline-variant/40">
                <EmbeddedStripeCheckout
                  clientSecret={stripeClientSecret}
                  orderId={stripeOrderId || "DD-ORDER"}
                  total={stripeVerifiedTotal || grandTotal}
                  onPaymentSuccess={handlePaymentSuccess}
                  onCancel={() => setStripeClientSecret(null)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      setIsOpen(true);
                    }}
                    className="w-full sm:flex-1 py-3 px-3 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-all cursor-pointer shadow-xs text-center"
                    type="button"
                  >
                    Back to Cart
                  </button>

                  <button
                    onClick={handleInitializePayment}
                    disabled={isInitializingStripe}
                    className="w-full sm:flex-1 py-3 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs tracking-tight shadow-lg hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 text-center"
                    type="button"
                  >
                    {isInitializingStripe ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                        <span>Connecting Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span>Confirm &amp; Pay Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
