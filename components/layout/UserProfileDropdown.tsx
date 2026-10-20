"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfileDropdownProps {
    user: any;
    logout: () => void;
}

export default function UserProfileDropdown({ user, logout }: UserProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const getDashboardHref = () => {
        if (!user) return "/dashboard";
        if (user.role === "ADMIN" || user.role === "SUPERADMIN") return "/dashboard/admin";
        if (user.role === "VENDOR") return "/dashboard/vendor";
        return "/dashboard/customer";
    };

    const getRoleBadgeStyle = () => {
        if (!user) return "bg-primary/10 text-primary";
        if (user.role === "ADMIN" || user.role === "SUPERADMIN") return "bg-amber-500/15 text-amber-800 border-amber-500/30";
        if (user.role === "VENDOR") return "bg-secondary/15 text-secondary border-secondary/30";
        return "bg-primary/10 text-primary border-primary/20";
    };

    const userNameUpper = user?.name ? user.name.toUpperCase() : "VALUED GUEST";

    return (
        <div className="relative">
            {/* Trigger Button with Bouncing Animated Ring Avatar */}
            <motion.button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 p-1.5 sm:pr-4 bg-surface-container hover:bg-surface-container-high border border-outline-variant/80 rounded-full transition-all shadow-xs cursor-pointer group"
            >
                {/* Bouncing & Glowing Avatar Ring */}
                <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-primary via-secondary to-primary shadow-sm flex items-center justify-center shrink-0"
                >
                    <div className="w-full h-full rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-heading font-extrabold text-xs uppercase overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={userNameUpper} className="w-full h-full object-cover" />
                        ) : (
                            <span>{userNameUpper[0]}</span>
                        )}
                    </div>
                </motion.div>

                {/* Capitalized User Name & Role Pill (Desktop View) */}
                <div className="hidden md:flex flex-col text-left pr-1">
                    <span className="font-heading font-extrabold text-xs tracking-tight text-on-surface max-w-[130px] truncate">
                        {userNameUpper}
                    </span>
                    <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full w-fit tracking-wider border ${getRoleBadgeStyle()}`}>
                        {user?.role || "Gourmand"}
                    </span>
                </div>

                <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary transition-colors hidden sm:block">
                    {isOpen ? "expand_less" : "expand_more"}
                </span>
            </motion.button>

            {/* Ultra-Luxury Floating Popup Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for mobile closing */}
                        <div
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.96 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute right-0 mt-3 w-72 sm:w-80 bg-surface-container-lowest/95 backdrop-blur-2xl border border-outline-variant/80 rounded-[2rem] shadow-[0_20px_50px_rgba(27,59,43,0.15)] py-3 z-50 overflow-hidden"
                        >
                            {/* User Header Info Card */}
                            <div className="px-5 py-4 border-b border-outline-variant/60 flex items-center gap-3.5 bg-surface-container/60">
                                <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-heading font-extrabold text-base shadow-md shrink-0">
                                    {userNameUpper[0]}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-heading font-black text-xs sm:text-sm text-on-surface tracking-tight truncate">
                                        {userNameUpper}
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant truncate font-medium">
                                        {user?.email || "diner@dinedesk.com"}
                                    </span>
                                    <span className={`mt-1.5 text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md w-fit tracking-wider border ${getRoleBadgeStyle()}`}>
                                        Tier: {user?.role || "Member"}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Navigation Action Links */}
                            <div className="p-2 flex flex-col gap-1">
                                <Link
                                    href={getDashboardHref()}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-primary/10 hover:text-primary transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors shadow-2xs">
                                        <span className="material-symbols-outlined text-base">dashboard</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span>Executive Dashboard</span>
                                        <span className="text-[10px] text-on-surface-variant font-medium">Orders &amp; active tables</span>
                                    </div>
                                </Link>

                                <Link
                                    href="/reservations"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-primary/10 hover:text-primary transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors shadow-2xs">
                                        <span className="material-symbols-outlined text-base">event_seat</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span>My Table Reservations</span>
                                        <span className="text-[10px] text-on-surface-variant font-medium">View &amp; manage bookings</span>
                                    </div>
                                </Link>

                                <Link
                                    href="/explore"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-primary/10 hover:text-primary transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors shadow-2xs">
                                        <span className="material-symbols-outlined text-base">restaurant_menu</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span>Explore Menus</span>
                                        <span className="text-[10px] text-on-surface-variant font-medium">Curated kitchens &amp; dishes</span>
                                    </div>
                                </Link>
                            </div>

                            {/* Sign Out Action Footer */}
                            <div className="p-2 border-t border-outline-variant/60 mt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-error hover:bg-error-container/20 transition-all cursor-pointer group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-error-container/40 flex items-center justify-center text-error">
                                        <span className="material-symbols-outlined text-base">logout</span>
                                    </div>
                                    <span>Sign Out Securely</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}