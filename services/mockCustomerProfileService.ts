import { CustomerProfileData, CustomerAddress } from "@/types/customerProfile";
import {
  INITIAL_CUSTOMER_PROFILE,
  INITIAL_CUSTOMER_ADDRESSES,
} from "@/data/mockCustomerProfile";

const PROFILE_STORAGE_KEY = "dinedesk_customer_profile";
const ADDRESSES_STORAGE_KEY = "dinedesk_customer_addresses";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getCustomerProfile(): CustomerProfileData {
  if (!isClient()) return INITIAL_CUSTOMER_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(INITIAL_CUSTOMER_PROFILE)
      );
      return INITIAL_CUSTOMER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.fullName) {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(INITIAL_CUSTOMER_PROFILE)
      );
      return INITIAL_CUSTOMER_PROFILE;
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
  if (!isClient()) return INITIAL_CUSTOMER_ADDRESSES;
  try {
    const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        ADDRESSES_STORAGE_KEY,
        JSON.stringify(INITIAL_CUSTOMER_ADDRESSES)
      );
      return INITIAL_CUSTOMER_ADDRESSES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(
        ADDRESSES_STORAGE_KEY,
        JSON.stringify(INITIAL_CUSTOMER_ADDRESSES)
      );
      return INITIAL_CUSTOMER_ADDRESSES;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading addresses from localStorage:", err);
    return INITIAL_CUSTOMER_ADDRESSES;
  }
}

export function saveCustomerAddresses(addresses: CustomerAddress[]): void {
  if (isClient()) {
    try {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
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

/**
 * Format and download CSV address ledger
 */
export function exportAddressesToCSV(addresses: CustomerAddress[]): boolean {
  if (!addresses || addresses.length === 0) return false;

  const headers = [
    "Address Identifier",
    "Recipient Name",
    "Contact Number",
    "House / Building",
    "Area / Road",
    "Apartment / Suite",
    "City",
    "Postal Code",
    "Rider Delivery Directives",
    "Default Status",
  ];

  const escapeCSV = (val: string | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const clean = String(val).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = addresses.map((addr) => [
    escapeCSV(addr.label),
    escapeCSV(addr.recipientName),
    escapeCSV(addr.contactNumber),
    escapeCSV(addr.building),
    escapeCSV(addr.road),
    escapeCSV(addr.apartment || "N/A"),
    escapeCSV(addr.city),
    escapeCSV(addr.postalCode),
    escapeCSV(addr.deliveryInstructions || "None"),
    escapeCSV(addr.isDefault ? "Primary Default" : "Secondary"),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `dinedesk_address_ledger_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
}
