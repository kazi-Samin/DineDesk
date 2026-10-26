"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function OrderConfirmationPage() {
    const router = useRouter();

    useEffect(() => {
        // Record payment for loyalty points & dashboard display
        if (typeof window !== "undefined") {
            try {
                const params = new URLSearchParams(window.location.search);
                const orderId = params.get("order_id");
                const sessionId = params.get("session_id");
                if (orderId || sessionId) {
                    const paymentKey = `order_pay_${orderId || sessionId}`;
                    const existing = JSON.parse(localStorage.getItem("dinedesk_stripe_payments") || "[]");
                    if (!existing.includes(paymentKey)) {
                        existing.push(paymentKey);
                        localStorage.setItem("dinedesk_stripe_payments", JSON.stringify(existing));

                        // Also store user-specific key for customer dashboard
                        const userRaw = localStorage.getItem("dinedesk_auth_user");
                        if (userRaw) {
                            const u = JSON.parse(userRaw);
                            if (u?.id) {
                                const userExisting = JSON.parse(localStorage.getItem(`dinedesk_stripe_payments_${u.id}`) || "[]");
                                if (!userExisting.includes(paymentKey)) {
                                    userExisting.push(paymentKey);
                                    localStorage.setItem(`dinedesk_stripe_payments_${u.id}`, JSON.stringify(userExisting));
                                }
                            }
                        }
                        window.dispatchEvent(new Event("storage"));
                    }
                }
            } catch (e) {
                console.error("Failed to record payment in confirmation:", e);
            }
        }

        // Fire celebratory confetti upon successful payment landing
        const duration = 3 * 1000;
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
    }, []);

    return (
        <main className="min-h-screen bg-[#f8f9f6] text-[#1b3b2b] pt-32 pb-24 px-4 sm:px-8 lg:px-16 flex items-center justify-center selection:bg-[#1b3b2b] selection:text-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", damping: 25 }}
                className="w-full max-w-xl bg-white/90 backdrop-blur-2xl border border-[#1b3b2b]/15 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(27,59,43,0.08)] flex flex-col items-center text-center gap-6"
            >
                {/* Success Icon Badge */}
                <div className="w-20 h-20 rounded-3xl bg-[#1b3b2b]/10 border border-[#1b3b2b]/20 flex items-center justify-center text-[#1b3b2b] shadow-inner">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#C05621]">
                        Secure Payment Confirmed
                    </span>
                    <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#1b3b2b] tracking-tight">
                        Order &amp; Table Secured
                    </h1>
                    <p className="text-sm text-[#1b3b2b]/70 font-medium max-w-md mx-auto mt-1">
                        Thank you for dining with DineDesk. Your payment has been successfully processed via Stripe, and your order has been dispatched to the kitchen.
                    </p>
                </div>

                {/* Info Pill */}
                <div className="w-full bg-[#f8f9f6] border border-[#1b3b2b]/15 p-4 rounded-2xl flex items-center justify-between text-xs font-bold">
                    <span className="text-[#1b3b2b]/60 uppercase tracking-wider text-[10px]">Status</span>
                    <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-[11px] font-extrabold">
                        Paid &amp; Verified ✓
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                    <Link
                        href="/dashboard/customer"
                        className="w-full py-4 px-4 rounded-2xl bg-[#1b3b2b] text-white font-bold text-[11px] uppercase tracking-wider whitespace-nowrap shadow-xl hover:bg-[#1b3b2b]/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-sm shrink-0">dashboard</span>
                        <span>View My Reservations &amp; Orders</span>
                    </Link>

                    <Link
                        href="/explore"
                        className="w-full py-4 px-4 rounded-2xl bg-[#f8f9f6] border border-[#1b3b2b]/20 text-[#1b3b2b] font-bold text-[11px] uppercase tracking-wider whitespace-nowrap hover:bg-[#1b3b2b]/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>Explore More Menus</span>
                        <span className="material-symbols-outlined text-sm shrink-0">arrow_forward</span>
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
