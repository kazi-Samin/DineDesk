"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import DiscardProfileModal from "@/components/customer/profile/DiscardProfileModal";
import AuthProtocolModal from "@/components/customer/profile/AuthProtocolModal";
import DashboardLoader from "@/components/ui/DashboardLoader";

import {
  CustomerProfileData,
  DietaryPreference,
  PreferredLanguage,
} from "@/types/customerProfile";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";
import { useAvatar } from "@/context/AvatarContext";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";

  const betterAuthToken = localStorage.getItem("dinedesk_auth_token");
  if (betterAuthToken && betterAuthToken.trim() !== "")
    return betterAuthToken.trim();

  const fallbackToken =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("dinedesk_token") ||
    localStorage.getItem("auth_token") ||
    "";
  if (fallbackToken && fallbackToken.trim() !== "") return fallbackToken.trim();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
    if (
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("auth")
    ) {
      const val = localStorage.getItem(key);
      if (val && val.length > 15) return val.trim();
    }
  }

  const match = document.cookie.match(
    /(?:^|;\s*)(?:dinedesk_auth_token|better-auth\.session_token|token|auth_token|accessToken)=([^;]+)/
  );
  return match ? match[1] : "";
};

const getRequestHeaders = (token: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-session-token"] = token;
    headers["better-auth-session-token"] = token;
  }

  return headers;
};

const formatCleanFirstName = (name?: string) => {
  if (!name) return "Diner";
  const cleaned = name.replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s+/i, "").trim();
  return cleaned.split(/\s+/)[0] || "Diner";
};

const EMPTY_PROFILE: CustomerProfileData = {
  fullName: "Diner",
  email: "",
  phone: "",
  avatarUrl: "",
  roleBadge: "Verified Foodie",
  memberSince: "Member since 2026",
  language: "en",
  dietaryPreferences: [],
  isEmailVerified: false,
  isPhoneVerified: false,
  passwordLastChangedDays: 0,
  twoFactorPhone: "",
  stats: {
    totalOrders: 0,
    activeBookings: 0,
    savedSpots: 0,
    loyaltyPoints: 0,
  },
};

const DIETARY_OPTIONS: { id: DietaryPreference; label: string; icon?: string }[] = [
  { id: "halal_only", label: "Halal Only", icon: "check" },
  { id: "nut_allergy", label: "Nut Allergy", icon: "warning" },
  { id: "mild_spice", label: "Mild Spice" },
  { id: "no_shellfish", label: "No Shellfish" },
];

const AVAILABLE_LANGUAGES: {
  code: string;
  label: string;
  nativeName: string;
  flag: string;
}[] = [
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
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle(
    "dinedesk_customer_sidebar"
  );
  const { user, updateUserAvatar, updateAuthUser } = useAuth();
  const { avatarUrl: liveAvatar, setAvatarUrl: setLiveAvatar } = useAvatar();

  const [profile, setProfile] = useState<CustomerProfileData>(EMPTY_PROFILE);
  const [savedSnapshot, setSavedSnapshot] =
    useState<CustomerProfileData>(EMPTY_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [addressCount, setAddressCount] = useState(0);
  const [savedSpotsCount, setSavedSpotsCount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const isEditingRef = useRef(false);
  isEditingRef.current = isEditing;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState<PreferredLanguage>("en");
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>([]);

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

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) =>
        prev.message === message ? { ...prev, message: null } : prev
      );
    }, 3200);
  };

  const isHttp = (v: any) =>
    typeof v === "string" &&
    (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/"));

  const resolveAvatar = useCallback((): string => {
    if (isHttp(liveAvatar)) return liveAvatar.trim();
    if (isHttp(profile.avatarUrl)) return profile.avatarUrl.trim();
    if (isHttp(user?.avatarUrl)) return user!.avatarUrl!.trim();
    if (isHttp((user as any)?.image)) return (user as any).image.trim();
    if (isHttp((user as any)?.avatar)) return (user as any).avatar.trim();
    return "";
  }, [liveAvatar, profile.avatarUrl, user]);

  const loadDatabaseProfile = useCallback(async () => {
    try {
      const token = getAuthToken();
      const headers = getRequestHeaders(token);

      const [profileRes, ordersRes, resApi, addressesRes, favoritesRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/users/profile`, {
            method: "GET",
            headers: {
              ...headers,
              "Cache-Control": "no-cache",
            },
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/orders/my`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/reservations`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/users/addresses`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),

          fetch(`${API_BASE_URL}/api/v1/favorites`, {
            method: "GET",
            headers,
            credentials: "include",
          }).catch(() => null),
        ]);

      // 1. User Profile Data
      let currentFullName = user?.name || "Diner";
      let currentEmail = user?.email || "";
      let currentPhone = user?.phone || "";
      let currentAvatar =
        user?.avatarUrl || (user as any)?.image || (user as any)?.avatar || "";
      let currentLanguage: PreferredLanguage = "en";
      let currentDietary: DietaryPreference[] = [];
      let dbLoyaltyPoints = 0;

      if (profileRes && profileRes.ok) {
        const data = await profileRes.json();
        const userData = data.user || data.data || data;
        if (userData) {
          currentFullName =
            userData.name || userData.fullName || user?.name || "Diner";
          currentEmail = userData.email || user?.email || "";
          currentPhone = userData.phone ?? user?.phone ?? "";
          currentAvatar =
            (userData.avatarUrl && isHttp(userData.avatarUrl)
              ? userData.avatarUrl.trim()
              : null) ||
            (userData.image && isHttp(userData.image)
              ? userData.image.trim()
              : null) ||
            currentAvatar;
          currentLanguage = (userData.language as PreferredLanguage) || "en";
          currentDietary = userData.dietaryPreferences || [];

          if (typeof userData.loyaltyPoints === "number") {
            dbLoyaltyPoints = userData.loyaltyPoints;
          }
        }
      }

      // 2. Orders Metrics
      let rawOrders: any[] = [];
      if (ordersRes && ordersRes.ok) {
        const apiData = await ordersRes.json();
        rawOrders = apiData.data || apiData.orders || [];
      }

      const nonCancelledOrders = rawOrders.filter(
        (o: any) => !String(o.status || "").toLowerCase().includes("cancel")
      );
      const totalOrders = nonCancelledOrders.length;
      const activeOrders = nonCancelledOrders.filter(
        (o: any) =>
          o.status !== "delivered" && o.status !== "completed"
      ).length;

      // 3. Bookings Metrics
      let liveReservations: any[] = [];
      if (resApi && resApi.ok) {
        const apiData = await resApi.json();
        liveReservations =
          apiData.reservations || apiData.data || apiData || [];
      }

      const activeBookings = liveReservations.filter((r: any) => {
        const st = String(r.status || "").toLowerCase();
        return st === "confirmed" || st === "upcoming" || st === "pending";
      }).length;

      // 4. Addresses Count
      let liveAddressesCount = 0;
      if (addressesRes && addressesRes.ok) {
        const addrData = await addressesRes.json();
        const addrList = addrData.data || addrData.addresses || [];
        liveAddressesCount = addrList.length;
      }

      // 5. Saved Spots Count (from /api/v1/favorites)
      let liveFavoritesCount = 0;
      if (favoritesRes && favoritesRes.ok) {
        const favData = await favoritesRes.json();
        const favList = favData.data || favData.menus || favData.favorites || [];
        liveFavoritesCount = favList.length;
      }

      const calculatedLoyalty =
        dbLoyaltyPoints > 0 ? dbLoyaltyPoints : totalOrders * 20;

      const loadedData: CustomerProfileData = {
        ...EMPTY_PROFILE,
        fullName: currentFullName,
        email: currentEmail,
        phone: currentPhone,
        avatarUrl: currentAvatar,
        language: currentLanguage,
        dietaryPreferences: currentDietary,
        stats: {
          totalOrders,
          activeBookings,
          savedSpots: liveFavoritesCount,
          loyaltyPoints: calculatedLoyalty,
        },
      };

      setProfile(loadedData);
      setSavedSnapshot(loadedData);
      setAddressCount(liveAddressesCount);
      setSavedSpotsCount(liveFavoritesCount);
      setTotalOrdersCount(totalOrders);
      setActiveOrdersCount(activeOrders);
      setActiveBookingsCount(activeBookings);
      setLoyaltyPoints(calculatedLoyalty);

      if (!isEditingRef.current) {
        setFullName(currentFullName);
        setEmail(currentEmail);
        setPhone(currentPhone);
        setLanguage(currentLanguage);
        setDietaryPrefs(currentDietary);
        if (currentAvatar) {
          setLiveAvatar(currentAvatar);
        }
      }
    } catch (err) {
      console.error("Failed to load profile from database:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [user, setLiveAvatar]);

  useEffect(() => {
    loadDatabaseProfile();

    const handleExternalSync = () => loadDatabaseProfile();

    window.addEventListener("profile-updated", handleExternalSync);
    window.addEventListener("booking-updated", handleExternalSync);
    window.addEventListener("order-updated", handleExternalSync);
    window.addEventListener("dinedesk-points-updated", handleExternalSync);

    return () => {
      window.removeEventListener("profile-updated", handleExternalSync);
      window.removeEventListener("booking-updated", handleExternalSync);
      window.removeEventListener("order-updated", handleExternalSync);
      window.removeEventListener("dinedesk-points-updated", handleExternalSync);
    };
  }, [loadDatabaseProfile]);

  useEffect(() => {
    const activePhoto =
      (user as any)?.image || (user as any)?.avatar || user?.avatarUrl;
    if (activePhoto && isHttp(activePhoto)) {
      setLiveAvatar(activePhoto.trim());
      setProfile((prev) => ({ ...prev, avatarUrl: activePhoto.trim() }));
    }
    if (user?.name && !isEditingRef.current) {
      setFullName(user.name);
      setProfile((prev) => ({ ...prev, fullName: user.name! }));
    }
    if (user?.email && !isEditingRef.current) {
      setEmail(user.email);
      setProfile((prev) => ({ ...prev, email: user.email! }));
    }
  }, [user, setLiveAvatar]);

  const hasUnsavedProfileChanges = useMemo(() => {
    if (!isLoaded) return false;
    return (
      fullName !== savedSnapshot.fullName ||
      email !== savedSnapshot.email ||
      phone !== savedSnapshot.phone ||
      language !== savedSnapshot.language ||
      profile.avatarUrl !== savedSnapshot.avatarUrl ||
      JSON.stringify(dietaryPrefs.slice().sort()) !==
      JSON.stringify(savedSnapshot.dietaryPreferences.slice().sort())
    );
  }, [
    isLoaded,
    fullName,
    email,
    phone,
    language,
    profile.avatarUrl,
    dietaryPrefs,
    savedSnapshot,
  ]);

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
      showToast("Uploading to Cloudinary...", "info");

      const result = await uploadImageToCloudinary(file, {
        folder: "dinedesk/avatars",
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
        targetMaxMB: 0.5,
      });

      if (result.success && result.url) {
        const newUrl = result.url.trim();

        setLiveAvatar(newUrl);
        setProfile((prev) => ({ ...prev, avatarUrl: newUrl }));
        setSavedSnapshot((prev) => ({ ...prev, avatarUrl: newUrl }));

        if (updateAuthUser) updateAuthUser({ avatarUrl: newUrl });
        if (updateUserAvatar) updateUserAvatar(newUrl);

        const token = getAuthToken();
        const currentEmail = (
          email ||
          profile.email ||
          user?.email ||
          ""
        )
          .trim()
          .toLowerCase();
        const currentName = (
          fullName ||
          profile.fullName ||
          user?.name ||
          "Diner"
        ).trim();

        const payload = {
          fullName: currentName,
          name: currentName,
          email: currentEmail,
          phone: (phone || profile.phone || "").trim() || null,
          language: language || profile.language || "en",
          dietaryPreferences: dietaryPrefs || profile.dietaryPreferences || [],
          avatarUrl: newUrl,
        };

        const res = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
          method: "PUT",
          headers: getRequestHeaders(token),
          body: JSON.stringify(payload),
          credentials: "include",
        });

        if (res.ok) {
          showToast("Profile photo updated and saved!", "success");
          window.dispatchEvent(
            new CustomEvent("profile-updated", {
              detail: { avatarUrl: newUrl },
            })
          );
        } else {
          showToast("Photo uploaded, but database sync failed.", "error");
        }
      } else {
        showToast("Failed to upload image to Cloudinary.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Cloudinary upload error.", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setLiveAvatar("");
    setProfile((prev) => ({ ...prev, avatarUrl: "" }));
    setSavedSnapshot((prev) => ({ ...prev, avatarUrl: "" }));

    if (updateUserAvatar) updateUserAvatar("");
    if (updateAuthUser) updateAuthUser({ avatarUrl: "" });

    const token = getAuthToken();
    const currentEmail = (
      email ||
      profile.email ||
      user?.email ||
      ""
    )
      .trim()
      .toLowerCase();
    const currentName = (
      fullName ||
      profile.fullName ||
      user?.name ||
      "Diner"
    ).trim();

    const payload = {
      fullName: currentName,
      name: currentName,
      email: currentEmail,
      phone: (phone || profile.phone || "").trim() || null,
      language: language || profile.language || "en",
      dietaryPreferences: dietaryPrefs || profile.dietaryPreferences || [],
      resetAvatar: true,
      avatarUrl: null,
    };

    await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      method: "PUT",
      headers: getRequestHeaders(token),
      body: JSON.stringify(payload),
      credentials: "include",
    });

    window.dispatchEvent(
      new CustomEvent("profile-updated", {
        detail: { avatarUrl: "" },
      })
    );

    showToast("Photo reset to default initials.", "info");
  };

  const toggleDietaryPreference = (pref: DietaryPreference) => {
    setDietaryPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const validateProfileForm = (): boolean => {
    const errors: { fullName?: string; email?: string } = {};

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

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    const currentAvatar =
      liveAvatar ||
      profile.avatarUrl ||
      user?.avatarUrl ||
      (user as any)?.image ||
      "";

    const payload: Record<string, any> = {
      fullName: trimmedName,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || null,
      language,
      dietaryPreferences: dietaryPrefs,
    };

    if (currentAvatar && isHttp(currentAvatar)) {
      payload.avatarUrl = currentAvatar.trim();
    }

    try {
      const token = getAuthToken();
      const headers = getRequestHeaders(token);

      const res = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.ok) {
        const responseData = await res.json().catch(() => ({}));
        const returnedUser = responseData.user || responseData.data;

        const backendAvatar =
          (returnedUser?.avatarUrl && isHttp(returnedUser.avatarUrl)
            ? returnedUser.avatarUrl.trim()
            : null) ||
          (returnedUser?.image && isHttp(returnedUser.image)
            ? returnedUser.image.trim()
            : null);

        const resolvedAvatar = backendAvatar || currentAvatar || "";
        const resolvedName =
          returnedUser?.name || returnedUser?.fullName || trimmedName;
        const resolvedEmail = returnedUser?.email || trimmedEmail;

        const freshData: CustomerProfileData = {
          ...profile,
          ...(returnedUser || {}),
          fullName: resolvedName,
          email: resolvedEmail,
          avatarUrl: resolvedAvatar,
          phone: returnedUser?.phone ?? trimmedPhone,
          language: returnedUser?.language || language,
          dietaryPreferences: returnedUser?.dietaryPreferences || dietaryPrefs,
        };

        setProfile(freshData);
        setSavedSnapshot(freshData);

        if (resolvedAvatar && isHttp(resolvedAvatar)) {
          setLiveAvatar(resolvedAvatar);
        }

        setIsEditing(false);

        if (updateAuthUser) {
          updateAuthUser({
            name: resolvedName,
            email: resolvedEmail,
            avatarUrl: resolvedAvatar,
          });
        }
        if (updateUserAvatar && resolvedAvatar) {
          updateUserAvatar(resolvedAvatar);
        }

        window.dispatchEvent(
          new CustomEvent("profile-updated", {
            detail: {
              fullName: resolvedName,
              name: resolvedName,
              email: resolvedEmail,
              avatarUrl: resolvedAvatar,
            },
          })
        );

        showToast(
          responseData.message || "Profile updated successfully!",
          "success"
        );
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errorMsg =
          errJson.errors?.[0]?.message ||
          errJson.message ||
          "Failed to save profile.";
        showToast(errorMsg, "error");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      showToast("Profile update failed due to network error.", "error");
    }
  };

  const handleStartEditing = () => {
    setFullName(profile.fullName || "");
    setEmail(profile.email || "");
    setPhone(profile.phone || "");
    setLanguage(profile.language || "en");
    setDietaryPrefs(profile.dietaryPreferences || []);
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
    setLiveAvatar(savedSnapshot.avatarUrl || "");
    setIsDiscardModalOpen(false);
    setIsEditing(false);
    showToast("Changes discarded.", "info");
  };

  const cleanFirstName = formatCleanFirstName(
    fullName || profile.fullName || user?.name
  );
  const firstLetter = cleanFirstName.charAt(0).toUpperCase() || "D";
  const displayAvatarSrc = resolveAvatar();

  if (!isLoaded) {
    return (
      <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col antialiased">
        <CustomerHeader
          userName={profile.fullName}
          avatarUrl={displayAvatarSrc}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex pt-20 flex-1">
          <CustomerSidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            onToggle={toggleSidebar}
            loyaltyPoints={loyaltyPoints}
            upcomingReservationsCount={activeBookingsCount}
            activeOrdersCount={totalOrdersCount}
            activeOrderCount={activeOrdersCount}
            avatarUrl={displayAvatarSrc}
          />
          <main
            className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
              }`}
          >
            <DashboardLoader />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col font-body-md antialiased selection:bg-[#1b3b2b] selection:text-white relative">
      <CustomerHeader
        userName={profile.fullName || user?.name || "Diner"}
        avatarUrl={displayAvatarSrc}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-20 flex-1">
        <CustomerSidebar
          userName={cleanFirstName}
          memberSince="Member since 2026"
          avatarUrl={displayAvatarSrc}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={activeOrdersCount}
          activeOrdersCount={totalOrdersCount}
          upcomingReservationsCount={activeBookingsCount}
          loyaltyPoints={loyaltyPoints}
        />

        <main
          className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
            }`}
        >
          {/* Quick Stats Banner */}
          <section className="w-full px-6 sm:px-10 py-6 bg-gradient-to-r from-white via-[#f8f9f6] to-white border-b border-[#1b3b2b]/10 shadow-xs">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <h2 className="font-heading font-extrabold text-xl text-[#1b3b2b]">
                  Welcome back, {cleanFirstName}
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
                    <span className="material-symbols-outlined text-base">
                      edit
                    </span>
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
                    <span className="material-symbols-outlined text-2xl">
                      location_on
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1b3b2b]">
                      Delivery Addresses
                    </h3>
                    <p className="text-xs font-medium text-[#1b3b2b]/70 mt-0.5">
                      You have {addressCount} saved{" "}
                      {addressCount === 1 ? "address" : "addresses"}.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/customer/addresses"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#C05621] hover:underline shrink-0"
                >
                  <span>Manage</span>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </Link>
              </div>

              {/* VIEW MODE */}
              {!isEditing ? (
                <div className="flex flex-col gap-6 mb-10">
                  <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-[#1b3b2b]/15 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="w-20 h-20 rounded-full overflow-hidden shadow-md ring-2 ring-[#1b3b2b]/20 shrink-0 bg-[#1b3b2b] text-white flex items-center justify-center font-heading font-black text-2xl relative">
                        {displayAvatarSrc ? (
                          <img
                            key={displayAvatarSrc}
                            src={displayAvatarSrc}
                            alt={profile.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{firstLetter}</span>
                        )}
                      </div>
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
                          Member since 2026 • DineDesk Patron
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="px-4 py-2 rounded-xl bg-[#f8f9f6] hover:bg-[#1b3b2b]/10 text-xs text-[#1b3b2b] transition-all flex items-center gap-1.5 font-bold cursor-pointer border border-[#1b3b2b]/20"
                      >
                        <span className="material-symbols-outlined text-sm">
                          edit
                        </span>
                        Edit
                      </button>
                    </div>

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
                            {AVAILABLE_LANGUAGES.find(
                              (l) => l.code === profile.language
                            )?.flag || "🌐"}
                          </span>
                          <span>
                            {AVAILABLE_LANGUAGES.find(
                              (l) => l.code === profile.language
                            )?.label || "English"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="p-5 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/10 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#1b3b2b]">
                          Dietary Preferences
                        </span>
                        <span className="text-[10px] text-[#1b3b2b]/60 font-bold uppercase">
                          Shared with restaurants
                        </span>
                      </div>

                      {profile.dietaryPreferences &&
                        profile.dietaryPreferences.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.dietaryPreferences.map((pref) => {
                            const option = DIETARY_OPTIONS.find(
                              (o) => o.id === pref
                            );
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
                        onClick={() =>
                          setAuthModalState({ isOpen: true, mode: "password" })
                        }
                      >
                        Change Password
                      </button>
                      <button
                        className="px-5 py-2.5 bg-[#f8f9f6] hover:bg-[#1b3b2b]/10 text-[#1b3b2b] rounded-2xl text-xs font-extrabold border border-[#1b3b2b]/20 transition-all cursor-pointer shadow-xs"
                        type="button"
                        onClick={() =>
                          setAuthModalState({ isOpen: true, mode: "2fa" })
                        }
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
                      Update your account details and dining preferences.
                    </p>
                  </div>

                  {/* Photo Edit */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/10">
                    <div className="relative shrink-0 w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#1b3b2b]/20 bg-[#1b3b2b] text-white flex items-center justify-center font-heading font-black text-xl shadow-md">
                      {displayAvatarSrc ? (
                        <img
                          key={displayAvatarSrc}
                          alt={fullName}
                          className="w-full h-full object-cover"
                          src={displayAvatarSrc}
                        />
                      ) : (
                        <span>{firstLetter}</span>
                      )}
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center z-10">
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
                    <label
                      className="text-xs font-extrabold text-[#1b3b2b]"
                      htmlFor="fullName"
                    >
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
                      <label
                        className="text-xs font-extrabold text-[#1b3b2b]"
                        htmlFor="email"
                      >
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9f6] rounded-2xl text-xs font-bold text-[#1b3b2b] focus:outline-none focus:bg-white focus:border-[#1b3b2b] border border-[#1b3b2b]/20 shadow-inner"
                        placeholder="you@example.com"
                        required
                      />
                      {profileErrors.email && (
                        <span className="text-[11px] text-red-600 font-bold">
                          {profileErrors.email}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-xs font-extrabold text-[#1b3b2b]"
                        htmlFor="phone"
                      >
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
                    <label
                      className="text-xs font-extrabold text-[#1b3b2b]"
                      htmlFor="language"
                    >
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