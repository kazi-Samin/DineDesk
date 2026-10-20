"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface NavLinksProps {
    onItemClick?: () => void;
    isMobile?: boolean;
    openReservationModal?: () => void;
    selectedRole?: string;
}

export default function NavLinks({
    onItemClick,
    isMobile = false,
}: NavLinksProps) {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();
    const isHome = pathname === "/";
    const isExplore = pathname === "/explore";
    const isReservations = pathname?.startsWith("/reservations");

    const dashboardHref = !isAuthenticated || !user
        ? "/dashboard"
        : user.role === "ADMIN"
            ? "/dashboard/admin"
            : user.role === "VENDOR"
                ? "/dashboard/vendor"
                : "/dashboard/customer";

    const linkClass = (active: boolean) =>
        isMobile
            ? `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${active
                ? "bg-primary text-on-primary shadow-sm font-semibold"
                : "text-on-surface hover:bg-surface-container"
            }`
            : `relative transition-colors py-2 text-sm font-medium ${active
                ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                : "text-on-surface-variant hover:text-primary"
            }`;

    return (
        <nav className={isMobile ? "flex flex-col gap-2" : "hidden xl:flex items-center gap-8"}>

            {/* Home Link */}

            <Link href="/" onClick={onItemClick} className={linkClass(isHome)}>
                {isMobile && <span className="material-symbols-outlined text-xl">home</span>}
                Home
            </Link>

            {/* Explore Link */}

            <Link href="/explore" onClick={onItemClick} className={linkClass(isExplore)}>
                {isMobile && <span className="material-symbols-outlined text-xl">restaurant_menu</span>}
                Browse Menu
            </Link>

            {/* Reserve a Table Link */}

            <Link href="/reservations" onClick={onItemClick} className={linkClass(isReservations)}>
                {isMobile && <span className="material-symbols-outlined text-xl">event_seat</span>}
                Reserve a Table
            </Link>

            {/* Dashboard Link */}

            <Link
                href={dashboardHref}
                onClick={onItemClick}
                className={linkClass(pathname?.includes("/dashboard"))}
            >
                {isMobile && <span className="material-symbols-outlined text-xl">dashboard</span>}
                Dashboard
            </Link>
        </nav>
    );
}