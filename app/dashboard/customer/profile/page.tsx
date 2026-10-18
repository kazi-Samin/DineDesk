"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import DiscardProfileModal from "@/components/customer/profile/DiscardProfileModal";
import AuthProtocolModal from "@/components/customer/profile/AuthProtocolModal";
import ProfileToast from "@/components/customer/profile/ProfileToast";

import {
  CustomerProfileData,
  DietaryPreference,
  PreferredLanguage,
} from "@/types/customerProfile";
import {
  getCustomerProfile,
  saveCustomerProfile,
  getCustomerAddresses,
} from "@/services/mockCustomerProfileService";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { getSavedRestaurants, getSavedDishes } from "@/services/mockCustomerFavoritesService";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";

const DIETARY_OPTIONS: { id: DietaryPreference; label: string; icon?: string }[] = [
  { id: "halal_only", label: "Halal Only", icon: "check" },
  { id: "nut_allergy", label: "Nut Allergy", icon: "warning" },
  { id: "mild_spice", label: "Mild Spice" },
  { id: "no_shellfish", label: "No Shellfish" },
];

export default function CustomerProfilePage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");
  const { user } = useAuth();

  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [savedSnapshot, setSavedSnapshot] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [addressCount, setAddressCount] = useState(0);
  const [savedSpotsCount, setSavedSpotsCount] = useState(0);

  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState(INITIAL_CUSTOMER_PROFILE.fullName);
  const [email, setEmail] = useState(INITIAL_CUSTOMER_PROFILE.email);
  const [phone, setPhone] = useState(INITIAL_CUSTOMER_PROFILE.phone);
  const [language, setLanguage] = useState<PreferredLanguage>(INITIAL_CUSTOMER_PROFILE.language);
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>(
    INITIAL_CUSTOMER_PROFILE.dietaryPreferences
  );
  const [avatarUrl, setAvatarUrl] = useState(INITIAL_CUSTOMER_PROFILE.avatarUrl);

  const [profileErrors, setProfileErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
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

  const syncFormWithProfile = (data: CustomerProfileData) => {
    setProfile(data);
    setSavedSnapshot(data);
    setFullName(data.fullName);
    setEmail(data.email);
    setPhone(data.phone);
    setLanguage(data.language);
    setDietaryPrefs(data.dietaryPreferences || []);
    setAvatarUrl(data.avatarUrl);
    setProfileErrors({});
  };

  useEffect(() => {
    const loadedProfile = getCustomerProfile();
    if (user && user.name) {
      loadedProfile.fullName = user.name;
      loadedProfile.email = user.email || loadedProfile.email;
      if (user.phone) loadedProfile.phone = user.phone;
    }
    const loadedAddresses = getCustomerAddresses();
    const savedRest = getSavedRestaurants();
    const savedDish = getSavedDishes();

    syncFormWithProfile(loadedProfile);
    setAddressCount(loadedAddresses.length);
    setSavedSpotsCount(savedRest.length + savedDish.length);
    setIsLoaded(true);
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
  }, [
    isLoaded,
    fullName,
    email,
    phone,
    language,
    avatarUrl,
    dietaryPrefs,
    savedSnapshot,
  ]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setProfileErrors((prev) => ({
        ...prev,
        avatar: "Please select a JPG, PNG, or WebP image.",
      }));
      showToast("Invalid format. Please select an image.", "error");
      return;
    }

    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      setProfileErrors((prev) => ({
        ...prev,
        avatar: "File size exceeds 4MB limit.",
      }));
      showToast("Image is too large. Maximum size is 4MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        setProfileErrors((prev) => ({ ...prev, avatar: undefined }));
        showToast("Photo updated.", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(INITIAL_CUSTOMER_PROFILE.avatarUrl);
    setProfileErrors((prev) => ({ ...prev, avatar: undefined }));
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
      errors.email = "Please enter a valid email.";
    }

    const phoneRegex = /^[+0-9\s-]{8,18}$/;
    if (!phone.trim() || !phoneRegex.test(phone.trim())) {
      errors.phone = "Please enter a valid phone number.";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateProfileForm()) {
      showToast("Please fix the errors before saving.", "error");
      return;
    }

    const updated: CustomerProfileData = {
      ...profile,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      language,
      dietaryPreferences: dietaryPrefs,
      avatarUrl,
    };

    const saved = saveCustomerProfile(updated);
    syncFormWithProfile(saved);
    setIsEditing(false);
    showToast("Profile updated successfully.");
  };

  const handleStartEditing = () => {
    syncFormWithProfile(profile);
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
    syncFormWithProfile(savedSnapshot);
    setIsDiscardModalOpen(false);
    setIsEditing(false);
    showToast("Changes discarded.", "info");
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      <CustomerHeader
        userName={profile.fullName || "Diner"}
        userRole="Verified Foodie"
        avatarUrl={profile.avatarUrl}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-16 flex-1">
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince="Member since 2023"
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={1}
          loyaltyPoints={1450}
        />

        <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
          {/* Top Quick Stats */}
          <section className="w-full px-6 py-5 bg-surface-container-low border-b border-outline-variant/30">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  Welcome back, {profile.fullName.split(" ")[0] || "Diner"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {profile.email} • {profile.phone}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-outline-variant shadow-xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Total Orders
                  </span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    {profile.stats.totalOrders}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-outline-variant shadow-xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Bookings
                  </span>
                  <span className="text-lg font-bold text-secondary mt-0.5 block">
                    {profile.stats.activeBookings}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-outline-variant shadow-xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Saved Spots
                  </span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-outline-variant shadow-xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Points
                  </span>
                  <span className="text-lg font-bold text-primary-container mt-0.5 block">
                    {profile.stats.loyaltyPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Core Container */}
          <div className="w-full px-6 py-8 max-w-4xl mx-auto flex-1">
            <div className="flex flex-col w-full">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    Personal Profile
                  </h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Manage your account details and dietary preferences.
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {/* Delivery Addresses shortcut */}
              <div className="bg-surface-container-lowest rounded-xl p-4 mb-6 flex items-center justify-between gap-4 border border-outline-variant shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary">
                      Delivery Addresses
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      You have {addressCount} saved {addressCount === 1 ? "address" : "addresses"}.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/customer/addresses"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors shrink-0"
                >
                  <span>Manage</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {/* VIEW MODE: Clean, clear read-only view */}
              {!isEditing ? (
                <div className="flex flex-col gap-6 mb-10">
                  {/* Profile Card */}
                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                      <img
                        src={profile.avatarUrl || "/avatars/tahmid-avatar.svg"}
                        alt={profile.fullName}
                        className="w-20 h-20 rounded-full object-cover shadow-xs ring-2 ring-primary-container/20 shrink-0 bg-surface-container"
                        onError={(e) => {
                          e.currentTarget.src = "/avatars/tahmid-avatar.svg";
                        }}
                      />
                      <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                          <h2 className="text-xl font-bold text-primary">
                            {profile.fullName}
                          </h2>
                          <span className="bg-primary-fixed/80 text-on-primary-fixed px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Member since 2023 • Dhaka, Bangladesh
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="px-3.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs font-medium border border-outline-variant/30 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                      </button>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
                      <div className="p-3.5 bg-surface-container-low/40 rounded-xl border border-outline-variant/20">
                        <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold block mb-0.5">
                          Email
                        </span>
                        <span className="text-sm font-medium text-on-surface">
                          {profile.email}
                        </span>
                      </div>

                      <div className="p-3.5 bg-surface-container-low/40 rounded-xl border border-outline-variant/20">
                        <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold block mb-0.5">
                          Phone
                        </span>
                        <span className="text-sm font-medium text-on-surface">
                          {profile.phone}
                        </span>
                      </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div className="p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/20 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface">
                          Dietary Preferences
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
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
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-container text-on-primary rounded-md text-xs font-medium"
                              >
                                {option?.label || pref}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-on-surface-variant italic">
                          No dietary preferences set.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security Card */}
                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant flex flex-col gap-4">
                    <div>
                      <h3 className="text-base font-bold text-primary">
                        Security
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Manage your password and authentication settings.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-primary rounded-lg text-xs font-semibold border border-outline-variant transition-colors cursor-pointer"
                        type="button"
                        onClick={() => setAuthModalState({ isOpen: true, mode: "password" })}
                      >
                        Change Password
                      </button>
                      <button
                        className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-primary rounded-lg text-xs font-semibold border border-outline-variant transition-colors cursor-pointer"
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
                  className="bg-surface-container-lowest p-6 rounded-xl shadow-xs border border-outline-variant flex flex-col gap-5 mb-10"
                >
                  <div className="pb-3 border-b border-outline-variant/30">
                    <h2 className="text-lg font-bold text-primary">
                      Edit Profile
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Update your contact details and dietary notes.
                    </p>
                  </div>

                  {/* Photo Edit */}
                  <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                    <img
                      alt={fullName}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-container/20 shrink-0 bg-surface-container"
                      src={avatarUrl || "/avatars/tahmid-avatar.svg"}
                      onError={(e) => {
                        e.currentTarget.src = "/avatars/tahmid-avatar.svg";
                      }}
                    />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-on-surface">
                        Profile Photo
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 bg-surface-container-lowest hover:bg-surface-container rounded-lg text-xs text-primary font-medium border border-outline-variant cursor-pointer shadow-xs"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1 text-xs text-secondary hover:text-error font-medium cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface" htmlFor="fullName">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (profileErrors.fullName) {
                          setProfileErrors((prev) => ({ ...prev, fullName: undefined }));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-md text-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container border border-outline-variant shadow-xs"
                      placeholder="e.g. Tahmid Rahman"
                    />
                    {profileErrors.fullName && (
                      <span className="text-[11px] text-error font-medium">
                        {profileErrors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-on-surface" htmlFor="email">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (profileErrors.email) {
                            setProfileErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-md text-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container border border-outline-variant shadow-xs"
                        placeholder="tahmid@example.com"
                      />
                      {profileErrors.email && (
                        <span className="text-[11px] text-error font-medium">
                          {profileErrors.email}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-on-surface" htmlFor="phone">
                        Phone *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (profileErrors.phone) {
                            setProfileErrors((prev) => ({ ...prev, phone: undefined }));
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-md text-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container border border-outline-variant shadow-xs"
                        placeholder="+880 1711-234567"
                      />
                      {profileErrors.phone && (
                        <span className="text-[11px] text-error font-medium">
                          {profileErrors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-on-surface">
                      Language
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-lg max-w-xs border border-outline-variant/60">
                      <button
                        type="button"
                        onClick={() => setLanguage("en")}
                        className={`py-1.5 px-3 rounded-md text-xs text-center transition-all cursor-pointer ${
                          language === "en"
                            ? "bg-surface-container-lowest shadow-xs text-primary font-bold"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage("bn")}
                        className={`py-1.5 px-3 rounded-md text-xs text-center transition-all cursor-pointer ${
                          language === "bn"
                            ? "bg-surface-container-lowest shadow-xs text-primary font-bold"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        বাংলা
                      </button>
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-on-surface">
                      Dietary Preferences
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map((opt) => {
                        const isSelected = dietaryPrefs.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary-container text-on-primary shadow-xs font-semibold"
                                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
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
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30 mt-2">
                    <button
                      className="text-xs text-on-surface-variant hover:text-on-surface cursor-pointer font-medium"
                      type="button"
                      onClick={handleCancelEditing}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-5 py-2.5 bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
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

      <ProfileToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: "success" })}
      />
    </div>
  );
}
