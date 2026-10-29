"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const CONSENT_STORAGE_KEY = "dinedesk_cookie_consent";
const DISMISS_TIMESTAMP_KEY = "dinedesk_cookie_dismissed_at";
const REAPPEAR_INTERVAL_MS = 15 * 60 * 1000; // 15 Minutes

export default function CookieConsent() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isHomePage = pathname === "/" || pathname === "";
    if (!isHomePage) {
      setIsVisible(false);
      return;
    }

    try {
      const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (storedConsent === "accepted") {
        setIsVisible(false);
        return;
      }

      const dismissedAt = localStorage.getItem(DISMISS_TIMESTAMP_KEY);
      if (dismissedAt) {
        const timeDiff = Date.now() - parseInt(dismissedAt, 10);
        if (timeDiff < REAPPEAR_INTERVAL_MS) {
          setIsVisible(false);

          const remainingTime = REAPPEAR_INTERVAL_MS - timeDiff;
          const timer = setTimeout(() => {
            if (window.location.pathname === "/" || window.location.pathname === "") {
              setIsVisible(true);
            }
          }, remainingTime);

          return () => clearTimeout(timer);
        }
      }

      setIsVisible(true);
    } catch {
      setIsVisible(true);
    }
  }, [pathname, mounted]);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
      localStorage.removeItem(DISMISS_TIMESTAMP_KEY);
      localStorage.setItem(
        "dinedesk_cookie_preferences",
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );
    } catch { }
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleTemporaryDismiss = (onlyEssential: boolean = false) => {
    try {
      localStorage.setItem(DISMISS_TIMESTAMP_KEY, Date.now().toString());
      if (onlyEssential) {
        localStorage.setItem(
          "dinedesk_cookie_preferences",
          JSON.stringify({
            essential: true,
            analytics: false,
            marketing: false,
          })
        );
      }
    } catch { }
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleSaveCustomPreferences = () => {
    try {
      if (analyticsEnabled && marketingEnabled) {
        localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
        localStorage.removeItem(DISMISS_TIMESTAMP_KEY);
      } else {
        localStorage.setItem(DISMISS_TIMESTAMP_KEY, Date.now().toString());
      }
      localStorage.setItem(
        "dinedesk_cookie_preferences",
        JSON.stringify({
          essential: true,
          analytics: analyticsEnabled,
          marketing: marketingEnabled,
        })
      );
    } catch { }
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!mounted || (pathname !== "/" && pathname !== "")) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          role="region"
          aria-label="Cookie & Dining Privacy Consent"
          className="fixed bottom-5 left-5 right-5 sm:left-8 sm:right-auto z-50 pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              x: [0, 20, 0, -20, 0],
            }}
            exit={{ opacity: 0, y: 15 }}
            transition={{
              opacity: { duration: 0.35, ease: "easeOut" },
              y: { duration: 0.35, ease: "easeOut" },
              x: {
                duration: 12,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              },
            }}
            style={{
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
            className="w-full max-w-[340px] sm:max-w-[365px] bg-white/92 backdrop-blur-md rounded-2xl p-5 border border-[#1b3b2b]/20 shadow-[0_16px_38px_rgba(27,59,43,0.16)] flex flex-col gap-3.5 relative overflow-hidden"
          >
            {/* Top Multi-Stop Luxury Border */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#1b3b2b] via-[#C05621] to-[#1b3b2b]" />

            {/* Header: Icon + Title + Close */}
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span
                    className="material-symbols-outlined text-[17px] text-[#f59e0b]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    cookie
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-black text-xs sm:text-[13px] text-[#152e22] tracking-tight leading-snug">
                    Curated Dining Experience
                  </h3>
                  <span className="text-[9px] font-extrabold text-[#C05621] tracking-wider uppercase block">
                    Taste &amp; Privacy Preference
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Remind in 15 minutes"
                onClick={() => handleTemporaryDismiss(false)}
                className="w-6 h-6 rounded-full bg-[#f8f9f6]/80 text-[#152e22] hover:bg-[#1b3b2b]/10 flex items-center justify-center transition-colors cursor-pointer border border-[#1b3b2b]/10 shrink-0"
                title="Remind in 15 minutes"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            </div>

            {/* Body Text */}
            <p className="text-[11px] text-[#244233] font-medium leading-relaxed">
              We employ refined sensory cookies to secure real-time table holds,
              calibrate tailored culinary suggestions, and deliver seamless checkouts.
            </p>

            {/* Expandable Preferences Drawer */}
            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex flex-col gap-2 pt-2 border-t border-[#1b3b2b]/10"
                >
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8f9f6]/90 border border-[#1b3b2b]/10">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-sm text-[#1b3b2b]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified_user
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[#152e22]">
                          Essential Security
                        </span>
                        <span className="text-[9px] text-[#244233]/70">
                          Table reservations &amp; session auth
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase text-[#152e22] bg-white px-2 py-0.5 rounded border border-[#1b3b2b]/15">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8f9f6]/90 border border-[#1b3b2b]/10">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-sm text-[#C05621]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        insights
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[#152e22]">
                          Taste Analytics
                        </span>
                        <span className="text-[9px] text-[#244233]/70">
                          Optimizes dispatch &amp; queue wait times
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="accent-[#1b3b2b] w-3.5 h-3.5 cursor-pointer rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8f9f6]/90 border border-[#1b3b2b]/10">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-sm text-[#C05621]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        restaurant
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[#152e22]">
                          Tasting Tailoring
                        </span>
                        <span className="text-[9px] text-[#244233]/70">
                          Seasonal chef discounts &amp; tasting perks
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketingEnabled}
                      onChange={(e) => setMarketingEnabled(e.target.checked)}
                      className="accent-[#1b3b2b] w-3.5 h-3.5 cursor-pointer rounded"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {showPreferences ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveCustomPreferences}
                    className="flex-1 py-2 px-3 bg-[#1b3b2b] hover:bg-[#152e22] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    Save Selection
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreferences(false)}
                    className="py-2 px-3 bg-[#f8f9f6]/90 hover:bg-[#1b3b2b]/10 text-[#152e22] rounded-xl text-[10px] font-bold border border-[#1b3b2b]/20 transition-all cursor-pointer"
                  >
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 py-2 px-3 bg-[#1b3b2b] hover:bg-[#152e22] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span
                      className="material-symbols-outlined text-[13px] text-emerald-300"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span>Accept All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreferences(true)}
                    className="py-2 px-2.5 bg-[#f8f9f6]/90 hover:bg-[#1b3b2b]/10 text-[#152e22] rounded-xl text-[10px] font-bold border border-[#1b3b2b]/20 transition-all cursor-pointer shrink-0"
                  >
                    Custom
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTemporaryDismiss(true)}
                    className="py-2 px-2.5 text-[#244233] hover:text-[#152e22] text-[10px] font-bold transition-all cursor-pointer shrink-0"
                    title="Accept only functional cookies"
                  >
                    Essential
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[9px] text-[#244233]/70 pt-1.5 border-t border-[#1b3b2b]/10">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                GDPR &amp; CCPA Protected
              </span>
              <Link
                href="/privacy"
                className="hover:underline text-[#C05621] font-bold transition-colors"
              >
                Privacy Notice
              </Link>
            </div>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
}