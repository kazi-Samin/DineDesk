import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/ui/CookieConsent";
import TableMateAIBadge from "@/components/ui/TableMateAIBadge";
import CartDrawer from "@/components/cart/CartDrawer";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { CartProvider } from "@/context/CartContext";
import { ReservationProvider } from "@/context/ReservationContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import JsonLd from "@/components/seo/JsonLd";

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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://YOUR_LIVE_DOMAIN";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // Keep the default title under ~60 characters so Google doesn't cut it off.
  title: {
    default: "DineDesk | Order Food Online & Reserve a Table",
    template: "%s | DineDesk", // child pages: title: "Explore Restaurants" -> "Explore Restaurants | DineDesk"
  },

  // Keep under ~160 characters. Written for humans: this is the text shown in Google results.
  description:
    "Order food online and book tables at the best restaurants with DineDesk. Browse menus, reserve a table, pay securely and track your order live.",

  applicationName: "DineDesk",
  generator: "Next.js",
  category: "food & drink",

  // Google ignores the keywords tag for ranking, but Bing and other engines still read it.
  keywords: [
    "DineDesk",
    "online food ordering",
    "restaurant ordering platform",
    "table reservation",
    "book a table online",
    "restaurant booking",
    "food delivery",
    "order food online",
    "restaurant menu online",
    "restaurant discovery",
    "dine-in reservation",
    "pickup and delivery",
    "restaurant management system",
    "restaurant reviews",
    "Bangladesh restaurants",
    "Dhaka restaurants",
    "DevCore Solutions",
  ],

  authors: [{ name: "DevCore Solutions", url: SITE_URL }],
  creator: "DevCore Solutions",
  publisher: "DevCore Solutions",

  // Link previews on Facebook, WhatsApp, LinkedIn, Slack, Discord...
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "DineDesk",
    title: "DineDesk | Order Food Online & Reserve a Table",
    description:
      "Discover restaurants, order for delivery or pickup, reserve a table and track your order live, all in one place.",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png", // 1200x630 PNG in /public
        width: 1200,
        height: 630,
        alt: "DineDesk, online restaurant ordering and table reservation platform",
      },
    ],
  },

  // Link previews on X (Twitter)
  twitter: {
    card: "summary_large_image",
    title: "DineDesk | Order Food Online & Reserve a Table",
    description:
      "Discover restaurants, order for delivery or pickup, reserve a table and track your order live.",
    images: ["/og-image.png"],
    // creator: "@your_handle",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// Colors the browser toolbar on Chrome for Android. Use your brand color.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
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
        <JsonLd />
        <GlobalLoader />
        <AuthProvider>
          <CartProvider>
            <ReservationProvider>
              <Navbar />
              {children}
              <CartDrawer />
              <CookieConsent />
              <TableMateAIBadge />
              <Footer />
            </ReservationProvider>
          </CartProvider>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}