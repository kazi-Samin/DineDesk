import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/ui/CookieConsent";
import TableMateAIBadge from "@/components/ui/TableMateAIBadge";
import CartDrawer from "@/components/cart/CartDrawer";
import ReserveTableModal from "@/components/reservations/ReserveTableModal";
import { CartProvider } from "@/context/CartContext";
import { ReservationProvider } from "@/context/ReservationContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DineDesk — Online Restaurant Ordering & Table Reservation Platform",
  description: "Handcrafted reservation workflows, authentic regional dining directories, and editorial table stewardship for discerning gourmands across Dhaka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
        <AuthProvider>
          <CartProvider>
            <ReservationProvider>
              <Navbar />
              {children}
              <CartDrawer />
              <ReserveTableModal />
              <CookieConsent />
              <TableMateAIBadge />
              <Footer />
            </ReservationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
