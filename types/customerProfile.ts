export type DietaryPreference =
  | "halal_only"
  | "nut_allergy"
  | "mild_spice"
  | "no_shellfish";

export type PreferredLanguage = string;

export interface CustomerStats {
  totalOrders: number;
  activeBookings: number;
  savedSpots: number;
  loyaltyPoints: number;
}

export interface CustomerProfileData {
  fullName: string;
  email: string;
  phone: string;
  language: PreferredLanguage;
  dietaryPreferences: DietaryPreference[];
  avatarUrl: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  roleBadge: string;
  memberSince: string;
  passwordLastChangedDays: number;
  twoFactorPhone: string;
  stats: CustomerStats;
  updatedAt?: string;
}

export type AddressCategory = "home" | "office" | "family" | "custom";

export interface CustomerAddress {
  id: string;
  label: string;
  category: AddressCategory;
  subtitle: string;
  recipientName: string;
  contactNumber: string;
  building: string;
  road: string;
  apartment?: string;
  city: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}
