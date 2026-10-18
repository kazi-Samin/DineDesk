import { CustomerProfileData, CustomerAddress } from "@/types/customerProfile";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";

const PROFILE_STORAGE_KEY = "dinedesk_customer_profile";
const ADDRESSES_STORAGE_KEY = "dinedesk_customer_addresses";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getAuthUser(): {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatarUrl?: string;
  loyaltyPoints?: number;
  createdAt?: string;
} | null {
  if (!isClient()) return null;
  try {
    const authRaw = localStorage.getItem("dinedesk_auth_user");
    if (!authRaw) return null;
    return JSON.parse(authRaw);
  } catch {
    return null;
  }
}

export function getCustomerProfile(): CustomerProfileData {
  if (!isClient()) return INITIAL_CUSTOMER_PROFILE;
  try {
    const authUser = getAuthUser();
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    let parsed: CustomerProfileData;

    const baseProfile: CustomerProfileData = {
      fullName: authUser?.name || "DineDesk Patron",
      email: authUser?.email || "patron@dinedesk.com",
      phone: authUser?.phone || "",
      language: "en",
      dietaryPreferences: ["halal_only"],
      avatarUrl: authUser?.avatarUrl || "/avatars/tahmid-avatar.svg",
      isEmailVerified: true,
      isPhoneVerified: Boolean(authUser?.phone),
      roleBadge:
        authUser?.role === "ADMIN"
          ? "Super Admin"
          : authUser?.role === "VENDOR"
          ? "Restaurant Partner"
          : "Verified Foodie",
      memberSince: authUser?.createdAt
        ? `Member since ${new Date(authUser.createdAt).getFullYear()}`
        : "Patron since 2026",
      passwordLastChangedDays: 14,
      twoFactorPhone: authUser?.phone || "",
      stats: {
        totalOrders: 0,
        activeBookings: 0,
        savedSpots: 0,
        loyaltyPoints: authUser?.loyaltyPoints ?? 0,
      },
    };

    if (!raw) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(baseProfile));
      return baseProfile;
    }

    parsed = JSON.parse(raw);
    if (!parsed || !parsed.fullName) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(baseProfile));
      return baseProfile;
    }

    // Always keep name, email, phone, role, and loyalty synchronized with the currently authenticated user
    if (authUser && authUser.name) {
      parsed.fullName = authUser.name;
      if (authUser.email) parsed.email = authUser.email;
      if (authUser.phone !== undefined) parsed.phone = authUser.phone;
      if (authUser.role) {
        parsed.roleBadge =
          authUser.role === "ADMIN"
            ? "Super Admin"
            : authUser.role === "VENDOR"
            ? "Restaurant Partner"
            : "Verified Foodie";
      }
      if (authUser.createdAt) {
        parsed.memberSince = `Member since ${new Date(authUser.createdAt).getFullYear()}`;
      }
      if (authUser.loyaltyPoints !== undefined) {
        parsed.stats = {
          ...parsed.stats,
          loyaltyPoints: authUser.loyaltyPoints,
        };
      }
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(parsed));
    }

    // Auto-migrate broken external avatar URL if previously cached in localStorage
    if (
      !parsed.avatarUrl ||
      parsed.avatarUrl.includes("lh3.googleusercontent.com/aida/AEtj") ||
      parsed.avatarUrl.includes("friendly_portrait_headshot")
    ) {
      parsed.avatarUrl = "/avatars/tahmid-avatar.svg";
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error("Error reading customer profile from localStorage:", err);
    return INITIAL_CUSTOMER_PROFILE;
  }
}

export function saveCustomerProfile(
  profile: CustomerProfileData
): CustomerProfileData {
  const updated: CustomerProfileData = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  if (isClient()) {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("dinedesk_profile_updated"));
    } catch (err) {
      console.error("Error saving customer profile to localStorage:", err);
    }
  }
  return updated;
}

export function getCustomerAddresses(): CustomerAddress[] {
  if (!isClient()) return [];
  try {
    const authUser = getAuthUser();
    const key = authUser?.id
      ? `dinedesk_addresses_${authUser.id}`
      : ADDRESSES_STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading addresses from localStorage:", err);
    return [];
  }
}

export function saveCustomerAddresses(addresses: CustomerAddress[]): void {
  if (isClient()) {
    try {
      const authUser = getAuthUser();
      const key = authUser?.id
        ? `dinedesk_addresses_${authUser.id}`
        : ADDRESSES_STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(addresses));
    } catch (err) {
      console.error("Error saving addresses to localStorage:", err);
    }
  }
}

export function setDefaultCustomerAddress(
  addresses: CustomerAddress[],
  addressId: string
): CustomerAddress[] {
  const updated = addresses.map((addr) => ({
    ...addr,
    isDefault: addr.id === addressId,
  }));
  saveCustomerAddresses(updated);
  return updated;
}

export function deleteCustomerAddress(
  addresses: CustomerAddress[],
  addressId: string
): CustomerAddress[] {
  const target = addresses.find((a) => a.id === addressId);
  const remaining = addresses.filter((a) => a.id !== addressId);

  // If the deleted address was default and there are remaining addresses, set the first one as default
  if (target?.isDefault && remaining.length > 0) {
    remaining[0] = { ...remaining[0], isDefault: true };
  }

  saveCustomerAddresses(remaining);
  return remaining;
}

export function upsertCustomerAddress(
  addresses: CustomerAddress[],
  addressData: CustomerAddress
): CustomerAddress[] {
  let updated: CustomerAddress[];
  const exists = addresses.some((a) => a.id === addressData.id);

  if (exists) {
    updated = addresses.map((a) =>
      a.id === addressData.id ? addressData : a
    );
  } else {
    updated = [addressData, ...addresses];
  }

  // If set as default, clear default from others
  if (addressData.isDefault) {
    updated = updated.map((a) => ({
      ...a,
      isDefault: a.id === addressData.id,
    }));
  } else if (!updated.some((a) => a.isDefault) && updated.length > 0) {
    // If no default exists, set the first one
    updated[0] = { ...updated[0], isDefault: true };
  }

  saveCustomerAddresses(updated);
  return updated;
}

export function exportAddressesToCSV(addresses: CustomerAddress[]): void {
  if (!isClient() || addresses.length === 0) return;

  const headers = [
    "ID",
    "Label",
    "Category",
    "Recipient Name",
    "Contact Number",
    "Building",
    "Road",
    "Apartment",
    "City",
    "Postal Code",
    "Is Default",
    "Delivery Instructions",
  ];

  const rows = addresses.map((a) => [
    `"${a.id}"`,
    `"${a.label.replace(/"/g, '""')}"`,
    `"${a.category}"`,
    `"${a.recipientName.replace(/"/g, '""')}"`,
    `"${a.contactNumber}"`,
    `"${a.building.replace(/"/g, '""')}"`,
    `"${a.road.replace(/"/g, '""')}"`,
    `"${(a.apartment || "").replace(/"/g, '""')}"`,
    `"${a.city}"`,
    `"${a.postalCode}"`,
    a.isDefault ? "Yes" : "No",
    `"${(a.deliveryInstructions || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `dinedesk_addresses_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
