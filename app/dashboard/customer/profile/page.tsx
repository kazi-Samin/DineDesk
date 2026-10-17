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

const DIETARY_OPTIONS: { id: DietaryPreference; label: string; icon?: string }[] = [
  { id: "halal_only", label: "Halal Only", icon: "check" },
  { id: "nut_allergy", label: "Nut Allergy Alert", icon: "warning" },
  { id: "mild_spice", label: "Mild Spice Preferred" },
  { id: "no_shellfish", label: "No Shellfish" },
];

export default function CustomerProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile data & last saved snapshot
  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [savedSnapshot, setSavedSnapshot] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [addressCount, setAddressCount] = useState(2);
  const [savedSpotsCount, setSavedSpotsCount] = useState(14);

  // View Mode vs Edit Mode
  const [isEditing, setIsEditing] = useState(false);

  // Form field states
  const [fullName, setFullName] = useState(INITIAL_CUSTOMER_PROFILE.fullName);
  const [email, setEmail] = useState(INITIAL_CUSTOMER_PROFILE.email);
  const [phone, setPhone] = useState(INITIAL_CUSTOMER_PROFILE.phone);
  const [language, setLanguage] = useState<PreferredLanguage>(INITIAL_CUSTOMER_PROFILE.language);
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>(
    INITIAL_CUSTOMER_PROFILE.dietaryPreferences
  );
  const [avatarUrl, setAvatarUrl] = useState(INITIAL_CUSTOMER_PROFILE.avatarUrl);

  // Form validation errors
  const [profileErrors, setProfileErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }>({});

  // Modals & Feedback
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
    }, 3800);
  };

  // Sync state from profile
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

  // Initialize from storage on client mount
  useEffect(() => {
    const loadedProfile = getCustomerProfile();
    const loadedAddresses = getCustomerAddresses();
    const savedRest = getSavedRestaurants();
    const savedDish = getSavedDishes();

    syncFormWithProfile(loadedProfile);
    setAddressCount(loadedAddresses.length);
    setSavedSpotsCount(savedRest.length + savedDish.length || 14);
    setIsLoaded(true);
  }, []);

  // Detect unsaved changes in profile
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

  // Handle image upload with FileReader for persistence
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setProfileErrors((prev) => ({
        ...prev,
        avatar: "Invalid format. Only JPEG, PNG, and WebP are supported.",
      }));
      showToast("Invalid format. Please select a JPEG, PNG, or WebP image.", "error");
      return;
    }

    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      setProfileErrors((prev) => ({
        ...prev,
        avatar: "File size exceeds 4MB limit. Please choose a smaller file.",
      }));
      showToast("Image too large. Maximum file size is 4MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        setProfileErrors((prev) => ({ ...prev, avatar: undefined }));
        showToast("Profile image updated in draft.", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(INITIAL_CUSTOMER_PROFILE.avatarUrl);
    setProfileErrors((prev) => ({ ...prev, avatar: undefined }));
    showToast("Profile photo reset to default.", "info");
  };

  // Toggle dietary chips
  const toggleDietaryPreference = (pref: DietaryPreference) => {
    setDietaryPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  // Validate personal details
  const validateProfileForm = (): boolean => {
    const errors: { fullName?: string; email?: string; phone?: string } = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name (minimum 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    const phoneRegex = /^[+0-9\s-]{8,18}$/;
    if (!phone.trim() || !phoneRegex.test(phone.trim())) {
      errors.phone = "Please enter a valid contact phone number (e.g. +880 1712-345678).";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save profile changes -> persists and exits edit mode!
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateProfileForm()) {
      showToast("Please resolve the inline form errors before saving.", "error");
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
    setIsEditing(false); // Switch back to View mode so the updated info is cleanly displayed!
    showToast("Profile changes saved successfully.");
  };

  // Start editing
  const handleStartEditing = () => {
    syncFormWithProfile(profile);
    setIsEditing(true);
  };

  // Discard changes
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
    showToast("Profile edits reverted.", "info");
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      {/* Customer Header */}
      <CustomerHeader
        userName={profile.fullName || "Tahmid Rahman"}
        userRole="Verified Foodie"
        avatarUrl={profile.avatarUrl}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-16 flex-1">
        {/* Customer Sidebar */}
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince="Patron since 2023"
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeOrderCount={1}
          loyaltyPoints={1450}
        />

        {/* Main Content Area */}
        <main className="pl-0 lg:pl-72 flex-1 flex flex-col min-h-screen w-full">
          {/* Customer Welcome & Patron Stats */}
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low shadow-[0_1px_4px_rgba(0,0,0,0.02)] border-b border-outline-variant/30">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <span className="font-display-mobile md:font-headline-lg text-headline-lg text-on-surface font-medium">
                  Welcome back, {profile.fullName.split(" ")[0] || "Tahmid"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {profile.email} • {profile.phone}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    28
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Active Bookings
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                    1
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Saved Spots
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block font-medium">
                    Loyalty Points
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-bold">
                    1,450 pts
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Core Container - Clean, Focused, Uncluttered */}
          <div className="w-full px-space-xl py-space-lg max-w-4xl mx-auto flex-1">
            <div className="flex flex-col w-full">
              {/* Header: Title & Action CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md mb-space-lg pb-space-md border-b border-outline-variant/30">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">
                      Account Settings
                    </span>
                    <span className="text-on-surface-variant/40">•</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Dining Identity
                    </span>
                  </div>
                  <h1 className="font-display text-display text-primary tracking-tight font-medium">
                    Personal Profile
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Your personal tasting credentials, kitchen notes, and account security.
                  </p>
                </div>

                <div className="flex items-center gap-space-sm shrink-0 self-start sm:self-auto">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={handleStartEditing}
                      className="inline-flex items-center gap-1.5 px-space-lg py-2 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-sm transition-all font-semibold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      className="inline-flex items-center gap-1.5 px-space-md py-2 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl font-label-md text-label-md transition-colors font-medium cursor-pointer"
                    >
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Navigation to Delivery Addresses */}
              <div className="bg-surface-container-low rounded-xl p-space-md mb-space-lg flex items-center justify-between gap-space-md border border-outline-variant/20 shadow-xs">
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 border border-outline-variant/30 shadow-xs">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-body-lg text-primary font-semibold">
                      Saved Delivery Addresses
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      You have <strong>{addressCount} saved delivery dispatch zones</strong> across Dhaka.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/customer/addresses"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary transition-colors shrink-0"
                >
                  <span>Manage Addresses</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>

              {/* VIEW MODE: Clean, Elegant, Attractive Profile Display */}
              {!isEditing ? (
                <div className="flex flex-col gap-space-lg mb-space-xl">
                  {/* Primary Profile Card */}
                  <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-lg">
                    {/* Hero Identity Banner */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-space-lg p-space-lg bg-surface-container-low/60 rounded-xl border border-outline-variant/30">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="w-24 h-24 rounded-full object-cover shadow-sm ring-2 ring-primary-container/20 shrink-0"
                      />
                      <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                          <h2 className="font-headline-md text-headline-md text-primary font-semibold">
                            {profile.fullName}
                          </h2>
                          <span className="bg-primary-fixed text-on-primary-fixed px-2.5 py-0.5 rounded-lg font-label-sm text-label-sm font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            Verified Foodie
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Patron since 2023 • Dhaka, Bangladesh
                        </p>
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-surface-container-lowest rounded-md text-xs font-medium text-on-surface border border-outline-variant/30">
                            Preferred: {profile.language === "bn" ? "বাংলা (Bengali)" : "English (US)"}
                          </span>
                          <span className="px-2.5 py-1 bg-surface-container-lowest rounded-md text-xs font-medium text-secondary border border-outline-variant/30">
                            Tier: Gold Epicurean
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-md text-label-md border border-outline-variant/30 shadow-xs transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                      </button>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg pt-space-xs">
                      <div className="p-space-md bg-surface-container-low/40 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                          Email Address
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-body-md text-body-md text-on-surface font-medium">
                            {profile.email}
                          </span>
                          <span className="material-symbols-outlined text-sm text-primary" title="Verified">
                            check_circle
                          </span>
                        </div>
                      </div>

                      <div className="p-space-md bg-surface-container-low/40 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                          Contact Phone
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-body-md text-body-md text-on-surface font-medium">
                            {profile.phone}
                          </span>
                          <span className="material-symbols-outlined text-sm text-primary" title="SMS Linked">
                            phone_iphone
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dietary Constraints Section */}
                    <div className="p-space-md bg-surface-container-low/40 rounded-xl border border-outline-variant/20 flex flex-col gap-space-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-lg">
                            restaurant_menu
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            Dietary Preferences &amp; Kitchen Notes
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-secondary font-medium">
                          Transmitted to chefs
                        </span>
                      </div>

                      {profile.dietaryPreferences && profile.dietaryPreferences.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.dietaryPreferences.map((pref) => {
                            const option = DIETARY_OPTIONS.find((o) => o.id === pref);
                            return (
                              <span
                                key={pref}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container text-on-primary rounded-md font-label-md text-xs font-semibold shadow-xs"
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {option?.icon || "check"}
                                </span>
                                {option?.label || pref}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                          No specific dietary restrictions selected.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security & Authentication Protocol Card */}
                  <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-secondary text-xl">
                          security
                        </span>
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                            Security &amp; Authentication Protocol
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Protect your account credentials, login methods, and multi-factor verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Password changed {profile.passwordLastChangedDays} days ago. Multi-factor verification through registered SMS {profile.twoFactorPhone} is currently active.
                    </p>

                    <div className="flex items-center gap-space-md flex-wrap pt-space-xs">
                      <button
                        className="px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                        type="button"
                        onClick={() => setAuthModalState({ isOpen: true, mode: "password" })}
                      >
                        Update Password
                      </button>
                      <button
                        className="px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                        type="button"
                        onClick={() => setAuthModalState({ isOpen: true, mode: "2fa" })}
                      >
                        Manage 2FA Devices
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE: Form to Edit and Save Profile */
                <form
                  onSubmit={handleSaveProfile}
                  className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-lg mb-space-xl animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                        Edit Dining Profile
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Update your public diner information, preferred language, and dietary alerts.
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-xl">
                      edit_square
                    </span>
                  </div>

                  {/* Photo Edit */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-space-lg p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <div className="relative group shrink-0">
                      <img
                        alt={fullName}
                        className="w-24 h-24 rounded-full object-cover shadow-sm ring-2 ring-primary-container/20"
                        src={avatarUrl}
                      />
                      <button
                        className="absolute bottom-0 right-0 p-1.5 bg-primary text-on-primary rounded-full shadow-md hover:bg-primary-container transition-colors cursor-pointer"
                        title="Upload New Avatar"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <span className="material-symbols-outlined text-sm">
                          photo_camera
                        </span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    </div>

                    <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        Profile Avatar
                      </span>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        Accepts JPG, PNG, or WebP up to 4MB. Changes persist to your account.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs bg-surface-container hover:bg-surface-container-high rounded-md text-primary font-medium cursor-pointer"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-2.5 py-1 text-xs text-secondary hover:bg-error-container hover:text-on-error-container rounded-md font-medium cursor-pointer"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="fullName">
                      Full Legal Name <span className="text-error">*</span>
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
                      className={`w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors border ${
                        profileErrors.fullName ? "border-error ring-1 ring-error" : "border-outline-variant/30"
                      }`}
                      placeholder="e.g. Tahmid Rahman"
                    />
                    {profileErrors.fullName && (
                      <span className="font-label-sm text-xs text-error font-medium">
                        {profileErrors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="email">
                        Email Address <span className="text-error">*</span>
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
                        className={`w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors border ${
                          profileErrors.email ? "border-error ring-1 ring-error" : "border-outline-variant/30"
                        }`}
                        placeholder="e.g. tahmid.rahman@example.com"
                      />
                      {profileErrors.email && (
                        <span className="font-label-sm text-xs text-error font-medium">
                          {profileErrors.email}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="phone">
                        Contact Phone <span className="text-error">*</span>
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
                        className={`w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-colors border ${
                          profileErrors.phone ? "border-error ring-1 ring-error" : "border-outline-variant/30"
                        }`}
                        placeholder="e.g. +880 1711-234567"
                      />
                      {profileErrors.phone && (
                        <span className="font-label-sm text-xs text-error font-medium">
                          {profileErrors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Language Segmented Pill */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-label-md text-on-surface font-semibold">
                      Preferred Language Interface
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-lg max-w-sm">
                      <button
                        type="button"
                        onClick={() => setLanguage("en")}
                        className={`py-2 px-space-md rounded-md font-label-md text-label-md text-center transition-all cursor-pointer ${
                          language === "en"
                            ? "bg-surface-container-lowest shadow-xs text-primary font-bold"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        English (US)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage("bn")}
                        className={`py-2 px-space-md rounded-md font-label-md text-label-md text-center transition-all cursor-pointer ${
                          language === "bn"
                            ? "bg-surface-container-lowest shadow-xs text-primary font-bold"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        বাংলা (Bengali)
                      </button>
                    </div>
                  </div>

                  {/* Dietary Constraints */}
                  <div className="flex flex-col gap-2 pt-space-xs">
                    <div className="flex items-center justify-between">
                      <label className="font-label-md text-label-md text-on-surface font-semibold">
                        Dietary Constraints &amp; Kitchen Notes
                      </label>
                      <span className="font-label-sm text-label-sm text-secondary font-medium">
                        Transmitted to chefs
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map((opt) => {
                        const isSelected = dietaryPrefs.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary-container text-on-primary shadow-xs font-semibold"
                                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/40"
                            }`}
                            type="button"
                            onClick={() => toggleDietaryPreference(opt.id)}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-sm">
                                {opt.icon || "check"}
                              </span>
                            )}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Unsaved indicator banner if modified */}
                  {hasUnsavedProfileChanges && (
                    <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-xl text-xs text-secondary flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-base">edit_note</span>
                        You have unsaved profile changes
                      </span>
                      <span className="font-bold text-[11px] uppercase tracking-wider">
                        Pending Save
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-space-md border-t border-outline-variant/20 mt-space-xs">
                    <button
                      className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface underline underline-offset-4 cursor-pointer font-medium"
                      type="button"
                      onClick={handleCancelEditing}
                    >
                      Discard &amp; Cancel
                    </button>
                    <button
                      className="px-space-xl py-2.5 bg-primary-container text-on-primary hover:bg-primary font-label-lg text-label-lg rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer font-semibold"
                      type="submit"
                    >
                      <span className="material-symbols-outlined text-base">save</span>
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Customer Footer */}
          <CustomerFooter />
        </main>
      </div>

      {/* Discard Confirmation Modal */}
      <DiscardProfileModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={confirmDiscardChanges}
      />

      {/* Auth Protocol Modal */}
      <AuthProtocolModal
        isOpen={authModalState.isOpen}
        mode={authModalState.mode}
        twoFactorPhone={profile.twoFactorPhone || "+880 1711-234567"}
        onClose={() => setAuthModalState({ isOpen: false, mode: null })}
        onSuccess={(msg) => showToast(msg, "success")}
      />

      {/* Profile Toast */}
      <ProfileToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: "success" })}
      />
    </div>
  );
}
