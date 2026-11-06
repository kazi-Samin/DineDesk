"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import EmbeddedStripeCheckout from "@/components/checkout/EmbeddedStripeCheckout";

interface OrderCartModalProps {
    item?: {
        id: string;
        name: string;
        price: number;
        image: string;
        restaurantId?: string;
    };
    quantity?: number;
}

export default function OrderCartModal({ item, quantity = 1 }: OrderCartModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isInitializingStripe, setIsInitializingStripe] = useState(false);
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [stripeOrderId, setStripeOrderId] = useState<string | null>(null);
    const [stripeVerifiedTotal, setStripeVerifiedTotal] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    // Fallback item details if props aren't passed directly
    const rawDishName = item?.name || "Menu Item #7: Slow-Braised Lamb Shank with Rosemary Jus";
    const unitPrice = item?.price ? Number(item.price) : 36.50;
    const qty = quantity > 0 ? quantity : 1;
    const totalPrice = Number((unitPrice * qty).toFixed(2));
    const grandTotalWithTax = Number((totalPrice * 1.05).toFixed(2));

    // Extract serial tag (e.g. "#7") and clean item name
    const itemNumberMatch = rawDishName.match(/#(\d+)/);
    const itemSerialTag = itemNumberMatch ? `#${itemNumberMatch[1]}` : item?.id ? `#${item.id.slice(-4).toUpperCase()}` : '#007';
    const cleanDishName = rawDishName.replace(/^Menu Item #\d+:\s*/, '');

    const handleReviewAndPayClick = () => {
        if (!isAuthenticated) {
            toast.error("Please sign in first to review & pay.");
            router.push("/sign-in");
            return;
        }
        setErrorMessage(null);
        setIsOpen(true);
    };

    const handleInitializePayment = async () => {
        setIsInitializingStripe(true);
        setErrorMessage(null);

        try {
            const token = typeof window !== "undefined"
                ? localStorage.getItem("dinedesk_auth_token") ||
                  localStorage.getItem("token") ||
                  localStorage.getItem("accessToken") ||
                  localStorage.getItem("authToken") || ""
                : "";

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [
                        {
                            id: item?.id,
                            name: cleanDishName,
                            price: grandTotalWithTax,
                            quantity: 1,
                            image: item?.image,
                        },
                    ],
                    customerEmail: user?.email,
                    token,
                }),
            });

            const data = await response.json();

            if (response.ok && data.clientSecret) {
                setStripeClientSecret(data.clientSecret);
                setStripeOrderId(data.orderId || `DD-${Math.floor(10000 + Math.random() * 90000)}`);
                setStripeVerifiedTotal(Number(data.total) || grandTotalWithTax);
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
            const token = typeof window !== "undefined"
                ? localStorage.getItem("dinedesk_auth_token") ||
                  localStorage.getItem("token") ||
                  localStorage.getItem("accessToken") ||
                  localStorage.getItem("authToken") || ""
                : "";

            const API_BASE_URL = (
                process.env.NEXT_PUBLIC_BACKEND_URL ||
                process.env.NEXT_PUBLIC_API_URL ||
                "http://localhost:5000"
            ).replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

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

            toast.success("Payment authorized successfully! Order placed.");
            setIsOpen(false);
            router.push(`/dashboard/customer/orders?order_success=true&order_id=${orderId}`);
        } catch {
            setIsOpen(false);
            router.push(`/dashboard/customer/orders?order_success=true&order_id=${orderId}`);
        }
    };

    return (
        <>
            {/* Floating Bottom Bar */}
            <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[640px] bg-inverse-surface text-inverse-on-surface px-6 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary text-on-primary font-black text-xs flex items-center justify-center shadow-md">
                        {qty}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">
                            Items Selected
                        </span>
                        <span className="text-sm font-black text-white">
                            ${totalPrice.toFixed(2)} Total
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleReviewAndPayClick}
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-2"
                    type="button"
                >
                    <span>Review &amp; Pay</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>

            {/* Checkout Modal Popup */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-5 relative border border-outline-variant max-h-[92vh] overflow-y-auto">

                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
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

                        {/* Selected Item Card inside Modal */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-surface-container-low to-surface-container border border-outline-variant/60 shadow-sm">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container shrink-0 shadow-xs border border-outline-variant/40">
                                <img
                                    src={item?.image || "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300&auto=format&fit=crop"}
                                    alt={cleanDishName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-center gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-primary/15 text-primary uppercase tracking-widest">
                                        Item {itemSerialTag}
                                    </span>
                                    <span className="text-[10px] font-bold text-secondary">
                                        Chef&apos;s Special
                                    </span>
                                </div>
                                <h4 className="font-heading font-bold text-xs sm:text-sm text-on-surface leading-tight tracking-tight line-clamp-2">
                                    {cleanDishName}
                                </h4>
                                <span className="text-[11px] font-medium text-on-surface-variant">
                                    Qty: <span className="text-primary font-bold">{qty}</span> × ${unitPrice.toFixed(2)}
                                </span>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-base font-black text-primary tracking-tight">
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Billing Breakdown */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/60 text-xs font-medium text-on-surface-variant">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-bold text-on-surface">${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>VAT &amp; Service Fee (5%)</span>
                                <span className="font-bold text-on-surface">${(totalPrice * 0.05).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-outline-variant/40 text-sm md:text-base font-black text-primary">
                                <span>Total Payable</span>
                                <span>${grandTotalWithTax.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* EMBEDDED STRIPE PAYMENT ELEMENT */}
                        {stripeClientSecret ? (
                            <div className="pt-2 border-t border-outline-variant/40">
                                <EmbeddedStripeCheckout
                                    clientSecret={stripeClientSecret}
                                    orderId={stripeOrderId || "DD-ORDER"}
                                    total={stripeVerifiedTotal || grandTotalWithTax}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    onCancel={() => setStripeClientSecret(null)}
                                />
                            </div>
                        ) : (
                            /* Action Buttons */
                            <div className="flex flex-col gap-2.5 pt-2">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 py-3 px-3 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-all cursor-pointer shadow-xs whitespace-nowrap"
                                        type="button"
                                    >
                                        Continue Browsing
                                    </button>
                                    <button
                                        onClick={handleInitializePayment}
                                        disabled={isInitializingStripe}
                                        className="flex-1 py-3 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs tracking-tight shadow-lg hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
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
