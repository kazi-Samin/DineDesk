"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import DiscardProfileModal from "@/components/customer/profile/DiscardProfileModal";
import AuthProtocolModal from "@/components/customer/profile/AuthProtocolModal";

import {
  CustomerProfileData,
  DietaryPreference,
  PreferredLanguage,
} from "@/types/customerProfile";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { getCustomerAddresses } from "@/services/mockCustomerProfileService";
import { getSavedRestaurants, getSavedDishes } from "@/services/mockCustomerFavoritesService";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

const DIETARY_OPTIONS: { id: DietaryPreference; label: string; icon?: string }[] = [
  { id: "halal_only", label: "Halal Only", icon: "check" },
  { id: "nut_allergy", label: "Nut Allergy", icon: "warning" },
  { id: "mild_spice", label: "Mild Spice" },
  { id: "no_shellfish", label: "No Shellfish" },
];

const AVAILABLE_LANGUAGES: { code: string; label: string; nativeName: string; flag: string }[] = [
  { code: "en", label: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "bn", label: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "es", label: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", label: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "ar", label: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "de", label: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "zh", label: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "it", label: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "ru", label: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ko", label: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "tr", label: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "ur", label: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "nl", label: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", label: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "th", label: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "ms", label: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "id", label: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "fa", label: "Persian", nativeName: "فارسی", flag: "🇮🇷" },
  { code: "sv", label: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "el", label: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
];

export default function CustomerProfilePage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");
  const { user } = useAuth();

  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [savedSnapshot, setSavedSnapshot] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [addressCount, setAddressCount] = useState(0);
  const [savedSpotsCount, setSavedSpotsCount] = useState(14);
  const [loyaltyPoints, setLoyaltyPoints] = useState(20);
  const [totalOrdersCount, setTotalOrdersCount] = useState(28);
  const [activeBookingsCount, setActiveBookingsCount] = useState(1);

  const [isEditing, setIsEditing] = useState(false);

  // Independent form states so user can type freely without interference
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState<PreferredLanguage>("en");
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [profileErrors, setProfileErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
  }>({});

  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: "password" | "2fa" | null;
  }>({ isOpen: false, mode: null });

  const [toast, setToast] = useState<{
    message: string | null;
    type: "success" | "error" | "info";
  }>({ message: null, type: "success" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { ...prev, message: null } : prev));
    }, 3200);
  };

  const broadcastProfileUpdate = (updatedProfile: CustomerProfileData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dinedesk_customer_profile", JSON.stringify(updatedProfile));
      localStorage.setItem("dinedesk_user_name", updatedProfile.fullName);
      localStorage.setItem("dinedesk_user_email", updatedProfile.email);
      localStorage.setItem("dinedesk_user_phone", updatedProfile.phone);
      if (updatedProfile.avatarUrl) {
        localStorage.setItem("dinedesk_user_avatar", updatedProfile.avatarUrl);
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("profile-updated"));
    }
  };

  // Load Profile once on mount
  useEffect(() => {
    const loadDatabaseProfile = async () => {
      try {
        let loadedProfile = INITIAL_CUSTOMER_PROFILE;

        // Check localStorage first for instant persistence
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("dinedesk_customer_profile");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              loadedProfile = { ...INITIAL_CUSTOMER_PROFILE, ...parsed };
            } catch (e) {
              // ignore
            }
          }
        }

        // Fetch from Deployed Database Backend API
        const res = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          const userData = data.user || data;
          loadedProfile = {
            ...loadedProfile,
            ...userData,
            fullName: userData.fullName || userData.name || loadedProfile.fullName,
          };
        }

        setProfile(loadedProfile);
        setSavedSnapshot(loadedProfile);
        setFullName(loadedProfile.fullName || "");
        setEmail(loadedProfile.email || "");
        setPhone(loadedProfile.phone || "");
        setLanguage(loadedProfile.language || "en");
        setDietaryPrefs(loadedProfile.dietaryPreferences || []);
        setAvatarUrl(loadedProfile.avatarUrl || INITIAL_CUSTOMER_PROFILE.avatarUrl);

        // Metrics computation
        const loadedAddresses = getCustomerAddresses();
        setAddressCount(loadedAddresses.length);

        const savedRest = getSavedRestaurants();
        const savedDish = getSavedDishes();
        const storedSavedSpots = JSON.parse(localStorage.getItem("dinedesk_saved_spots") || "[]");
        setSavedSpotsCount(Math.max(14, savedRest.length + savedDish.length, storedSavedSpots.length));

        const storedPayments = JSON.parse(localStorage.getItem("dinedesk_stripe_payments") || "[]");
        const totalPayments = Math.max(1, storedPayments.length);
        setLoyaltyPoints(totalPayments * 20);
        setTotalOrdersCount(Math.max(28, totalPayments));

        const storedBookings = JSON.parse(localStorage.getItem("dinedesk_customer_bookings") || "[]");
        setActiveBookingsCount(Math.max(1, storedBookings.length, loadedProfile.stats?.activeBookings ?? 1));
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadDatabaseProfile();
  }, [user]);

  const hasUnsavedProfileChanges = useMemo(() => {
    if (!isLoaded) return false;
    return (
      fullName !== savedSnapshot.fullName ||
      email !== savedSnapshot.email ||
      phone !== savedSnapshot.phone ||
      language !== savedSnapshot.language ||
      avatarUrl !== savedSnapshot.avatarUrl ||
      JSON.stringify(dietaryPrefs.slice().sort()) !==
      JSON.stringify(savedSnapshot.dietaryPreferences.slice().sort())
    );
  }, [isLoaded, fullName, email, phone, language, avatarUrl, dietaryPrefs, savedSnapshot]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPG, PNG, WebP).", "error");
      return;
    }

    try {
      setIsUploadingPhoto(true);
      showToast("Uploading image to Cloudinary...", "info");

      const result = await uploadImageToCloudinary(file, {
        folder: "dinedesk/avatars",
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
        targetMaxMB: 0.5,
      });

      if (result.success && result.url) {
        setAvatarUrl(result.url);
        showToast("Photo uploaded successfully! Click 'Save Profile' to store in DB.", "success");
      } else {
        showToast("Failed to upload image.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Cloudinary upload error.", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    const defaultAvatar = INITIAL_CUSTOMER_PROFILE.avatarUrl;
    setAvatarUrl(defaultAvatar);
    showToast("Photo reset to default.", "info");
  };

  const toggleDietaryPreference = (pref: DietaryPreference) => {
    setDietaryPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const validateProfileForm = (): boolean => {
    const errors: { fullName?: string; email?: string; phone?: string } = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Please enter your name.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateProfileForm()) {
      showToast("Please fix the highlighted errors.", "error");
      return;
    }

    const updatedData: CustomerProfileData = {
      ...profile,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      language,
      dietaryPreferences: dietaryPrefs,
      avatarUrl,
    };

    try {
      // 1. Update local state & localStorage immediately
      setProfile(updatedData);
      setSavedSnapshot(updatedData);
      broadcastProfileUpdate(updatedData);

      // 2. Persist to Backend Database API
      await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: "include",
      }).catch(() => null);

      setIsEditing(false);
      showToast("Profile successfully updated and stored!");
    } catch (err) {
      setIsEditing(false);
      showToast("Profile updated successfully!");
    }
  };

  const handleStartEditing = () => {
    setFullName(profile.fullName || "");
    setEmail(profile.email || "");
    setPhone(profile.phone || "");
    setLanguage(profile.language || "en");
    setDietaryPrefs(profile.dietaryPreferences || []);
    setAvatarUrl(profile.avatarUrl || INITIAL_CUSTOMER_PROFILE.avatarUrl);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (hasUnsavedProfileChanges) {
      setIsDiscardModalOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const confirmDiscardChanges = () => {
    setFullName(savedSnapshot.fullName || "");
    setEmail(savedSnapshot.email || "");
    setPhone(savedSnapshot.phone || "");
    setLanguage(savedSnapshot.language || "en");
    setDietaryPrefs(savedSnapshot.dietaryPreferences || []);
    setAvatarUrl(savedSnapshot.avatarUrl || INITIAL_CUSTOMER_PROFILE.avatarUrl);
    setIsDiscardModalOpen(false);
    setIsEditing(false);
    showToast("Changes discarded.", "info");
  };

  if (!isLoaded) {
    return (
      <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col antialiased">
        <CustomerHeader userName={profile.fullName} userRole="Verified Foodie" avatarUrl={avatarUrl} onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex pt-20 flex-1">
          <CustomerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} onToggle={toggleSidebar} loyaltyPoints={loyaltyPoints} avatarUrl={avatarUrl} />
          <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
            <div className="w-full px-6 sm:px-10 py-10 max-w-4xl mx-auto flex-1 flex flex-col gap-6 animate-pulse">
              <div className="h-8 bg-[#1b3b2b]/10 rounded-xl w-64" />
              <div className="h-40 bg-[#1b3b2b]/10 rounded-3xl w-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col font-body-md antialiased selection:bg-[#1b3b2b] selection:text-white relative">
      <CustomerHeader
        userName={profile.fullName || "Diner"}
        userRole="Verified Foodie"
        avatarUrl={avatarUrl}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-20 flex-1">
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince="Member since 2023"
          avatarUrl={avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={activeBookingsCount}
          loyaltyPoints={loyaltyPoints}
        />

        <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>

          {/* Top Quick Stats Banner */}
          <section className="w-full px-6 sm:px-10 py-6 bg-gradient-to-r from-white via-[#f8f9f6] to-white border-b border-[#1b3b2b]/10 shadow-xs">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <h2 className="font-heading font-extrabold text-xl text-[#1b3b2b]">
                  Welcome back, {profile.fullName.split(" ")[0] || "Diner"}
                </h2>
                <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                  {profile.email} {profile.phone && `• ${profile.phone}`}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Total Orders
                  </span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">
                    {totalOrdersCount}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Bookings
                  </span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                    {activeBookingsCount}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Saved Spots
                  </span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/60 block">
                    Points
                  </span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                    {loyaltyPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Profile Core Container */}
          <div className="w-full px-6 sm:px-10 py-10 max-w-4xl mx-auto flex-1">
            <div className="flex flex-col w-full">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1b3b2b] tracking-tight">
                    Personal Profile
                  </h1>
                  <p className="text-xs font-medium text-[#1b3b2b]/70 mt-1">
                    Manage your account details and dietary preferences.
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/80 hover:bg-white text-[#1b3b2b] rounded-xl text-xs font-bold border border-[#1b3b2b]/20 transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {/* Delivery Addresses shortcut */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 mb-6 flex items-center justify-between gap-4 border border-[#1b3b2b]/15 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1b3b2b]/10 text-[#1b3b2b] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">location_on</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1b3b2b]">
                      Delivery Addresses
                    </h3>
                    <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                      You have {addressCount} saved {addressCount === 1 ? "address" : "addresses"}.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/customer/addresses"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#C05621] hover:underline shrink-0"
                >
                  <span>Manage</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {/* VIEW MODE */}
              {!isEditing ? (
                <div className="flex flex-col gap-6 mb-10">
                  {/* Profile Card */}
                  <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-[#1b3b2b]/15 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <img
                        src={profile.avatarUrl || "/avatars/tahmid-avatar.svg"}
                        alt={profile.fullName}
                        className="w-20 h-20 rounded-full object-cover shadow-md ring-2 ring-[#1b3b2b]/20 shrink-0 bg-white"
                        onError={(e) => {
                          e.currentTarget.src = "/avatars/tahmid-avatar.svg";
                        }}
                      />
                      <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                          <div className="flex items-start gap-1.5">
                            <h2 className="font-heading font-black text-xl text-[#1b3b2b] leading-tight">
                              {profile.fullName}
                            </h2>
                            <span
                              className="material-symbols-outlined text-sm text-emerald-600 shrink-0 -translate-y-0.5"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                              title="Verified Patron"
                            >
                              verified
                            </span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-[#1b3b2b]/70 mt-1">
                          Member since 2023 • Dhaka, Bangladesh
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="px-4 py-2 rounded-xl bg-[#f8f9f6] hover:bg-[#1b3b2b]/10 text-xs text-[#1b3b2b] transition-all flex items-center gap-1.5 font-bold cursor-pointer border border-[#1b3b2b]/20"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                      </button>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1b3b2b]/10">
                      <div className="p-4 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/10">
                        <span className="text-[10px] text-[#1b3b2b]/60 uppercase tracking-widest font-extrabold block mb-1">
                          Email
                        </span>
                        <span className="text-xs font-bold text-[#1b3b2b] truncate block">
                          {profile.email}
                        </span>
                      </div>

                      <div className="p-4 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/10">
                        <span className="text-[10px] text-[#1b3b2b]/60 uppercase tracking-widest font-extrabold block mb-1">
                          Phone
                        </span>
                        <span className="text-xs font-bold text-[#1b3b2b] truncate block">
                          {profile.phone || "Not provided"}
                        </span>
                      </div>

                      <div className="p-4 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/10">
                        <span className="text-[10px] text-[#1b3b2b]/60 uppercase tracking-widest font-extrabold block mb-1">
                          Language
                        </span>
                        <span className="text-xs font-bold text-[#1b3b2b] flex items-center gap-1.5 truncate">
                          <span>
                            {AVAILABLE_LANGUAGES.find((l) => l.code === profile.language)?.flag || "🌐"}
                          </span>
                          <span>
                            {AVAILABLE_LANGUAGES.find((l) => l.code === profile.language)?.label || "English"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div className="p-5 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/10 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#1b3b2b]">
                          Dietary Preferences
                        </span>
                        <span className="text-[10px] text-[#1b3b2b]/60 font-bold uppercase">
                          Shared with restaurants
                        </span>
                      </div>

                      {profile.dietaryPreferences && profile.dietaryPreferences.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.dietaryPreferences.map((pref) => {
                            const option = DIETARY_OPTIONS.find((o) => o.id === pref);
                            return (
                              <span
                                key={pref}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b3b2b] text-white rounded-xl text-xs font-extrabold shadow-xs"
                              >
                                {option?.label || pref}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-[#1b3b2b]/60 italic font-medium">
                          No dietary preferences set.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security Card */}
                  <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-[#1b3b2b]/15 flex flex-col gap-5">
                    <div>
                      <h3 className="font-heading font-extrabold text-base text-[#1b3b2b]">
                        Security
                      </h3>
                      <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                        Manage your password and authentication settings.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        className="px-5 py-2.5 bg-[#f8f9f6] hover:bg-[#1b3b2b]/10 text-[#1b3b2b] rounded-2xl text-xs font-extrabold border border-[#1b3b2b]/20 transition-all cursor-pointer shadow-xs"
                        type="button"
                        onClick={() => setAuthModalState({ isOpen: true, mode: "password" })}
                      >
                        Change Password
                      </button>
                      <button
                        className="px-5 py-2.5 bg-[#f8f9f6] hover:bg-[#1b3b2b]/10 text-[#1b3b2b] rounded-2xl text-xs font-extrabold border border-[#1b3b2b]/20 transition-all cursor-pointer shadow-xs"
                        type="button"
                        onClick={() => setAuthModalState({ isOpen: true, mode: "2fa" })}
                      >
                        Two-Factor Authentication
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <form
                  onSubmit={handleSaveProfile}
                  className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-[#1b3b2b]/15 flex flex-col gap-6 mb-10"
                >
                  <div className="pb-4 border-b border-[#1b3b2b]/10">
                    <h2 className="font-heading font-extrabold text-lg text-[#1b3b2b]">
                      Edit Profile
                    </h2>
                    <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                      Update your contact details and dietary notes.
                    </p>
                  </div>

                  {/* Photo Edit */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/10">
                    <div className="relative shrink-0">
                      <img
                        alt={fullName}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-[#1b3b2b]/20 bg-white shadow-md"
                        src={avatarUrl || "/avatars/tahmid-avatar.svg"}
                        onError={(e) => {
                          e.currentTarget.src = "/avatars/tahmid-avatar.svg";
                        }}
                      />
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center">
                          <span className="material-symbols-outlined text-white animate-spin text-base">
                            progress_activity
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <span className="text-xs font-extrabold text-[#1b3b2b]">
                        Profile Photo
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={isUploadingPhoto}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center gap-1.5 transition-all"
                        >
                          {isUploadingPhoto ? "Optimizing..." : "Change Photo"}
                        </button>
                        <button
                          type="button"
                          disabled={isUploadingPhoto}
                          onClick={handleRemovePhoto}
                          className="px-3 py-2 text-xs text-red-600 hover:text-red-800 font-extrabold cursor-pointer disabled:opacity-50"
                        >
                          Reset
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-[#1b3b2b]" htmlFor="fullName">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9f6] rounded-2xl text-xs font-bold text-[#1b3b2b] focus:outline-none focus:bg-white focus:border-[#1b3b2b] border border-[#1b3b2b]/20 shadow-inner"
                      placeholder="e.g. Fourkan Bin Ilias"
                      required
                    />
                    {profileErrors.fullName && (
                      <span className="text-[11px] text-red-600 font-bold">
                        {profileErrors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-extrabold text-[#1b3b2b]" htmlFor="email">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9f6] rounded-2xl text-xs font-bold text-[#1b3b2b] focus:outline-none focus:bg-white focus:border-[#1b3b2b] border border-[#1b3b2b]/20 shadow-inner"
                        placeholder="pinonfurkan1@gmail.com"
                        required
                      />
                      {profileErrors.email && (
                        <span className="text-[11px] text-red-600 font-bold">
                          {profileErrors.email}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-extrabold text-[#1b3b2b]" htmlFor="phone">
                        Phone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9f6] rounded-2xl text-xs font-bold text-[#1b3b2b] focus:outline-none focus:bg-white focus:border-[#1b3b2b] border border-[#1b3b2b]/20 shadow-inner"
                        placeholder="+880 1711-234567"
                      />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-[#1b3b2b]" htmlFor="language">
                      Language Preference
                    </label>
                    <div className="relative max-w-sm">
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full px-4 py-3 bg-[#f8f9f6] rounded-2xl text-xs font-bold text-[#1b3b2b] focus:outline-none focus:bg-white focus:border-[#1b3b2b] border border-[#1b3b2b]/20 shadow-inner appearance-none cursor-pointer pr-10"
                      >
                        {AVAILABLE_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.label}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-base text-[#1b3b2b]/50 pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-[#1b3b2b]">
                      Dietary Preferences
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map((opt) => {
                        const isSelected = dietaryPrefs.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer font-extrabold ${isSelected
                                ? "bg-[#1b3b2b] text-white shadow-md"
                                : "bg-[#f8f9f6] text-[#1b3b2b]/70 hover:bg-[#1b3b2b]/10 border border-[#1b3b2b]/20"
                              }`}
                            type="button"
                            onClick={() => toggleDietaryPreference(opt.id)}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-xs">
                                check
                              </span>
                            )}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-5 border-t border-[#1b3b2b]/10 mt-2">
                    <button
                      className="text-xs text-[#1b3b2b]/70 hover:text-[#1b3b2b] cursor-pointer font-extrabold uppercase tracking-wider"
                      type="button"
                      onClick={handleCancelEditing}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-6 py-3 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                      type="submit"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <CustomerFooter />
        </main>
      </div>

      <DiscardProfileModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={confirmDiscardChanges}
      />

      <AuthProtocolModal
        isOpen={authModalState.isOpen}
        mode={authModalState.mode}
        twoFactorPhone={profile.twoFactorPhone || "+880 1711-234567"}
        onClose={() => setAuthModalState({ isOpen: false, mode: null })}
        onSuccess={(msg) => showToast(msg, "success")}
      />

      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 bg-[#1b3b2b] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-xs font-extrabold tracking-wide"
          >
            <span className="material-symbols-outlined text-amber-400 text-lg">
              check_circle
            </span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}