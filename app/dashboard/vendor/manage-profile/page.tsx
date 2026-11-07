// app/dashboard/vendor/manage-profile/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://dine-desk-backend.vercel.app"
)
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/+$/, "") + "/api/v1";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  const match = document.cookie.match(
    /(?:^|;\s*)(?:token|dinedesk_auth_token|better-auth\.session_token|auth_token|accessToken)=([^;]+)/
  );
  return match && match[1] ? match[1].trim() : "";
};

const getRequestHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-session-token"] = token;
    headers["better-auth-session-token"] = token;
  }
  return headers;
};

const DEFAULT_DAYS: OperatingDay[] = [
  { day: "Monday", isOpen: true, openingTime: "11:00", closingTime: "23:00", serviceType: "All Services" },
  { day: "Tuesday", isOpen: true, openingTime: "11:00", closingTime: "23:00", serviceType: "All Services" },
  { day: "Wednesday", isOpen: true, openingTime: "11:00", closingTime: "23:00", serviceType: "All Services" },
  { day: "Thursday", isOpen: true, openingTime: "11:00", closingTime: "23:00", serviceType: "All Services" },
  { day: "Friday", isOpen: true, openingTime: "13:00", closingTime: "23:30", serviceType: "All Services" },
  { day: "Saturday", isOpen: true, openingTime: "11:00", closingTime: "23:30", serviceType: "All Services" },
  { day: "Sunday", isOpen: true, openingTime: "11:00", closingTime: "23:00", serviceType: "All Services" },
];

function buildFallbackProfile(raw: any = {}): RestaurantProfile {
  let parsedHours: OperatingDay[] = DEFAULT_DAYS;
  if (raw.operatingHours) {
    try {
      parsedHours = typeof raw.operatingHours === "string" ? JSON.parse(raw.operatingHours) : raw.operatingHours;
    } catch {
      parsedHours = DEFAULT_DAYS;
    }
  }

  let parsedGallery: GalleryPhoto[] = [];
  if (raw.galleryImages || raw.gallery) {
    try {
      const src = raw.galleryImages || raw.gallery;
      const parsed = typeof src === "string" ? JSON.parse(src) : src;
      if (Array.isArray(parsed)) {
        parsedGallery = parsed.map((item: any, idx: number) => {
          if (typeof item === "string") {
            return {
              id: `gal-${idx}-${Date.now()}`,
              url: item,
              alt: "Dining Atmosphere",
              caption: "Dining Ambiance",
            };
          }
          return item;
        });
      }
    } catch {
      parsedGallery = [];
    }
  }

  let parsedTags: string[] = ["Desi", "Biryani", "Kebab"];
  if (raw.cuisineTags) {
    try {
      parsedTags = typeof raw.cuisineTags === "string" ? JSON.parse(raw.cuisineTags) : raw.cuisineTags;
    } catch {
      parsedTags = Array.isArray(raw.cuisineTags) ? raw.cuisineTags : [raw.cuisineCategory || raw.cuisine || "Desi"];
    }
  } else if (raw.cuisine) {
    parsedTags = raw.cuisine.split(",").map((s: string) => s.trim()).filter(Boolean);
  }

  // Check all possible locations where the logo/avatar may exist on the owner or restaurant model
  const resolvedLogo =
    raw.logoImage ||
    raw.owner?.avatarUrl ||
    raw.owner?.image ||
    raw.avatarUrl ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80";

  return {
    id: raw.id || "rest-1",
    name: raw.name || "DineDesk Flagship Central Kitchen",
    tagline: raw.tagline || "Authentic culinary excellence crafted with passion",
    cuisineTags: parsedTags.length > 0 ? parsedTags : ["Desi", "Biryani"],
    priceTier: (raw.priceTier || raw.priceRange || "$$") as PriceTier,
    licenseReference: raw.licenseReference || "TRAD/DSCC/019284/2026",
    hygieneGrade: raw.hygieneGrade || "Grade A (98/100)",
    coverImage: raw.coverUrl || raw.coverImage || raw.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    coverImageAlt: raw.name || "Restaurant Cover",
    coverSubtitle: "Dine-In • Delivery • Catering",
    logoImage: resolvedLogo,
    logoImageAlt: raw.name || "Brand Logo",
    galleryImages: parsedGallery,
    operatingHours: parsedHours,
    holidayTimingEnabled: Boolean(raw.holidayTimingEnabled),
    holidayScheduleNotice: raw.holidayScheduleNotice || "Closed on Special Government Holidays",
    streetAddress: raw.address || raw.streetAddress || "House 42, Road 11, Block D, Banani",
    neighborhood: raw.neighborhood || "Gulshan / Banani, Dhaka",
    phone: raw.phone || "+880 1711-000000",
    managerEmail: raw.contactEmail || raw.managerEmail || "manager@dinedesk.com",
    latitude: raw.lat ? Number(raw.lat) : raw.latitude ? Number(raw.latitude) : 23.7937,
    longitude: raw.lng ? Number(raw.lng) : raw.longitude ? Number(raw.longitude) : 90.4043,
    coverageRadiusKm: raw.coverageRadiusKm ? Number(raw.coverageRadiusKm) : 8.5,
    lastOrderMinutesBeforeClose: raw.lastOrderMinutesBeforeClose ? Number(raw.lastOrderMinutesBeforeClose) : 30,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
  };
}

export default function RestaurantProfilePage() {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [savedProfile, setSavedProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Validation & Visual Crop
  const [nameError, setNameError] = useState("");
  const [coverCropY, setCoverCropY] = useState(50);

  // Modals
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [isRepositionModalOpen, setIsRepositionModalOpen] = useState(false);
  const [isRecalibratePinModalOpen, setIsRecalibratePinModalOpen] = useState(false);
  const [isBulkHoursModalOpen, setIsBulkHoursModalOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  // Floating Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type?: "success" | "error" | "info" } | null>(null);

  const showToast = (title: string, description: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ title, description, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Fetch Real Database Record
  const fetchProfileFromDB = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getRequestHeaders();
      let res = await fetch(`${API_BASE_URL}/restaurants/vendor/profile`, {
        credentials: "include",
        headers,
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/restaurants`, {
          credentials: "include",
          headers,
        });
      }

      if (res.ok) {
        const json = await res.json();
        const raw = json.data ? (Array.isArray(json.data) ? json.data[0] : json.data) : json;
        const normalized = buildFallbackProfile(raw);
        setProfile(normalized);
        setSavedProfile(normalized);
      } else {
        showToast("Notice", "Creating default database configuration for new vendor.", "info");
        const initial = buildFallbackProfile({});
        setProfile(initial);
        setSavedProfile(initial);
      }
    } catch (err) {
      console.error("Failed to load restaurant profile:", err);
      showToast("Connection Alert", "Could not fetch profile from PostgreSQL.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileFromDB();
  }, [fetchProfileFromDB]);

  // Dirty State
  const isDirty = useMemo(() => {
    if (!profile || !savedProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(savedProfile);
  }, [profile, savedProfile]);

  // Completeness Audit
  const completenessAudit = useMemo(() => {
    if (!profile) return { percentage: 0, completedCount: 0, totalCount: 6, items: [] };
    const items = [
      { id: "name", label: "Restaurant Name & Tagline", completed: Boolean(profile.name && profile.tagline) },
      { id: "cuisines", label: "Cuisine Tags Defined", completed: profile.cuisineTags.length > 0 },
      { id: "cover", label: "Brand Cover & Logo Uploaded", completed: Boolean(profile.coverImage && profile.logoImage) },
      { id: "hours", label: "Operating Schedule Configured", completed: profile.operatingHours.some((h) => h.isOpen) },
      { id: "address", label: "Physical Address & Neighborhood", completed: Boolean(profile.streetAddress && profile.neighborhood) },
      { id: "contact", label: "Direct Phone & Manager Email", completed: Boolean(profile.phone && profile.managerEmail) },
    ];
    const completedCount = items.filter((i) => i.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    return { percentage, completedCount, totalCount: items.length, items };
  }, [profile]);

  // Cloudinary Direct Upload Handler
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/menus/vendor/upload-image`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to upload image to Cloudinary");
    }

    const data = await res.json();
    return data.url;
  };

  // Form Field Handlers
  const handleNameChange = (val: string) => {
    setProfile((prev) => (prev ? { ...prev, name: val } : prev));
    if (val.trim().length >= 3) setNameError("");
  };

  const handleTaglineChange = (val: string) => {
    setProfile((prev) => (prev ? { ...prev, tagline: val } : prev));
  };

  const handleAddCuisineTag = (tag: string) => {
    if (!profile) return;
    if (!profile.cuisineTags.includes(tag)) {
      setProfile((prev) => (prev ? { ...prev, cuisineTags: [...prev.cuisineTags, tag] } : prev));
    }
  };

  const handleRemoveCuisineTag = (tag: string) => {
    setProfile((prev) => (prev ? { ...prev, cuisineTags: prev.cuisineTags.filter((t) => t !== tag) } : prev));
  };

  const handlePriceTierChange = (tier: PriceTier) => {
    setProfile((prev) => (prev ? { ...prev, priceTier: tier } : prev));
  };

  const handleLicenseChange = (val: string) => {
    setProfile((prev) => (prev ? { ...prev, licenseReference: val } : prev));
  };

  // Media Handlers
  const handleCoverFileSelected = async (file: File) => {
    showToast("Uploading Cover...", "Uploading image to Cloudinary CDN.", "info");
    try {
      const url = await uploadToCloudinary(file);
      setProfile((prev) => (prev ? { ...prev, coverImage: url } : prev));
      showToast("Cover Updated", "Cover photo uploaded and verified.", "success");
    } catch (err: any) {
      showToast("Upload Error", err.message || "Failed to upload cover photo.", "error");
    }
  };

  const handleLogoFileSelected = async (file: File) => {
    showToast("Uploading Avatar...", "Uploading logo to Cloudinary CDN.", "info");
    try {
      const url = await uploadToCloudinary(file);

      // 1. Immediately update in UI state
      setProfile((prev) => (prev ? { ...prev, logoImage: url } : prev));
      setSavedProfile((prev) => (prev ? { ...prev, logoImage: url } : prev));

      // 2. Persist to PostgreSQL backend immediately
      const headers = getRequestHeaders();
      await fetch(`${API_BASE_URL}/restaurants/vendor/profile`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          logoImage: url,
          name: profile?.name,
        }),
      });

      showToast("Avatar Updated", "Brand avatar saved and synced with PostgreSQL.", "success");
    } catch (err: any) {
      showToast("Upload Error", err.message || "Failed to upload brand avatar.", "error");
    }
  };

  const handleAddGalleryMedia = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      showToast("Uploading Atmosphere...", "Saving photo to Cloudinary CDN.", "info");
      try {
        const url = await uploadToCloudinary(file);
        const newPhoto: GalleryPhoto = {
          id: `gal-${Date.now()}`,
          url,
          alt: "Restaurant Ambience",
          caption: "Atmosphere & Dining Space",
        };
        setProfile((prev) => (prev ? { ...prev, galleryImages: [...prev.galleryImages, newPhoto] } : prev));
        showToast("Photo Added", "Atmosphere photo added to gallery.", "success");
      } catch (err: any) {
        showToast("Upload Error", err.message || "Failed to upload atmosphere image.", "error");
      }
    };
    input.click();
  };

  const handleRemoveGalleryPhoto = (id: string) => {
    setProfile((prev) => (prev ? { ...prev, galleryImages: prev.galleryImages.filter((p) => p.id !== id) } : prev));
    showToast("Photo Removed", "Atmosphere photo deleted from gallery.", "info");
  };

  // Operating Hours Handlers
  const handleToggleDayStatus = (dayName: string) => {
    setProfile((prev) =>
      prev
        ? {
          ...prev,
          operatingHours: prev.operatingHours.map((d) => (d.day === dayName ? { ...d, isOpen: !d.isOpen } : d)),
        }
        : prev
    );
  };

  const handleTimeChange = (dayName: string, field: "openingTime" | "closingTime", val: string) => {
    setProfile((prev) =>
      prev
        ? {
          ...prev,
          operatingHours: prev.operatingHours.map((d) => (d.day === dayName ? { ...d, [field]: val } : d)),
        }
        : prev
    );
  };

  const handleServiceTypeChange = (dayName: string, val: string) => {
    setProfile((prev) =>
      prev
        ? {
          ...prev,
          operatingHours: prev.operatingHours.map((d) => (d.day === dayName ? { ...d, serviceType: val } : d)),
        }
        : prev
    );
  };

  const handleApplyBulkHours = (selectedDays: string[], openTime: string, closeTime: string, serviceType: string) => {
    setProfile((prev) =>
      prev
        ? {
          ...prev,
          operatingHours: prev.operatingHours.map((d) =>
            selectedDays.includes(d.day)
              ? { ...d, isOpen: true, openingTime: openTime, closingTime: closeTime, serviceType: serviceType || d.serviceType }
              : d
          ),
        }
        : prev
    );
    showToast("Bulk Schedule Applied", `Updated hours for ${selectedDays.length} days.`, "success");
  };

  // Location Handlers
  const handleStreetAddressChange = (val: string) => {
    setProfile((prev) => (prev ? { ...prev, streetAddress: val } : prev));
  };

  const handleNeighborhoodChange = (val: string) => {
    setProfile((prev) => (prev ? { ...prev, neighborhood: val } : prev));
  };

  const handlePhoneChange = (val: string) => {
    setProfile((prev) => (prev ? { ...prev, phone: val } : prev));
  };

  const handleEmailChange = (val: string) => {
    setProfile((prev) => (prev ? { ...prev, managerEmail: val } : prev));
  };

  const handleUpdateCoordinates = (lat: number, lng: number, radiusKm: number) => {
    setProfile((prev) =>
      prev ? { ...prev, latitude: lat, longitude: lng, coverageRadiusKm: radiusKm } : prev
    );
    showToast("Coordinates Synchronized", `GPS calibrated: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, "success");
  };

  // 2. Commit Entire Profile directly to PostgreSQL
  const handleSaveProfile = async () => {
    if (!profile) return;
    if (!profile.name.trim()) {
      setNameError("Restaurant name is required.");
      showToast("Validation Error", "Please provide a valid restaurant title.", "error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSaving(true);
    try {
      const headers = getRequestHeaders();
      const payload = {
        name: profile.name,
        tagline: profile.tagline,
        cuisineTags: profile.cuisineTags,
        cuisineCategory: profile.cuisineTags[0] || "Desi",
        priceTier: profile.priceTier,
        licenseReference: profile.licenseReference,
        hygieneGrade: profile.hygieneGrade,
        coverUrl: profile.coverImage,
        coverImage: profile.coverImage,
        logoImage: profile.logoImage,
        galleryImages: profile.galleryImages,
        gallery: profile.galleryImages.map((g) => g.url),
        operatingHours: profile.operatingHours,
        holidayTimingEnabled: profile.holidayTimingEnabled,
        holidayScheduleNotice: profile.holidayScheduleNotice,
        address: profile.streetAddress,
        streetAddress: profile.streetAddress,
        neighborhood: profile.neighborhood,
        phone: profile.phone,
        contactEmail: profile.managerEmail,
        managerEmail: profile.managerEmail,
        latitude: profile.latitude,
        lat: profile.latitude,
        longitude: profile.longitude,
        lng: profile.longitude,
        coverageRadiusKm: profile.coverageRadiusKm,
        lastOrderMinutesBeforeClose: profile.lastOrderMinutesBeforeClose,
      };

      const res = await fetch(`${API_BASE_URL}/restaurants/vendor/profile`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const updated = buildFallbackProfile(json.data || payload);
        setProfile(updated);
        setSavedProfile(updated);
        showToast("Settings Saved", "Profile parameters committed to PostgreSQL.", "success");
      } else {
        const errorJson = await res.json().catch(() => ({}));
        showToast("Save Failed", errorJson.message || "Could not commit to PostgreSQL.", "error");
      }
    } catch {
      showToast("Network Error", "Failed to reach backend database service.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard & Revert
  const handleDiscardClick = () => {
    if (isDirty) {
      setIsDiscardModalOpen(true);
    } else {
      showToast("Up to Date", "Form has no unsaved changes.", "info");
    }
  };

  const handleConfirmDiscard = () => {
    setProfile(savedProfile);
    setNameError("");
    showToast("Reverted", "Changes reset to database version.", "info");
  };

  if (loading || !profile) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-[#1b3b2b]">
        <div className="w-12 h-12 rounded-2xl bg-[#1b3b2b] text-[#E2B774] flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <span className="material-symbols-outlined text-2xl">storefront</span>
        </div>
        <p className="text-xs font-bold tracking-wider uppercase text-neutral-400">
          Syncing Restaurant Settings with PostgreSQL...
        </p>
      </div>
    );
  }

  const allDayNames = profile.operatingHours.map((h) => h.day);

  return (
    <div className="w-full min-h-screen bg-[#FBFBFA] font-sans text-[#1b3b2b] antialiased pb-20 selection:bg-[#1b3b2b] selection:text-white">
      {/* Centered Main Layout Container without duplicate sidebar padding */}
      <main className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6">

        {/* 1. Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#1b3b2b] font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-lg">storefront</span>
              <span>Database-Driven Restaurant Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
              Profile &amp; Operating Hours
            </h1>
            <p className="text-xs text-neutral-500 font-medium max-w-2xl">
              Configure brand identity, operating hours, geolocation coordinates, and dietary specifications stored directly in PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`/restaurant/${profile.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-[#1b3b2b] text-xs font-bold border border-[#1b3b2b]/15 shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <span>View Live Storefront</span>
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </a>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Verified Partner</span>
            </div>
          </div>
        </motion.div>

        {/* 2. Floating Action Ribbon */}
        <div className="sticky top-20 z-20 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#1b3b2b]/10 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              Synchronized with PostgreSQL • Last committed: <strong className="text-[#1b3b2b]">{profile.updatedAt}</strong>
            </span>
            {isDirty && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold animate-pulse">
                • Unsaved Changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscardClick}
              disabled={!isDirty || isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">{isSaving ? "sync" : "save"}</span>
              <span>{isSaving ? "Saving to Database..." : "Save Profile Changes"}</span>
            </motion.button>
          </div>
        </div>

        {/* 3. Responsive 8-Col Form + 4-Col Live Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Form Elements */}
          <div className="lg:col-span-8 space-y-6">
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

            <MediaSection
              coverImage={profile.coverImage}
              coverImageAlt={profile.coverImageAlt}
              coverSubtitle={profile.coverSubtitle}
              coverCropY={coverCropY}
              logoImage={profile.logoImage}
              logoImageAlt={profile.logoImageAlt}
              galleryImages={profile.galleryImages}
              onChangeCoverClick={() => { }}
              onRepositionClick={() => setIsRepositionModalOpen(true)}
              onUploadLogoClick={() => { }}
              onAddGalleryMediaClick={handleAddGalleryMedia}
              onRemoveGalleryPhoto={handleRemoveGalleryPhoto}
              onViewPhotoLightbox={(photo) => setLightboxPhoto(photo)}
              onCoverFileSelected={handleCoverFileSelected}
              onLogoFileSelected={handleLogoFileSelected}
            />

            <OperatingHoursSection
              operatingHours={profile.operatingHours}
              holidayTimingEnabled={profile.holidayTimingEnabled}
              holidayScheduleNotice={profile.holidayScheduleNotice || ""}
              onToggleHolidayTiming={() =>
                setProfile((prev) => (prev ? { ...prev, holidayTimingEnabled: !prev.holidayTimingEnabled } : prev))
              }
              onHolidayNoticeChange={(val) =>
                setProfile((prev) => (prev ? { ...prev, holidayScheduleNotice: val } : prev))
              }
              onToggleDayStatus={handleToggleDayStatus}
              onTimeChange={handleTimeChange}
              onServiceTypeChange={handleServiceTypeChange}
              onOpenBulkHoursModal={() => setIsBulkHoursModalOpen(true)}
            />

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
              onRecalibratePinClick={() => setIsRecalibratePinModalOpen(true)}
            />
          </div>

          {/* Aside: Real-Time Preview & Audit */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
            <StorefrontPreviewCard
              name={profile.name}
              cuisineTags={profile.cuisineTags}
              priceTier={profile.priceTier}
              coverImage={profile.coverImage}
              logoImage={profile.logoImage}
              neighborhood={profile.neighborhood}
              operatingHours={profile.operatingHours}
            />

            <CompletenessChecklist audit={completenessAudit} />

            <DispatchHelpCard />
          </aside>
        </div>

        {/* Bottom Footer Details */}
        <div className="pt-6 border-t border-[#1b3b2b]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-sm text-[#1b3b2b]">database</span>
            <span>Active Database ID: {profile.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscardClick}
              disabled={!isDirty || isSaving}
              className="px-4 py-2 rounded-xl text-neutral-500 font-bold hover:bg-neutral-100 disabled:opacity-40"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-5 py-2 bg-[#1b3b2b] text-white rounded-xl font-bold shadow-xs hover:bg-[#1b3b2b]/90 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </div>
      </main>

      {/* Floating Animated Toast Notifications */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto p-3.5 rounded-2xl border shadow-lg bg-white flex items-start gap-3 ${toastMessage.type === "error"
                  ? "border-rose-300 text-rose-800"
                  : toastMessage.type === "info"
                    ? "border-amber-300 text-amber-800"
                    : "border-emerald-300 text-emerald-800"
                }`}
            >
              <span className="material-symbols-outlined text-lg mt-0.5">
                {toastMessage.type === "error" ? "error" : "check_circle"}
              </span>
              <div className="flex-1">
                <span className="font-semibold text-xs block">{toastMessage.title}</span>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{toastMessage.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auxiliary Modals */}
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