"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface OrderCartModalProps {
    item?: {
        id: string;
        name: string;
        price: number;
        image: string;
    };
    quantity?: number;
}

export default function OrderCartModal({ item, quantity = 1 }: OrderCartModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    // Fallback item details if props aren't passed directly
    const rawDishName = item?.name || "Menu Item #7: Slow-Braised Lamb Shank with Rosemary Jus";
    const unitPrice = item?.price ? Number(item.price) : 36.50;
    const qty = quantity > 0 ? quantity : 1;
    const totalPrice = (unitPrice * qty).toFixed(2);

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
        setIsOpen(true);
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
                            ${totalPrice} Total
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
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative border border-outline-variant">

                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface hover:text-primary cursor-pointer transition-colors shadow-xs"
                            type="button"
                        >
                            ✕
                        </button>

                        <div>
                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-primary/10 text-primary uppercase tracking-wider">
                                Secure Checkout Summary
                            </span>
                            <h3 className="font-heading font-extrabold text-2xl text-primary mt-2">
                                Review Your Order
                            </h3>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                                Review your selected gourmet items before final table payment confirmation.
                            </p>
                        </div>

                        {/* Premium Selected Item Card inside Modal */}
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
                                    ${totalPrice}
                                </span>
                            </div>
                        </div>

                        {/* Billing Breakdown */}
                        <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/60 text-xs font-medium text-on-surface-variant">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-bold text-on-surface">${totalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>VAT &amp; Service Fee (5%)</span>
                                <span className="font-bold text-on-surface">${(Number(totalPrice) * 0.05).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-outline-variant/40 text-sm md:text-base font-black text-primary">
                                <span>Total Payable</span>
                                <span>${(Number(totalPrice) * 1.05).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-all cursor-pointer shadow-xs"
                                type="button"
                            >
                                Continue Browsing
                            </button>
                            <button
                                onClick={() => {
                                    toast.success(`Order successfully placed for $${(Number(totalPrice) * 1.05).toFixed(2)}!`);
                                    setIsOpen(false);
                                }}
                                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
                                type="button"
                            >
                                Confirm &amp; Pay Now
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}