// app/dashboard/admin/settings/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface FeaturedRestaurantItem {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  image: string;
  status: string;
}

interface PlatformGlobalSettings {
  commissionRate: number;
  reservationDepositFee: number;
  enforcePartyRule: boolean;
  payoutSchedule: string;
  featuredRestaurants: FeaturedRestaurantItem[];
  rotationInterval: string;
  includeHeroVideo: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const currentAdminName = (user as any)?.name || (user as any)?.fullName || "Fourkan Bin Ilias";
  const currentAdminRole = ((user as any)?.role || "SUPERADMIN").replace(/_/g, " ");

  const [savedSettings, setSavedSettings] = useState<PlatformGlobalSettings | null>(null);
  const [eligiblePool, setEligiblePool] = useState<FeaturedRestaurantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form working state
  const [commissionRate, setCommissionRate] = useState<number>(12.5);
  const [reservationDepositFee, setReservationDepositFee] = useState<number>(25.0);
  const [enforcePartyRule, setEnforcePartyRule] = useState<boolean>(true);
  const [payoutSchedule, setPayoutSchedule] = useState<string>("daily");
  const [featuredRestaurants, setFeaturedRestaurants] = useState<FeaturedRestaurantItem[]>([]);
  const [rotationInterval, setRotationInterval] = useState<string>("4h");
  const [includeHeroVideo, setIncludeHeroVideo] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    "Platform operations are momentarily pausing for routine telemetry maintenance."
  );

  // Modals & Confirmation dialogs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restaurantToRemove, setRestaurantToRemove] = useState<FeaturedRestaurantItem | null>(null);
  const [pendingMaintenanceToggle, setPendingMaintenanceToggle] = useState<boolean | null>(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getAuthToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    const cookieMatches = document.cookie.match(
      /(?:^|;\s*)(?:token|accessToken|auth_token|session)=([^;]+)/
    );
    if (cookieMatches && cookieMatches[1]) {
      return decodeURIComponent(cookieMatches[1]);
    }

    try {
      const stored =
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken");
      if (stored) return stored.replace(/^Bearer\s+/i, "");
    } catch { }

    return null;
  }, []);

  // Fetch live settings from PostgreSQL
  const fetchSettings = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const cleanBaseUrl = rawBackendUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/settings`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success || !json.settings) {
        throw new Error(json?.message || `Failed to fetch settings (HTTP ${res.status})`);
      }

      const s = json.settings;
      setSavedSettings(s);
      setEligiblePool(json.eligiblePool || []);

      // Initialize form fields
      setCommissionRate(s.commissionRate);
      setReservationDepositFee(s.reservationDepositFee);
      setEnforcePartyRule(s.enforcePartyRule);
      setPayoutSchedule(s.payoutSchedule);
      setFeaturedRestaurants(s.featuredRestaurants || []);
      setRotationInterval(s.rotationInterval);
      setIncludeHeroVideo(s.includeHeroVideo);
      setMaintenanceMode(s.maintenanceMode);
      setMaintenanceMessage(s.maintenanceMessage);

      if (isManual) {
        showToast("Global settings synchronized from PostgreSQL.");
      }
    } catch (err: any) {
      console.error("Fetch Settings Error:", err);
      setError(err?.message || "Failed to load platform settings from database.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Validation
  const commissionError = useMemo(() => {
    if (isNaN(commissionRate)) return "Commission rate is required.";
    if (commissionRate < 0) return "Commission rate cannot be negative.";
    if (commissionRate > 100) return "Commission rate cannot exceed 100%.";
    return null;
  }, [commissionRate]);

  const depositError = useMemo(() => {
    if (isNaN(reservationDepositFee)) return "Deposit fee is required.";
    if (reservationDepositFee < 0) return "Deposit fee cannot be negative.";
    return null;
  }, [reservationDepositFee]);

  const isValid = !commissionError && !depositError;

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    if (!savedSettings) return false;
    if (commissionRate !== savedSettings.commissionRate) return true;
    if (reservationDepositFee !== savedSettings.reservationDepositFee) return true;
    if (enforcePartyRule !== savedSettings.enforcePartyRule) return true;
    if (payoutSchedule !== savedSettings.payoutSchedule) return true;
    if (rotationInterval !== savedSettings.rotationInterval) return true;
    if (includeHeroVideo !== savedSettings.includeHeroVideo) return true;
    if (maintenanceMode !== savedSettings.maintenanceMode) return true;
    if (maintenanceMessage !== savedSettings.maintenanceMessage) return true;

    if (featuredRestaurants.length !== savedSettings.featuredRestaurants.length) return true;
    for (let i = 0; i < featuredRestaurants.length; i++) {
      if (featuredRestaurants[i].id !== savedSettings.featuredRestaurants[i]?.id) return true;
    }

    return false;
  }, [
    savedSettings,
    commissionRate,
    reservationDepositFee,
    enforcePartyRule,
    payoutSchedule,
    rotationInterval,
    includeHeroVideo,
    maintenanceMode,
    maintenanceMessage,
    featuredRestaurants,
  ]);

  // Featured Restaurants Reordering
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const nextList = [...featuredRestaurants];
    const temp = nextList[index];
    nextList[index] = nextList[index - 1];
    nextList[index - 1] = temp;
    setFeaturedRestaurants(nextList);
  };

  const handleMoveDown = (index: number) => {
    if (index >= featuredRestaurants.length - 1) return;
    const nextList = [...featuredRestaurants];
    const temp = nextList[index];
    nextList[index] = nextList[index + 1];
    nextList[index + 1] = temp;
    setFeaturedRestaurants(nextList);
  };

  // Add Restaurant to Featured
  const handleAddRestaurant = (item: FeaturedRestaurantItem) => {
    if (featuredRestaurants.length >= 8) {
      showToast("Maximum 8 featured curation slots already occupied.");
      return;
    }
    setFeaturedRestaurants((prev) => [...prev, item]);
    setIsAddModalOpen(false);
    showToast(`Added ${item.name} to featured roster.`);
  };

  // Remove Restaurant Confirm
  const handleConfirmRemoveRestaurant = () => {
    if (!restaurantToRemove) return;
    setFeaturedRestaurants((prev) => prev.filter((r) => r.id !== restaurantToRemove.id));
    showToast(`Removed ${restaurantToRemove.name} from featured roster.`);
    setRestaurantToRemove(null);
  };

  // Maintenance Toggle Confirmation
  const handleConfirmMaintenanceToggle = () => {
    if (pendingMaintenanceToggle !== null) {
      setMaintenanceMode(pendingMaintenanceToggle);
      showToast(
        pendingMaintenanceToggle
          ? "Platform Maintenance Mode enabled. Public traffic queued."
          : "Platform Maintenance Mode deactivated. Operations live."
      );
      setPendingMaintenanceToggle(null);
    }
  };

  // Discard Changes
  const handleConfirmDiscard = () => {
    if (!savedSettings) return;
    setCommissionRate(savedSettings.commissionRate);
    setReservationDepositFee(savedSettings.reservationDepositFee);
    setEnforcePartyRule(savedSettings.enforcePartyRule);
    setPayoutSchedule(savedSettings.payoutSchedule);
    setFeaturedRestaurants(savedSettings.featuredRestaurants);
    setRotationInterval(savedSettings.rotationInterval);
    setIncludeHeroVideo(savedSettings.includeHeroVideo);
    setMaintenanceMode(savedSettings.maintenanceMode);
    setMaintenanceMessage(savedSettings.maintenanceMessage);
    setIsDiscardModalOpen(false);
    showToast("Reverted all unsaved modifications.");
  };

  // Save Settings to Backend API
  const handleSaveSettings = async () => {
    if (!isValid) {
      showToast("Please correct validation errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const cleanBaseUrl = rawBackendUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const activeBroadcaster = `${currentAdminName} (${currentAdminRole === "SUPERADMIN" ? "Super Admin" : "Administrator"})`;

      const payload = {
        commissionRate,
        reservationDepositFee,
        enforcePartyRule,
        payoutSchedule,
        featuredRestaurants,
        rotationInterval,
        includeHeroVideo,
        maintenanceMode,
        maintenanceMessage,
        adminName: activeBroadcaster,
      };

      const res = await fetch(`${cleanBaseUrl}/api/v1/admin/settings`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Failed to update settings (HTTP ${res.status})`);
      }

      const updated = json.settings;
      setSavedSettings({
        ...payload,
        lastModifiedBy: updated.lastModifiedBy || activeBroadcaster,
        lastModifiedAt: updated.lastModifiedAt,
      });

      showToast("Platform global settings successfully saved & synchronized.");
    } catch (err: any) {
      console.error("Save Settings Error:", err);
      showToast(err?.message || "Failed to save settings to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex-1 bg-[#FBFBFA] text-[#1b3b2b] font-body-md antialiased pb-44">
      <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col gap-6 sm:gap-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#1b3b2b]/10">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#E2B774] rounded-full" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
                Governance &amp; Operations
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              <span className="text-[11px] font-medium text-neutral-500">
                PostgreSQL Operational Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1b3b2b] tracking-tight">
              Platform Global Settings &amp; Controls
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Adjust core marketplace parameters, monetization rates, featured listings, and emergency operational states.
            </p>
          </div>

          {/* Action & Status Indicator */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isRefreshing || isLoading}
              onClick={() => fetchSettings(true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#1b3b2b] to-[#12281d] text-white hover:from-[#152e22] hover:to-[#0d1d15] text-xs font-semibold shadow-xs border border-[#E2B774]/30 hover:border-[#E2B774]/60 transition-all cursor-pointer active:scale-95 disabled:opacity-50 select-none group"
            >
              <span
                className={`material-symbols-outlined text-[17px] text-[#E2B774] transition-transform duration-700 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                  }`}
              >
                sync
              </span>
              <span className="tracking-tight">{isRefreshing ? "Syncing..." : "Sync Settings"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            <div className="bg-white px-4 py-2.5 rounded-xl border border-[#1b3b2b]/10 shadow-xs flex items-center gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full ${maintenanceMode ? "bg-rose-600 animate-pulse" : "bg-emerald-600 animate-pulse"
                  }`}
              />
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                  Deployment Status
                </span>
                <span className="text-xs font-bold text-[#1b3b2b]">
                  {maintenanceMode ? "Maintenance Active" : "Production Node Live"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-rose-600">error</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchSettings(true)}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Core Settings */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Section 01: Monetization & Commission */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#1b3b2b]/10 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1b3b2b]/10">
                <div>
                  <h2 className="text-lg font-bold text-[#1b3b2b]">Monetization &amp; Revenue Splits</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Platform transaction rake, table reservation hold deposits, and ACH payout pacing.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                  Revenue Core
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1.5">
                    Platform Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#fbfdfc] border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] font-semibold text-[#1b3b2b]"
                  />
                  {commissionError && (
                    <span className="text-[11px] text-rose-600 mt-1 block font-medium">{commissionError}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1.5">
                    Reservation Deposit Fee ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={reservationDepositFee}
                    onChange={(e) => setReservationDepositFee(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#fbfdfc] border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] font-semibold text-[#1b3b2b]"
                  />
                  {depositError && (
                    <span className="text-[11px] text-rose-600 mt-1 block font-medium">{depositError}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1.5">
                    Merchant Payout Cycle
                  </label>
                  <select
                    value={payoutSchedule}
                    onChange={(e) => setPayoutSchedule(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#fbfdfc] border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] font-semibold text-[#1b3b2b] cursor-pointer"
                  >
                    <option value="daily">Daily Settlement (ACH Midnight)</option>
                    <option value="weekly">Weekly Settlement (Monday 00:00 EST)</option>
                    <option value="biweekly">Bi-Weekly Settlement</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold text-[#1b3b2b] block mb-1.5">
                    Deposit Party Size Threshold
                  </span>
                  <label className="flex items-center gap-3 p-2.5 rounded-xl bg-[#fbfdfc] border border-[#1b3b2b]/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enforcePartyRule}
                      onChange={(e) => setEnforcePartyRule(e.target.checked)}
                      className="w-4 h-4 accent-[#1b3b2b] rounded cursor-pointer"
                    />
                    <span className="text-xs font-medium text-neutral-700">
                      Enforce deposits on parties of 6+ guests
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 02: Featured Curation */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#1b3b2b]/10 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1b3b2b]/10">
                <div>
                  <h2 className="text-lg font-bold text-[#1b3b2b]">Flagship Featured Curation</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Prioritize flagship restaurants displayed on diner discovery feeds and home hero carousels.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#152e22] text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
                >
                  <span className="material-symbols-outlined text-base text-[#E2B774]">add</span>
                  <span>Add Restaurant</span>
                </button>
              </div>

              {/* Featured List */}
              <div className="space-y-3">
                {featuredRestaurants.length > 0 ? (
                  featuredRestaurants.map((resItem, idx) => (
                    <div
                      key={resItem.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fbfdfc] border border-[#1b3b2b]/10 shadow-2xs gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-[#1b3b2b] text-[#E2B774] font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-[#1b3b2b]/10">
                          <img
                            src={resItem.image}
                            alt={resItem.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-[#1b3b2b] truncate">{resItem.name}</h4>
                          <span className="text-[11px] text-neutral-500 truncate block">
                            {resItem.cuisine} • {resItem.address}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-lg bg-white border border-[#1b3b2b]/10 flex items-center justify-center text-neutral-600 hover:text-[#1b3b2b] disabled:opacity-30 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_upward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === featuredRestaurants.length - 1}
                          className="w-7 h-7 rounded-lg bg-white border border-[#1b3b2b]/10 flex items-center justify-center text-neutral-600 hover:text-[#1b3b2b] disabled:opacity-30 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_downward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRestaurantToRemove(resItem)}
                          className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center hover:bg-rose-100 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-neutral-400 bg-[#fbfdfc] rounded-2xl border border-dashed border-[#1b3b2b]/20">
                    No featured restaurants selected. Add restaurants from the database pool.
                  </div>
                )}
              </div>
            </div>

            {/* Section 03: Emergency Maintenance Mode */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-rose-200 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-rose-100">
                <div>
                  <h2 className="text-lg font-bold text-rose-950">Emergency Maintenance &amp; Lockout</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Halt booking transactions and render the public consumer site into read-only mode.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${maintenanceMode
                      ? "bg-rose-100 text-rose-900 border-rose-300"
                      : "bg-neutral-100 text-neutral-700 border-neutral-200"
                    }`}
                >
                  {maintenanceMode ? "Active Lockout" : "Standby"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-rose-950">Platform Status State</span>
                  <span className="text-[11px] text-neutral-600 mt-0.5">
                    {maintenanceMode
                      ? "All public customer dining sessions are currently intercepted."
                      : "DineDesk is fully operational and accepting guest bookings."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingMaintenanceToggle(!maintenanceMode)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto ${maintenanceMode
                      ? "bg-emerald-700 text-white hover:bg-emerald-800"
                      : "bg-rose-700 text-white hover:bg-rose-800"
                    }`}
                >
                  {maintenanceMode ? "Deactivate Maintenance" : "Activate Maintenance"}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1b3b2b] block mb-1.5">
                  Guest-Facing Maintenance Notice
                </label>
                <textarea
                  rows={2}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#fbfdfc] border border-[#1b3b2b]/15 focus:outline-none focus:border-[#1b3b2b] text-[#1b3b2b]"
                />
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Atmospheric Telemetry */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#1b3b2b]/10 shadow-xs flex flex-col gap-4">
              <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                Active Governance Summary
              </span>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                  <span className="text-neutral-500">Curation Slots</span>
                  <span className="font-bold text-[#1b3b2b]">{featuredRestaurants.length} / 8 Occupied</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                  <span className="text-neutral-500">Active Rake</span>
                  <span className="font-bold text-[#1b3b2b]">{commissionRate}% GMV</span>
                </div>
                <div className="p-3 bg-[#fbfdfc] rounded-xl border border-[#1b3b2b]/10 flex justify-between">
                  <span className="text-neutral-500">Deposit Rule</span>
                  <span className="font-bold text-[#1b3b2b]">${reservationDepositFee} on 6+ Guests</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1b3b2b] to-[#12281d] p-6 rounded-3xl text-white shadow-lg border border-[#E2B774]/30 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E2B774]">security</span>
                <span className="text-xs font-bold text-[#E2B774] uppercase tracking-wider">
                  Audit Governance
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Any modifications to financial commission splits or operational maintenance states trigger instant audit logging in PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Reflective Save Bar Dock (Never Overlaps Sidebar) */}
        <div className="fixed bottom-6 left-4 right-4 lg:left-76 lg:right-10 z-40 flex justify-center pointer-events-none">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-3 sm:px-6 sm:py-3.5 border border-white/60 shadow-[0_20px_50px_rgba(27,59,43,0.18)] ring-1 ring-[#1b3b2b]/10 pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden group"
          >
            {/* Reflective Metallic Glass Shine Edge */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90 pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#E2B774]/15 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-2.5 text-xs text-neutral-600 min-w-0">
              <span className="w-8 h-8 rounded-full bg-[#1b3b2b]/5 border border-[#1b3b2b]/10 flex items-center justify-center shrink-0 text-[#1b3b2b]">
                <span className="material-symbols-outlined text-[17px]">verified_user</span>
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Signed Executive Session
                </span>
                <span className="truncate text-xs font-medium text-neutral-700">
                  Broadcasted by{" "}
                  <strong className="text-[#1b3b2b] font-bold">
                    {savedSettings?.lastModifiedBy || `${currentAdminName} (Super Admin)`}
                  </strong>{" "}
                  • <span className="font-mono text-neutral-500">{savedSettings?.lastModifiedAt || "Active"}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                disabled={!isDirty || isSaving}
                onClick={() => setIsDiscardModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 shadow-2xs disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={!isDirty || !isValid || isSaving}
                onClick={handleSaveSettings}
                className="relative px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-[#1b3b2b] to-[#12281d] hover:from-[#152e22] hover:to-[#0d1d15] shadow-md shadow-[#1b3b2b]/25 border border-[#E2B774]/40 hover:border-[#E2B774]/70 disabled:opacity-30 cursor-pointer flex items-center gap-2 active:scale-95 transition-all overflow-hidden"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2B774] animate-ping" />
                <span className="tracking-wide">
                  {isSaving ? "Synchronizing..." : "Save Platform Settings"}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Featured Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full rounded-3xl border border-[#1b3b2b]/15 shadow-2xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#1b3b2b]/10">
                <h3 className="font-bold text-base text-[#1b3b2b]">Add to Featured Roster</h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {eligiblePool
                  .filter((item) => !featuredRestaurants.some((f) => f.id === item.id))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#fbfdfc] border border-[#1b3b2b]/10 hover:border-[#1b3b2b]/30 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-[#1b3b2b] truncate">{item.name}</h4>
                          <span className="text-[10px] text-neutral-500 truncate block">
                            {item.cuisine} • {item.address}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddRestaurant(item)}
                        className="px-3 py-1.5 rounded-lg bg-[#1b3b2b] text-white hover:bg-[#152e22] text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Select
                      </button>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Remove Featured Confirm Modal */}
      <AnimatePresence>
        {restaurantToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-sm w-full rounded-3xl border border-[#1b3b2b]/15 shadow-2xl p-6 flex flex-col gap-4 text-center"
            >
              <h3 className="font-bold text-base text-[#1b3b2b]">Remove from Featured?</h3>
              <p className="text-xs text-neutral-600">
                Are you sure you want to remove <strong>{restaurantToRemove.name}</strong> from the flagship curation carousel?
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestaurantToRemove(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-xs font-bold text-[#1b3b2b] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemoveRestaurant}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Maintenance Toggle Confirm Modal */}
      <AnimatePresence>
        {pendingMaintenanceToggle !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-sm w-full rounded-3xl border border-[#1b3b2b]/15 shadow-2xl p-6 flex flex-col gap-4 text-center"
            >
              <h3 className="font-bold text-base text-rose-950">
                {pendingMaintenanceToggle ? "Confirm Lockout Activation" : "Resume Live Operations"}
              </h3>
              <p className="text-xs text-neutral-600">
                {pendingMaintenanceToggle
                  ? "Enabling maintenance mode intercepts guest table reservations across the platform."
                  : "Deactivating maintenance mode restores all live patron table allocation services."}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingMaintenanceToggle(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-xs font-bold text-[#1b3b2b] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMaintenanceToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer ${pendingMaintenanceToggle ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                >
                  Confirm State
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discard Confirm Modal */}
      <AnimatePresence>
        {isDiscardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-sm w-full rounded-3xl border border-[#1b3b2b]/15 shadow-2xl p-6 flex flex-col gap-4 text-center"
            >
              <h3 className="font-bold text-base text-[#1b3b2b]">Discard All Unsaved Changes?</h3>
              <p className="text-xs text-neutral-600">
                This will revert all modified commission, deposit, and curation parameters back to the current PostgreSQL database configuration.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDiscardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-xs font-bold text-[#1b3b2b] cursor-pointer"
                >
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-28 right-6 z-50 bg-[#1b3b2b] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#E2B774]/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[#E2B774] text-base">check_circle</span>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}