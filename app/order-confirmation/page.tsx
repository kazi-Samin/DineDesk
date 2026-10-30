"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useCart } from "@/context/CartContext";

interface OrderConfirmationData {
    id: string;
    total: number | string;
    orderType: string;
    paymentStatus: string;
    restaurant?: {
        name: string;
    };
}

const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

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

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id") || searchParams.get("orderId");
    const sessionId = searchParams.get("session_id") || searchParams.get("sessionId");

    const { clearCart } = useCart();

    const [confirming, setConfirming] = useState<boolean>(true);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmationData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Prevent double-invocations under React 18 / 19 Strict Mode
    const confirmationAttemptedRef = useRef(false);

    const fireConfetti = () => {
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#1b3b2b", "#C05621", "#e69557"],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#1b3b2b", "#C05621", "#e69557"],
            });

            if (Date.now() < animationEnd) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    useEffect(() => {
        if (confirmationAttemptedRef.current) return;
        confirmationAttemptedRef.current = true;

        const verifyAndCommitPayment = async () => {
            if (!orderId && !sessionId) {
                setConfirming(false);
                setErrorMessage("No active payment session or order reference found.");
                return;
            }

            try {
                const token = getAuthToken();
                const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                };

                const res = await fetch(`${API_BASE_URL}/orders/confirm-payment`, {
                    method: "POST",
                    headers,
                    credentials: "include",
                    body: JSON.stringify({ orderId, sessionId }),
                });

                const json = await res.json();

                // Check if verified or already confirmed in a previous call
                const isAlreadyPaid =
                    json.message?.toLowerCase().includes("already confirmed") ||
                    json.data?.order?.paymentStatus === "PAID";

                if ((res.ok && json.success) || isAlreadyPaid) {
                    clearCart();
                    setIsSuccess(true);
                    setConfirmedOrder(json.data?.order || { id: orderId || "" } as any);
                    fireConfetti();
                } else {
                    setIsSuccess(false);
                    setErrorMessage(json.message || "Payment verification pending or incomplete on Stripe.");
                }
            } catch (err: any) {
                console.error("Order payment verification failed:", err);
                setIsSuccess(false);
                setErrorMessage("Network error while validating payment with DineDesk servers.");
            } finally {
                setConfirming(false);
            }
        };

        verifyAndCommitPayment();
    }, [orderId, sessionId, clearCart]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-xl bg-white/95 backdrop-blur-2xl border border-[#1b3b2b]/15 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(27,59,43,0.08)] flex flex-col items-center text-center gap-6"
        >
            {confirming ? (
                <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-3 border-[#1b3b2b]/20 border-t-[#1b3b2b] rounded-full animate-spin" />
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-[#1b3b2b]">Confirming Payment with Stripe...</h2>
                        <p className="text-xs text-neutral-500 font-medium">
                            Verifying bank authentication and registering your order with the kitchen.
                        </p>
                    </div>
                </div>
            ) : isSuccess ? (
                <>
                    {/* Success Icon Badge */}
                    <div className="w-20 h-20 rounded-3xl bg-[#1b3b2b]/10 border border-[#1b3b2b]/20 flex items-center justify-center text-[#1b3b2b] shadow-inner">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C05621]">
                            Secure Payment Verified
                        </span>
                        <h1 className="font-bold text-3xl sm:text-4xl text-[#1b3b2b] tracking-tight">
                            Order &amp; Table Secured
                        </h1>
                        <p className="text-sm text-[#1b3b2b]/70 font-medium max-w-md mx-auto mt-1 leading-relaxed">
                            Thank you for dining with DineDesk. Your payment was confirmed, your cart has been cleared, and your ticket has arrived at the kitchen dispatch console.
                        </p>
                    </div>

                    {/* Order Verification Pill */}
                    <div className="w-full bg-[#f8f9f6] border border-[#1b3b2b]/15 p-4 rounded-2xl flex items-center justify-between text-xs font-bold">
                        <div className="text-left">
                            <span className="text-neutral-400 uppercase tracking-wider text-[10px] block">
                                Order Reference
                            </span>
                            <span className="font-mono text-sm text-[#1b3b2b]">
                                #{(confirmedOrder?.id || orderId || "CONFIRMED").slice(-6).toUpperCase()}
                            </span>
                        </div>
                        <span className="text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                            Paid &amp; Sent to Kitchen ✓
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                        <Link
                            href={orderId ? `/order-confirmation/${orderId}` : "/dashboard/customer"}
                            className="w-full py-4 px-4 rounded-2xl bg-[#1b3b2b] text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-md hover:bg-[#1b3b2b]/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">local_shipping</span>
                            <span>Track Live Dispatch</span>
                        </Link>

                        <Link
                            href="/dashboard/customer"
                            className="w-full py-4 px-4 rounded-2xl bg-[#f8f9f6] border border-[#1b3b2b]/20 text-[#1b3b2b] font-bold text-xs uppercase tracking-wider whitespace-nowrap hover:bg-[#1b3b2b]/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">dashboard</span>
                            <span>My Orders</span>
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    {/* Failure / Incomplete State */}
                    <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-inner">
                        <span className="material-symbols-outlined text-4xl">warning</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C05621]">
                            Payment Status Incomplete
                        </span>
                        <h1 className="font-bold text-2xl sm:text-3xl text-[#1b3b2b] tracking-tight">
                            Order Verification Incomplete
                        </h1>
                        <p className="text-sm text-neutral-600 font-medium max-w-md mx-auto mt-1 leading-relaxed">
                            {errorMessage || "We could not confirm payment authorization from Stripe. No order has been placed in the kitchen."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                        <Link
                            href="/checkout"
                            className="w-full py-4 px-4 rounded-2xl bg-[#1b3b2b] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#1b3b2b]/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span>Return to Checkout</span>
                        </Link>

                        <Link
                            href="/explore"
                            className="w-full py-4 px-4 rounded-2xl bg-[#f8f9f6] border border-[#1b3b2b]/20 text-[#1b3b2b] font-bold text-xs uppercase tracking-wider hover:bg-[#1b3b2b]/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span>Browse Outlets</span>
                        </Link>
                    </div>
                </>
            )}
        </motion.div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <main className="min-h-screen bg-[#f8f9f6] text-[#1b3b2b] pt-32 pb-24 px-4 sm:px-8 lg:px-16 flex items-center justify-center selection:bg-[#1b3b2b] selection:text-white">
            <Suspense
                fallback={
                    <div className="py-12 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-3 border-[#1b3b2b]/20 border-t-[#1b3b2b] rounded-full animate-spin" />
                        <p className="text-xs text-neutral-500 font-medium">Loading confirmation...</p>
                    </div>
                }
            >
                <OrderConfirmationContent />
            </Suspense>
        </main>
    );
}