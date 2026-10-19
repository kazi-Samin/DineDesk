"use client";

import { useState, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import MonetizationSection from "@/components/admin/settings/MonetizationSection";
import FeaturedCurationSection from "@/components/admin/settings/FeaturedCurationSection";
import EmergencyMaintenanceSection from "@/components/admin/settings/EmergencyMaintenanceSection";
import SettingsSidebarPanels from "@/components/admin/settings/SettingsSidebarPanels";
import SettingsBottomBar from "@/components/admin/settings/SettingsBottomBar";
import AddFeaturedModal from "@/components/admin/settings/AddFeaturedModal";
import {
  RemoveFeaturedDialog,
  MaintenanceConfirmDialog,
  DiscardConfirmDialog,
} from "@/components/admin/settings/SettingsDialogs";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { FeaturedRestaurantItem, PlatformGlobalSettings } from "@/types/admin";
import {
  getPlatformGlobalSettings,
  getEligibleFeaturedRestaurants,
} from "@/services/mockAdminService";

export default function AdminSettingsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");

  // Initial and baseline saved settings
  const [savedSettings, setSavedSettings] = useState<PlatformGlobalSettings>(() =>
    getPlatformGlobalSettings()
  );

  // Form working state
  const [commissionRate, setCommissionRate] = useState<number>(savedSettings.commissionRate);
  const [reservationDepositFee, setReservationDepositFee] = useState<number>(
    savedSettings.reservationDepositFee
  );
  const [enforcePartyRule, setEnforcePartyRule] = useState<boolean>(savedSettings.enforcePartyRule);
  const [payoutSchedule, setPayoutSchedule] = useState<string>(savedSettings.payoutSchedule);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<FeaturedRestaurantItem[]>(
    savedSettings.featuredRestaurants
  );
  const [rotationInterval, setRotationInterval] = useState<string>(savedSettings.rotationInterval);
  const [includeHeroVideo, setIncludeHeroVideo] = useState<boolean>(savedSettings.includeHeroVideo);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(savedSettings.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    savedSettings.maintenanceMessage
  );

  // Modals & Confirmation dialogs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restaurantToRemove, setRestaurantToRemove] = useState<FeaturedRestaurantItem | null>(null);
  const [pendingMaintenanceToggle, setPendingMaintenanceToggle] = useState<boolean | null>(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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

  // Unsaved changes check
  const isDirty = useMemo(() => {
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
    commissionRate,
    reservationDepositFee,
    enforcePartyRule,
    payoutSchedule,
    rotationInterval,
    includeHeroVideo,
    maintenanceMode,
    maintenanceMessage,
    featuredRestaurants,
    savedSettings,
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
      showToast("Maximum 8 featured slots already occupied.");
      return;
    }
    setFeaturedRestaurants((prev) => [...prev, item]);
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
  const handleRequestMaintenanceToggle = (desiredState: boolean) => {
    if (desiredState) {
      // Opening maintenance mode is critical - ask for confirmation
      setPendingMaintenanceToggle(true);
    } else {
      // Disabling maintenance mode
      setPendingMaintenanceToggle(false);
    }
  };

  const handleConfirmMaintenanceToggle = () => {
    if (pendingMaintenanceToggle !== null) {
      setMaintenanceMode(pendingMaintenanceToggle);
      showToast(
        pendingMaintenanceToggle
          ? "Platform Maintenance Mode has been activated."
          : "Platform Maintenance Mode deactivated. Operations live."
      );
      setPendingMaintenanceToggle(null);
    }
  };

  // Discard Changes
  const handleConfirmDiscard = () => {
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

  // Save Settings Action
  const handleSaveSettings = () => {
    if (!isValid) {
      showToast("Please correct validation errors before saving.");
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} at ${now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })} EST`;

      const nextSettings: PlatformGlobalSettings = {
        commissionRate,
        reservationDepositFee,
        enforcePartyRule,
        payoutSchedule,
        featuredRestaurants,
        rotationInterval,
        includeHeroVideo,
        maintenanceMode,
        maintenanceMessage,
        lastModifiedBy: "Tahmid Rahman (Super Admin)",
        lastModifiedAt: formattedDate,
      };

      setSavedSettings(nextSettings);
      setIsSaving(false);
      showToast("Platform global settings successfully saved & broadcasted.");
    }, 700);
  };

  const eligiblePool = getEligibleFeaturedRestaurants();

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      {/* 1. Admin Shared Navigation Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />

      {/* 2. Admin Top Header */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* 3. Main Settings Workspace */}
      <div
        className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
        }`}
      >
        <main className="relative flex-1 bg-background">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/50">
              <div className="flex flex-col gap-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-secondary">
                    Governance &amp; Operations
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Platform Global Settings &amp; Controls
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                  Adjust core marketplace parameters, monetization rates, featured listings, and
                  emergency operational states.
                </p>
              </div>

              {/* Deployment Status Pill */}
              <div className="flex items-center gap-3">
                <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant shadow-2xs flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      maintenanceMode ? "bg-rose-600 animate-pulse" : "bg-emerald-600 animate-pulse"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      Deployment Status
                    </span>
                    <span className="font-label-md text-xs font-bold text-on-surface">
                      {maintenanceMode ? "Maintenance Mode Active" : "Production Node: Active (Live)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main 12-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (8 cols): Core Settings */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                {/* Section 01: Monetization & Commission */}
                <MonetizationSection
                  commissionRate={commissionRate}
                  reservationDepositFee={reservationDepositFee}
                  enforcePartyRule={enforcePartyRule}
                  payoutSchedule={payoutSchedule}
                  commissionError={commissionError}
                  depositError={depositError}
                  onCommissionChange={setCommissionRate}
                  onDepositFeeChange={setReservationDepositFee}
                  onTogglePartyRule={setEnforcePartyRule}
                  onPayoutScheduleChange={setPayoutSchedule}
                />

                {/* Section 02: Featured Curation */}
                <FeaturedCurationSection
                  featuredRestaurants={featuredRestaurants}
                  rotationInterval={rotationInterval}
                  includeHeroVideo={includeHeroVideo}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onRequestRemove={(item) => setRestaurantToRemove(item)}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onRotationIntervalChange={setRotationInterval}
                  onToggleHeroVideo={setIncludeHeroVideo}
                />

                {/* Section 03: Emergency Maintenance Mode */}
                <EmergencyMaintenanceSection
                  maintenanceMode={maintenanceMode}
                  maintenanceMessage={maintenanceMessage}
                  onRequestToggleMaintenance={handleRequestMaintenanceToggle}
                  onMaintenanceMessageChange={setMaintenanceMessage}
                />
              </div>

              {/* Right Column (4 cols): Atmosphere, Telemetry, and Hotline */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                <SettingsSidebarPanels
                  featuredCount={featuredRestaurants.length}
                  maxSlots={8}
                />
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <SettingsBottomBar
              lastModifiedBy={savedSettings.lastModifiedBy}
              lastModifiedAt={savedSettings.lastModifiedAt}
              isDirty={isDirty}
              isSaving={isSaving}
              onDiscard={() => setIsDiscardModalOpen(true)}
              onSave={handleSaveSettings}
            />
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <AddFeaturedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRestaurant={handleAddRestaurant}
        availablePool={eligiblePool}
        currentFeaturedIds={featuredRestaurants.map((r) => r.id)}
      />

      <RemoveFeaturedDialog
        restaurant={restaurantToRemove}
        isOpen={Boolean(restaurantToRemove)}
        onClose={() => setRestaurantToRemove(null)}
        onConfirm={handleConfirmRemoveRestaurant}
      />

      <MaintenanceConfirmDialog
        isOpen={pendingMaintenanceToggle !== null}
        isEnabling={Boolean(pendingMaintenanceToggle)}
        onClose={() => setPendingMaintenanceToggle(null)}
        onConfirm={handleConfirmMaintenanceToggle}
      />

      <DiscardConfirmDialog
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={handleConfirmDiscard}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-lg border border-outline-variant/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
