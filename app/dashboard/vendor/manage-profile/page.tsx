"use client";

import { useState, useEffect, useMemo } from "react";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import GeneralInfoSection from "@/components/vendor/profile/GeneralInfoSection";
import MediaSection from "@/components/vendor/profile/MediaSection";
import OperatingHoursSection from "@/components/vendor/profile/OperatingHoursSection";
import LocationSection from "@/components/vendor/profile/LocationSection";
import StorefrontPreviewCard from "@/components/vendor/profile/StorefrontPreviewCard";
import CompletenessChecklist from "@/components/vendor/profile/CompletenessChecklist";
import DispatchHelpCard from "@/components/vendor/profile/DispatchHelpCard";
import {
  AddCuisineTagModal,
  RepositionCoverModal,
  RecalibratePinModal,
  BulkHoursModal,
  GalleryLightboxModal,
  DiscardConfirmDialog,
} from "@/components/vendor/profile/ProfileModals";
import {
  RestaurantProfile,
  PriceTier,
  GalleryPhoto,
  OperatingDay,
} from "@/types/profile";
import {
  getRestaurantProfile,
  saveRestaurantProfile,
  resetRestaurantProfile,
  calculateCompleteness,
} from "@/services/mockProfileService";
import { INITIAL_RESTAURANT_PROFILE } from "@/data/mockRestaurantProfile";

export default function RestaurantProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<RestaurantProfile>(
    INITIAL_RESTAURANT_PROFILE
  );
  const [savedProfile, setSavedProfile] = useState<RestaurantProfile>(
    INITIAL_RESTAURANT_PROFILE
  );
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Form validation errors
  const [nameError, setNameError] = useState("");

  // Visual cover crop alignment (0% to 100%)
  const [coverCropY, setCoverCropY] = useState(50);

  // Modals state
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [isRepositionModalOpen, setIsRepositionModalOpen] = useState(false);
  const [isRecalibratePinModalOpen, setIsRecalibratePinModalOpen] =
    useState(false);
  const [isBulkHoursModalOpen, setIsBulkHoursModalOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Load from local storage
  useEffect(() => {
    const loaded = getRestaurantProfile();
    setProfile(loaded);
    setSavedProfile(loaded);
    setIsClientLoaded(true);
  }, []);

  // Compute dirty state (unsaved changes)
  const isDirty = useMemo(() => {
    if (!isClientLoaded) return false;
    return JSON.stringify(profile) !== JSON.stringify(savedProfile);
  }, [profile, savedProfile, isClientLoaded]);

  // Compute completeness audit
  const completenessAudit = useMemo(() => {
    return calculateCompleteness(profile);
  }, [profile]);

  // Show floating toast
  const showToast = (title: string, description: string) => {
    setToastMessage({ title, description });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Field change handlers
  const handleNameChange = (val: string) => {
    setProfile((prev) => ({ ...prev, name: val }));
    if (val.trim().length >= 3) {
      setNameError("");
    }
  };

  const handleTaglineChange = (val: string) => {
    setProfile((prev) => ({ ...prev, tagline: val }));
  };

  const handleAddCuisineTag = (tag: string) => {
    if (!profile.cuisineTags.includes(tag)) {
      setProfile((prev) => ({
        ...prev,
        cuisineTags: [...prev.cuisineTags, tag],
      }));
    }
  };

  const handleRemoveCuisineTag = (tag: string) => {
    setProfile((prev) => ({
      ...prev,
      cuisineTags: prev.cuisineTags.filter((t) => t !== tag),
    }));
  };

  const handlePriceTierChange = (tier: PriceTier) => {
    setProfile((prev) => ({ ...prev, priceTier: tier }));
  };

  const handleLicenseChange = (val: string) => {
    setProfile((prev) => ({ ...prev, licenseReference: val }));
  };

  // Media Handlers
  const handleCoverFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile((prev) => ({
          ...prev,
          coverImage: reader.result as string,
        }));
        showToast(
          "Cover Image Updated",
          "Preview updated for marketplace storefront."
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile((prev) => ({
          ...prev,
          logoImage: reader.result as string,
        }));
        showToast(
          "Brand Avatar Updated",
          "New logo avatar updated on listing badge."
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddGalleryMedia = () => {
    // Generate sample gallery photo or trigger file selection
    const samplePhotos = [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaBsA8-gXdQqgRGVSIQYXvzjTp0MTVdCQxDW_ExUCrmD87ON5Gy-8yNfuyzKN0W3xHIKZ7S1ZbWy-AT4NnSpA2dOLbHPX8g6lZBBwhdO0BSHLrSk_XEyIhSYUtk9yfRBEQut-0gQGwpbw4vm0GFn_Ti5B2peSOWv5tva1LyWTMZUVsQqm4vjtO_qok6ggcqfnsg2-mPUqwekTw-Pv8QLyozlxVeOpQpOH-c9HZNAMAZNUZx2-K4qKnvg",
        alt: "Private banquet table with traditional brass candelabras",
        caption: "Private Banquet Table",
      },
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhhzmTaqrHVfYx527nZuBMDq061H3h3UzyOyiRgZmAKZkY4Wtx6XD9IydyUzCN888RG1Hs0byiJ4CRojb4fXh0_Pp2sr-CMcljZ-bdRd8Wft2B2gzs1ine8p201nb2DoqqD1srOciFvUEGTAq8s66ZcoB2U0HHqrH6GHIuvApPren5l1qXKlv-vnc6rQIMCaArun9oVtkztj7uh1OeADSSpXL1bARpwjT1eMEXX1TetJivfH5M7wN3Kg",
        alt: "Steaming aromatic kacchi biryani platter",
        caption: "Steaming Kacchi Biryani",
      },
      {
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
        alt: "Tandoori platter with spiced dipping chutneys",
        caption: "Tandoori Platter Selection",
      },
    ];

    const randomSample =
      samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    const newPhoto: GalleryPhoto = {
      id: `gal-${Date.now()}`,
      url: randomSample.url,
      alt: randomSample.alt,
      caption: randomSample.caption,
    };

    setProfile((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, newPhoto],
    }));
    showToast("Atmosphere Photo Added", "New photo added to dining gallery.");
  };

  const handleRemoveGalleryPhoto = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((p) => p.id !== id),
    }));
    showToast("Photo Removed", "Atmosphere photo removed from gallery.");
  };

  // Schedule Handlers
  const handleToggleDayStatus = (dayName: string) => {
    setProfile((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours.map((d) =>
        d.day === dayName ? { ...d, isOpen: !d.isOpen } : d
      ),
    }));
  };

  const handleTimeChange = (
    dayName: string,
    field: "openingTime" | "closingTime",
    val: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours.map((d) =>
        d.day === dayName ? { ...d, [field]: val } : d
      ),
    }));
  };

  const handleServiceTypeChange = (dayName: string, val: string) => {
    setProfile((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours.map((d) =>
        d.day === dayName ? { ...d, serviceType: val } : d
      ),
    }));
  };

  const handleApplyBulkHours = (
    selectedDays: string[],
    openTime: string,
    closeTime: string,
    serviceType: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours.map((d) =>
        selectedDays.includes(d.day)
          ? {
              ...d,
              isOpen: true,
              openingTime: openTime,
              closingTime: closeTime,
              serviceType: serviceType || d.serviceType,
            }
          : d
      ),
    }));
    showToast(
      "Bulk Hours Applied",
      `Operating schedule updated for ${selectedDays.length} days.`
    );
  };

  // Location Handlers
  const handleStreetAddressChange = (val: string) => {
    setProfile((prev) => ({ ...prev, streetAddress: val }));
  };

  const handleNeighborhoodChange = (val: string) => {
    setProfile((prev) => ({ ...prev, neighborhood: val }));
  };

  const handlePhoneChange = (val: string) => {
    setProfile((prev) => ({ ...prev, phone: val }));
  };

  const handleEmailChange = (val: string) => {
    setProfile((prev) => ({ ...prev, managerEmail: val }));
  };

  const handleUpdateCoordinates = (
    lat: number,
    lng: number,
    radiusKm: number
  ) => {
    setProfile((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      coverageRadiusKm: radiusKm,
    }));
    showToast(
      "Navigation Coordinates Updated",
      `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`
    );
  };

  // Save profile
  const handleSaveProfile = () => {
    if (!profile.name.trim()) {
      setNameError("Restaurant name is required.");
      showToast("Validation Error", "Please provide a valid restaurant name.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const saved = saveRestaurantProfile(profile);
    setProfile(saved);
    setSavedProfile(saved);
    showToast(
      "Profile Changes Published",
      "Live storefront updated across DineDesk consumer portal."
    );
  };

  // Discard profile
  const handleDiscardClick = () => {
    if (isDirty) {
      setIsDiscardModalOpen(true);
    } else {
      showToast("No Changes", "Profile is already up to date.");
    }
  };

  const handleConfirmDiscard = () => {
    setProfile(savedProfile);
    setNameError("");
    showToast(
      "Changes Reverted",
      "Form has been restored to the last saved profile."
    );
  };

  // Reset demo
  const handleResetDemo = () => {
    if (
      confirm("Reset restaurant profile to default Sultan's Heritage demo data?")
    ) {
      const reset = resetRestaurantProfile();
      setProfile(reset);
      setSavedProfile(reset);
      setNameError("");
      showToast(
        "Profile Reset",
        "Restored default Sultan's Heritage Kitchen configuration."
      );
    }
  };

  const allDayNames = profile.operatingHours.map((h) => h.day);

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased">
      {/* Shared Vendor Sidebar */}
      <VendorSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-72 transition-all duration-300">
        {/* Vendor Top Header */}
        <VendorHeader
          restaurantName={profile.name}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="relative pt-16 bg-background min-h-screen">
          <div className="flex flex-col w-full">
            <div className="w-full max-w-7xl mx-auto px-margin py-space-lg space-y-space-xl">
              {/* Top Bar: Header, Verification Badge & Live Status */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pb-space-md border-b border-outline-variant/30">
                <div className="space-y-space-xs">
                  <div className="flex items-center gap-space-xs text-primary font-label-sm uppercase tracking-wider font-semibold">
                    <span className="material-symbols-outlined text-sm">
                      storefront
                    </span>
                    <span>Restaurant Profile</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface text-primary tracking-tight">
                    Profile &amp; Operating Hours
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                    Manage your restaurant information, cover photo, cuisine tags, location, and weekly opening hours.
                  </p>
                </div>

                <div className="flex items-center gap-space-sm self-start lg:self-end">
                  <a
                    className="group flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
                    href="#storefront-preview"
                  >
                    <span className="font-label-md text-label-md font-semibold">
                      View Live Storefront
                    </span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">
                      arrow_outward
                    </span>
                  </a>
                  <div className="h-8 w-px bg-outline-variant/40" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed">
                    <span className="material-symbols-outlined text-base">
                      verified
                    </span>
                    <span className="font-label-sm text-label-sm font-semibold">
                      Verified Partner
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating / Sticky Control Bar for Saving */}
              <div className="sticky top-16 z-20 bg-surface/90 backdrop-blur-md px-space-md py-3 rounded-xl border border-outline-variant/50 shadow-sm flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Auto-synced with POS registry •{" "}
                    <span className="text-on-surface font-medium">
                      Last saved: {profile.updatedAt}
                    </span>
                  </span>
                  {isDirty && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold animate-pulse">
                      • Unsaved Changes
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-space-xs">
                  <button
                    onClick={handleDiscardClick}
                    className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                    type="button"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold shadow-sm transition-all cursor-pointer"
                    id="save-btn"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">
                      check
                    </span>
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </div>

              {/* Layout Grid: 8-col main form + 4-col preview & audit */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Primary Form Canvas */}
                <div className="lg:col-span-8 space-y-space-xl">
                  {/* SECTION 1: Identity & Credentials */}
                  <GeneralInfoSection
                    name={profile.name}
                    tagline={profile.tagline}
                    cuisineTags={profile.cuisineTags}
                    priceTier={profile.priceTier}
                    licenseReference={profile.licenseReference}
                    hygieneGrade={profile.hygieneGrade}
                    onNameChange={handleNameChange}
                    onTaglineChange={handleTaglineChange}
                    onAddTagClick={() => setIsAddTagModalOpen(true)}
                    onRemoveTag={handleRemoveCuisineTag}
                    onPriceTierChange={handlePriceTierChange}
                    onLicenseChange={handleLicenseChange}
                    nameError={nameError}
                  />

                  {/* SECTION 2: Imagery & Visual Storytelling */}
                  <MediaSection
                    coverImage={profile.coverImage}
                    coverImageAlt={profile.coverImageAlt}
                    coverSubtitle={profile.coverSubtitle}
                    coverCropY={coverCropY}
                    logoImage={profile.logoImage}
                    logoImageAlt={profile.logoImageAlt}
                    galleryImages={profile.galleryImages}
                    onChangeCoverClick={() => {}}
                    onRepositionClick={() => setIsRepositionModalOpen(true)}
                    onUploadLogoClick={() => {}}
                    onAddGalleryMediaClick={handleAddGalleryMedia}
                    onRemoveGalleryPhoto={handleRemoveGalleryPhoto}
                    onViewPhotoLightbox={(photo) => setLightboxPhoto(photo)}
                    onCoverFileSelected={handleCoverFileSelected}
                    onLogoFileSelected={handleLogoFileSelected}
                  />

                  {/* SECTION 3: Operating Schedule Table */}
                  <OperatingHoursSection
                    operatingHours={profile.operatingHours}
                    holidayTimingEnabled={profile.holidayTimingEnabled}
                    holidayScheduleNotice={
                      profile.holidayScheduleNotice || ""
                    }
                    onToggleHolidayTiming={() =>
                      setProfile((prev) => ({
                        ...prev,
                        holidayTimingEnabled: !prev.holidayTimingEnabled,
                      }))
                    }
                    onHolidayNoticeChange={(val) =>
                      setProfile((prev) => ({
                        ...prev,
                        holidayScheduleNotice: val,
                      }))
                    }
                    onToggleDayStatus={handleToggleDayStatus}
                    onTimeChange={handleTimeChange}
                    onServiceTypeChange={handleServiceTypeChange}
                    onOpenBulkHoursModal={() => setIsBulkHoursModalOpen(true)}
                  />

                  {/* SECTION 4: Location, GPS & Contact */}
                  <LocationSection
                    streetAddress={profile.streetAddress}
                    neighborhood={profile.neighborhood}
                    phone={profile.phone}
                    managerEmail={profile.managerEmail}
                    latitude={profile.latitude}
                    longitude={profile.longitude}
                    coverageRadiusKm={profile.coverageRadiusKm}
                    restaurantName={profile.name}
                    onStreetAddressChange={handleStreetAddressChange}
                    onNeighborhoodChange={handleNeighborhoodChange}
                    onPhoneChange={handlePhoneChange}
                    onEmailChange={handleEmailChange}
                    onRecalibratePinClick={() =>
                      setIsRecalibratePinModalOpen(true)
                    }
                  />
                </div>

                {/* Right Column: Live Marketplace Preview Card & Audit */}
                <aside className="lg:col-span-4 space-y-space-md lg:sticky lg:top-36">
                  {/* Public Marketplace Preview Card */}
                  <StorefrontPreviewCard
                    name={profile.name}
                    cuisineTags={profile.cuisineTags}
                    priceTier={profile.priceTier}
                    coverImage={profile.coverImage}
                    logoImage={profile.logoImage}
                    neighborhood={profile.neighborhood}
                    operatingHours={profile.operatingHours}
                  />

                  {/* Storefront Completeness Audit Box */}
                  <CompletenessChecklist audit={completenessAudit} />

                  {/* Dispatch Help Note */}
                  <DispatchHelpCard />
                </aside>
              </div>

              {/* Bottom Action Ribbon */}
              <div className="pt-space-md border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-space-md pb-space-lg">
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-base text-primary">
                    history
                  </span>
                  <span>Version 4.2.1 • Merchant Portal updated for FY2025</span>
                </div>
                <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end flex-wrap">
                  <button
                    onClick={handleResetDemo}
                    className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary text-xs font-medium cursor-pointer"
                    type="button"
                  >
                    ↻ Reset Default
                  </button>
                  <button
                    onClick={handleDiscardClick}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                    type="button"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">
                      save
                    </span>
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-space-md left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-primary text-on-primary px-5 py-3 rounded-xl shadow-lg border border-primary-fixed/30 flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-xl">
              check_circle
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-on-primary">
                {toastMessage.title}
              </span>
              <span className="font-body-sm text-body-sm text-on-primary-container">
                {toastMessage.description}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <AddCuisineTagModal
        isOpen={isAddTagModalOpen}
        existingTags={profile.cuisineTags}
        onClose={() => setIsAddTagModalOpen(false)}
        onAddTag={handleAddCuisineTag}
      />

      <RepositionCoverModal
        isOpen={isRepositionModalOpen}
        coverImage={profile.coverImage}
        initialCropY={coverCropY}
        onClose={() => setIsRepositionModalOpen(false)}
        onSave={(cropY) => setCoverCropY(cropY)}
      />

      <RecalibratePinModal
        isOpen={isRecalibratePinModalOpen}
        latitude={profile.latitude}
        longitude={profile.longitude}
        coverageRadiusKm={profile.coverageRadiusKm}
        onClose={() => setIsRecalibratePinModalOpen(false)}
        onSave={handleUpdateCoordinates}
      />

      <BulkHoursModal
        isOpen={isBulkHoursModalOpen}
        days={allDayNames}
        onClose={() => setIsBulkHoursModalOpen(false)}
        onApply={handleApplyBulkHours}
      />

      <GalleryLightboxModal
        photo={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        onDelete={handleRemoveGalleryPhoto}
      />

      <DiscardConfirmDialog
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={handleConfirmDiscard}
      />
    </div>
  );
}
