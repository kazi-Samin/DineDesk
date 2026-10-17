"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import AddressFormDrawer from "@/components/customer/profile/AddressFormDrawer";
import DeleteAddressModal from "@/components/customer/profile/DeleteAddressModal";
import DiscardProfileModal from "@/components/customer/profile/DiscardProfileModal";
import AuthProtocolModal from "@/components/customer/profile/AuthProtocolModal";
import ProfileToast from "@/components/customer/profile/ProfileToast";

import {
  CustomerProfileData,
  CustomerAddress,
  DietaryPreference,
  PreferredLanguage,
} from "@/types/customerProfile";
import {
  getCustomerProfile,
  saveCustomerProfile,
  getCustomerAddresses,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
  upsertCustomerAddress,
  exportAddressesToCSV,
} from "@/services/mockCustomerProfileService";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";

const DIETARY_OPTIONS: { id: DietaryPreference; label: string; icon?: string }[] = [
  { id: "halal_only", label: "Halal Only", icon: "check" },
  { id: "nut_allergy", label: "Nut Allergy Alert", icon: "warning" },
  { id: "mild_spice", label: "Mild Spice Preferred" },
  { id: "no_shellfish", label: "No Shellfish" },
];

export default function CustomerProfilePage() {
  // Mobile drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile data & last saved snapshot
  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [savedSnapshot, setSavedSnapshot] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Addresses state
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<CustomerAddress | null>(null);

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

  // Initialize from storage on client mount
  useEffect(() => {
    const loadedProfile = getCustomerProfile();
    const loadedAddresses = getCustomerAddresses();

    setProfile(loadedProfile);
    setSavedSnapshot(loadedProfile);
    setFullName(loadedProfile.fullName);
    setEmail(loadedProfile.email);
    setPhone(loadedProfile.phone);
    setLanguage(loadedProfile.language);
    setDietaryPrefs(loadedProfile.dietaryPreferences);
    setAvatarUrl(loadedProfile.avatarUrl);

    setAddresses(loadedAddresses);
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

  // Handle image upload and validation
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again
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

    setProfileErrors((prev) => ({ ...prev, avatar: undefined }));
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    showToast("Profile image loaded preview.", "info");
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
      errors.fullName = "Please enter your full legal name (minimum 2 characters).";
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

  // Save profile changes
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
    setProfile(saved);
    setSavedSnapshot(saved);
    showToast("Profile changes saved successfully.");
  };

  // Discard changes
  const handleDiscardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasUnsavedProfileChanges) {
      setIsDiscardModalOpen(true);
    } else {
      showToast("No unsaved changes to discard.", "info");
    }
  };

  const confirmDiscardChanges = () => {
    setFullName(savedSnapshot.fullName);
    setEmail(savedSnapshot.email);
    setPhone(savedSnapshot.phone);
    setLanguage(savedSnapshot.language);
    setDietaryPrefs(savedSnapshot.dietaryPreferences);
    setAvatarUrl(savedSnapshot.avatarUrl);
    setProfileErrors({});
    setIsDiscardModalOpen(false);
    showToast("Profile edits reverted to last saved state.", "info");
  };

  // Address Actions
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressDrawerOpen(true);
  };

  const handleEditAddress = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setIsAddressDrawerOpen(true);
  };

  const handleSaveAddress = (address: CustomerAddress) => {
    const updatedList = upsertCustomerAddress(addresses, address);
    setAddresses(updatedList);
    setIsAddressDrawerOpen(false);
    setEditingAddress(null);
    showToast(
      editingAddress
        ? `Delivery coordinate "${address.label}" updated.`
        : `New coordinate "${address.label}" added.`
    );
  };

  const handleMakeDefaultAddress = (addressId: string) => {
    const updated = setDefaultCustomerAddress(addresses, addressId);
    setAddresses(updated);
    const target = updated.find((a) => a.id === addressId);
    showToast(`"${target?.label || "Address"}" is now your primary delivery coordinate.`);
  };

  const handleConfirmDeleteAddress = () => {
    if (!deletingAddress) return;
    const deletedLabel = deletingAddress.label;
    const remaining = deleteCustomerAddress(addresses, deletingAddress.id);
    setAddresses(remaining);
    setDeletingAddress(null);
    showToast(`Coordinate "${deletedLabel}" removed.`);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (addresses.length === 0) {
      showToast("No delivery coordinates available to export.", "info");
      return;
    }
    const success = exportAddressesToCSV(addresses);
    if (success) {
      showToast(`Exported ${addresses.length} delivery coordinates as CSV.`);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Top Fixed Customer Navigation Header */}
      <CustomerHeader
        userName={fullName}
        userRole={profile.roleBadge}
        avatarUrl={avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Fixed Left Customer Navigation Sidebar */}
      <CustomerSidebar
        userName={`${fullName.split(" ")[0]}'s Account`}
        memberSince={profile.memberSince}
        avatarUrl={avatarUrl}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeOrderCount={profile.stats.activeBookings}
        loyaltyPoints={profile.stats.loyaltyPoints}
      />

      {/* Main Content Area (pl-0 on mobile, pl-72 on desktop) */}
      <div className="pl-0 lg:pl-72 transition-all">
        <main className="w-full pt-16 bg-background min-h-screen">
          {/* Section 1: Patron Welcome Banner & Stats */}
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low shadow-[0_1px_4px_rgba(0,0,0,0.02)] border-b border-outline-variant/20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <span className="font-display-mobile md:font-headline-lg text-headline-lg text-on-surface font-medium">
                  Welcome back, {fullName.split(" ")[0]}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {email} • {phone}
                </span>
              </div>

              {/* 4 Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {profile.stats.totalOrders}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Active Bookings
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-semibold">
                    {profile.stats.activeBookings}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Saved Spots
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {profile.stats.savedSpots}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Loyalty Points
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-semibold">
                    {profile.stats.loyaltyPoints.toLocaleString()} pts
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 & 3: Page Title & Main Grid */}
          <div className="w-full px-space-xl py-space-lg max-w-7xl mx-auto">
            <div className="flex flex-col w-full">
              {/* Title Header */}
              <div className="w-full mb-space-xl">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md pb-space-md border-b border-outline-variant/30">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                      Account Settings &amp; Logistics
                    </span>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-0.5 font-medium">
                      Profile &amp; Addresses
                    </h1>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Manage personal dining identity, culinary restrictions, and delivery dispatch routes.
                    </p>
                  </div>
                  <div className="flex items-center gap-space-sm self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-space-md py-1 bg-surface-container rounded-lg font-label-sm text-label-sm text-primary border border-outline-variant/40">
                      <span className="w-2 h-2 rounded-full bg-surface-tint animate-pulse" />
                      Synchronized to Cloud
                    </span>
                  </div>
                </div>
              </div>

              {/* Two-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                {/* Left Column: Personal Details & Auth Protocol */}
                <div className="lg:col-span-6 flex flex-col gap-space-lg">
                  {/* Personal Details Card */}
                  <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-lg">
                    <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                          Personal Details
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Your culinary signature and verification credentials
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-outline text-xl">
                        badge
                      </span>
                    </div>

                    {/* Profile Photo Row */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-space-lg p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30">
                      <div className="relative group shrink-0">
                        <img
                          alt={fullName}
                          className="w-24 h-24 rounded-full object-cover shadow-sm ring-2 ring-primary-container/20"
                          src={avatarUrl}
                        />
                        <button
                          className="absolute bottom-0 right-0 p-1.5 bg-primary text-on-primary rounded-full shadow-md hover:bg-primary-container transition-colors cursor-pointer"
                          title="Change Avatar"
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

                      <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-space-xs">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          {fullName}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Profile picture formats: JPEG, PNG or WebP under 4MB
                        </span>

                        {profileErrors.avatar && (
                          <span className="text-error text-xs font-medium">
                            {profileErrors.avatar}
                          </span>
                        )}

                        <div className="flex items-center gap-space-sm mt-space-xs">
                          <button
                            className="font-label-sm text-label-sm px-space-md py-1 bg-surface-container-lowest text-primary rounded-lg border border-outline-variant/50 hover:bg-surface-container-high transition-colors font-medium shadow-2xs"
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Change Photo
                          </button>
                          <button
                            className="font-label-sm text-label-sm px-space-md py-1 text-error hover:bg-error-container/40 rounded-lg transition-colors font-medium"
                            type="button"
                            onClick={handleRemovePhoto}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Form Controls */}
                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-space-md">
                      {/* Full Legal Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-on-surface flex items-center justify-between">
                          <span>Full Legal Name</span>
                          <span className="font-body-sm text-label-sm text-on-surface-variant">
                            Used for table bookings
                          </span>
                        </label>
                        <input
                          className={`w-full px-space-md py-2.5 bg-surface-container-lowest rounded-lg border font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container shadow-xs ${
                            profileErrors.fullName
                              ? "border-error focus:border-error"
                              : "border-outline-variant/60"
                          }`}
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (profileErrors.fullName)
                              setProfileErrors((prev) => ({ ...prev, fullName: undefined }));
                          }}
                        />
                        {profileErrors.fullName && (
                          <span className="text-error text-xs font-medium mt-0.5">
                            {profileErrors.fullName}
                          </span>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-on-surface flex items-center justify-between">
                          <span>Email Address</span>
                          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-surface-tint font-medium">
                            <span className="material-symbols-outlined text-sm">
                              verified
                            </span>{" "}
                            Verified
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            className={`w-full px-space-md py-2.5 pr-10 bg-surface-container-lowest rounded-lg border font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container shadow-xs ${
                              profileErrors.email
                                ? "border-error focus:border-error"
                                : "border-outline-variant/60"
                            }`}
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (profileErrors.email)
                                setProfileErrors((prev) => ({ ...prev, email: undefined }));
                            }}
                          />
                          <span className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 text-surface-tint text-lg pointer-events-none">
                            check_circle
                          </span>
                        </div>
                        {profileErrors.email && (
                          <span className="text-error text-xs font-medium mt-0.5">
                            {profileErrors.email}
                          </span>
                        )}
                      </div>

                      {/* Phone Contact */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-on-surface flex items-center justify-between">
                          <span>Phone Contact</span>
                          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-surface-tint font-medium">
                            <span className="material-symbols-outlined text-sm">
                              lock_clock
                            </span>{" "}
                            OTP Protected
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            className={`w-full px-space-md py-2.5 pr-10 bg-surface-container-lowest rounded-lg border font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container shadow-xs ${
                              profileErrors.phone
                                ? "border-error focus:border-error"
                                : "border-outline-variant/60"
                            }`}
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (profileErrors.phone)
                                setProfileErrors((prev) => ({ ...prev, phone: undefined }));
                            }}
                          />
                          <span className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                            phone_android
                          </span>
                        </div>
                        {profileErrors.phone && (
                          <span className="text-error text-xs font-medium mt-0.5">
                            {profileErrors.phone}
                          </span>
                        )}
                      </div>

                      {/* Preferred Communication Interface */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-on-surface">
                          Preferred Communication Interface
                        </label>
                        <div className="grid grid-cols-2 gap-space-sm p-1 bg-surface-container rounded-lg border border-outline-variant/30">
                          <button
                            className={`py-2 px-space-md rounded-md font-label-md text-label-md text-center transition-all ${
                              language === "en"
                                ? "bg-surface-container-lowest rounded-md shadow-xs text-primary font-semibold"
                                : "text-on-surface-variant hover:text-on-surface"
                            }`}
                            type="button"
                            onClick={() => setLanguage("en")}
                          >
                            English (US)
                          </button>
                          <button
                            className={`py-2 px-space-md rounded-md font-label-md text-label-md text-center transition-all ${
                              language === "bn"
                                ? "bg-surface-container-lowest rounded-md shadow-xs text-primary font-semibold"
                                : "text-on-surface-variant hover:text-on-surface"
                            }`}
                            type="button"
                            onClick={() => setLanguage("bn")}
                          >
                            বাংলা (Bengali)
                          </button>
                        </div>
                      </div>

                      {/* Dietary Constraints & Notes */}
                      <div className="flex flex-col gap-space-sm pt-space-xs">
                        <div className="flex items-center justify-between">
                          <label className="font-label-md text-label-md text-on-surface">
                            Dietary Constraints &amp; Notes
                          </label>
                          <span className="font-label-sm text-label-sm text-secondary font-medium">
                            Transmitted to kitchens
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {DIETARY_OPTIONS.map((opt) => {
                            const isSelected = dietaryPrefs.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                                  isSelected
                                    ? "bg-primary-container text-on-primary shadow-xs font-medium"
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
                        <div className="p-2 bg-secondary/10 border border-secondary/30 rounded-lg text-xs text-secondary flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            You have unsaved profile changes
                          </span>
                          <span className="font-semibold text-[11px] uppercase tracking-wider">
                            Pending Save
                          </span>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex items-center justify-between pt-space-md border-t border-outline-variant/20 mt-space-xs">
                        <button
                          className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface underline underline-offset-4 cursor-pointer"
                          type="button"
                          onClick={handleDiscardClick}
                        >
                          Discard Changes
                        </button>
                        <button
                          className="px-space-lg py-2.5 bg-primary-container text-on-primary hover:bg-primary font-label-lg text-label-lg rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer font-medium"
                          type="submit"
                        >
                          <span className="material-symbols-outlined text-base">
                            save
                          </span>
                          Save Profile Changes
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Authentication Protocol Card */}
                  <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 flex items-start gap-space-md">
                    <div className="p-2 bg-surface-container-lowest text-secondary rounded-lg shadow-xs shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        security
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-headline-sm text-body-lg text-on-surface font-semibold">
                        Account Authentication Protocol
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
                        Password changed {profile.passwordLastChangedDays} days ago. Multi-factor verification through registered SMS {profile.twoFactorPhone} is currently active.
                      </p>
                      <div className="mt-space-sm flex items-center gap-space-md flex-wrap">
                        <button
                          className="font-label-sm text-label-sm text-primary underline underline-offset-2 hover:text-primary-container font-semibold"
                          type="button"
                          onClick={() => setAuthModalState({ isOpen: true, mode: "password" })}
                        >
                          Update Password
                        </button>
                        <span className="text-outline-variant">•</span>
                        <button
                          className="font-label-sm text-label-sm text-primary underline underline-offset-2 hover:text-primary-container font-semibold"
                          type="button"
                          onClick={() => setAuthModalState({ isOpen: true, mode: "2fa" })}
                        >
                          Manage 2FA Devices
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Saved Delivery Addresses & Export */}
                <div className="lg:col-span-6 flex flex-col gap-space-lg">
                  {/* Saved Delivery Addresses Card */}
                  <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-lg">
                    <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                          Saved Delivery Addresses
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Default dispatch zones for gourmet courier runs
                        </p>
                      </div>
                      <button
                        className="inline-flex items-center gap-1.5 px-space-md py-1.5 bg-surface-container text-primary font-label-md text-label-md rounded-lg border border-primary-container/30 hover:bg-primary-container hover:text-on-primary transition-all font-medium"
                        onClick={handleOpenAddAddress}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-base">
                          add_location_alt
                        </span>
                        + Add New Address
                      </button>
                    </div>

                    {/* Collapsible Address Drawer */}
                    <AddressFormDrawer
                      isOpen={isAddressDrawerOpen}
                      editingAddress={editingAddress}
                      onClose={() => {
                        setIsAddressDrawerOpen(false);
                        setEditingAddress(null);
                      }}
                      onSave={handleSaveAddress}
                    />

                    {/* Address Cards List */}
                    <div className="flex flex-col gap-space-md">
                      {addresses.length === 0 ? (
                        <div className="p-space-xl text-center flex flex-col items-center justify-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-2">
                            wrong_location
                          </span>
                          <h4 className="font-headline-sm text-base text-primary font-medium">
                            No Delivery Addresses Saved
                          </h4>
                          <p className="font-body-sm text-xs text-on-surface-variant mt-1 max-w-sm">
                            Add a home or office coordinate to expedite checkout and enjoy precision courier dispatch.
                          </p>
                          <button
                            type="button"
                            onClick={handleOpenAddAddress}
                            className="mt-space-md px-space-lg py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary transition-all shadow-xs"
                          >
                            + Add Your First Address
                          </button>
                        </div>
                      ) : (
                        addresses.map((address) => {
                          const iconName =
                            address.category === "office"
                              ? "apartment"
                              : address.category === "family"
                              ? "cottage"
                              : address.category === "custom"
                              ? "pin_drop"
                              : "home";

                          return (
                            <div
                              key={address.id}
                              className={`p-space-lg bg-surface-container-lowest rounded-xl flex flex-col gap-space-sm relative transition-all shadow-2xs ${
                                address.isDefault
                                  ? "border-2 border-primary-container/40"
                                  : "border border-outline-variant/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-space-sm">
                                <div className="flex items-center gap-space-sm">
                                  <span
                                    className={`p-1.5 rounded-md ${
                                      address.isDefault
                                        ? "bg-primary-fixed text-primary"
                                        : "bg-surface-container text-on-surface-variant"
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-lg">
                                      {iconName}
                                    </span>
                                  </span>
                                  <div>
                                    <h3 className="font-headline-sm text-body-lg text-primary font-semibold">
                                      {address.label}
                                    </h3>
                                    <span className="font-body-sm text-label-sm text-on-surface-variant">
                                      {address.subtitle || "Verified Delivery Coordinate"}
                                    </span>
                                  </div>
                                </div>

                                {address.isDefault ? (
                                  <span className="px-2.5 py-0.5 bg-primary-container text-on-primary font-label-sm text-label-sm rounded-md tracking-tight font-medium">
                                    Default Address
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-md font-medium">
                                    Secondary Address
                                  </span>
                                )}
                              </div>

                              <div className="pt-space-xs text-on-surface font-body-sm text-body-sm leading-relaxed">
                                {address.building}, {address.road}
                                {address.apartment ? `, ${address.apartment}` : ""}
                                <br />
                                {address.city}-{address.postalCode}, Bangladesh
                              </div>

                              {address.deliveryInstructions && (
                                <div className="p-space-sm bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2">
                                  <span className="material-symbols-outlined text-secondary text-base shrink-0">
                                    {address.category === "office" ? "schedule" : "info"}
                                  </span>
                                  <span>
                                    <strong>Instructions:</strong> {address.deliveryInstructions}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between pt-space-sm border-t border-outline-variant/20 gap-space-sm">
                                <span className="font-label-sm text-label-sm text-on-surface-variant">
                                  Dispatch Contact: {address.contactNumber}
                                </span>
                                <div className="flex items-center gap-space-md">
                                  <button
                                    className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                    type="button"
                                    onClick={() => handleEditAddress(address)}
                                  >
                                    <span className="material-symbols-outlined text-sm">
                                      edit
                                    </span>{" "}
                                    Edit Address
                                  </button>
                                  <span className="text-outline-variant/60">|</span>
                                  {address.isDefault ? (
                                    <button
                                      className="font-label-md text-label-md text-on-surface-variant/40 cursor-not-allowed"
                                      disabled
                                      type="button"
                                    >
                                      Set as Default
                                    </button>
                                  ) : (
                                    <button
                                      className="font-label-md text-label-md text-primary-container font-semibold hover:underline cursor-pointer"
                                      type="button"
                                      onClick={() => handleMakeDefaultAddress(address.id)}
                                    >
                                      Make Default
                                    </button>
                                  )}
                                  <span className="text-outline-variant/60">|</span>
                                  <button
                                    className="font-label-md text-label-md text-error hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                    type="button"
                                    onClick={() => setDeletingAddress(address)}
                                  >
                                    <span className="material-symbols-outlined text-sm">
                                      delete
                                    </span>{" "}
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Export Address Ledger Banner */}
                  <div className="p-space-md bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-primary-container text-xl">
                        map
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface">
                        Looking for past delivery coordinates?
                      </span>
                    </div>
                    <button
                      className="font-label-sm text-label-sm text-primary underline underline-offset-4 hover:text-primary-container font-semibold cursor-pointer"
                      type="button"
                      onClick={handleExportCSV}
                    >
                      Export Address Ledger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Footer */}
          <CustomerFooter />
        </main>
      </div>

      {/* Accessible In-App Confirmation & Protocol Modals */}
      <DeleteAddressModal
        isOpen={Boolean(deletingAddress)}
        address={deletingAddress}
        onClose={() => setDeletingAddress(null)}
        onConfirm={handleConfirmDeleteAddress}
      />

      <DiscardProfileModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={confirmDiscardChanges}
      />

      <AuthProtocolModal
        isOpen={authModalState.isOpen}
        mode={authModalState.mode}
        twoFactorPhone={profile.twoFactorPhone}
        onClose={() => setAuthModalState({ isOpen: false, mode: null })}
        onSuccess={(msg) => showToast(msg, "info")}
      />

      {/* Floating Action Feedback Toast */}
      <ProfileToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: "success" })}
      />
    </div>
  );
}
