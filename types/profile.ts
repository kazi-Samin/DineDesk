export type PriceTier = "economy" | "moderate" | "fine-dining";

export interface OperatingDay {
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  serviceType: string;
  badge?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface RestaurantProfile {
  id: string;
  name: string;
  tagline: string;
  cuisineTags: string[];
  priceTier: PriceTier;
  licenseReference: string;
  hygieneGrade: string;
  coverImage: string;
  coverImageAlt: string;
  coverSubtitle: string;
  logoImage: string;
  logoImageAlt: string;
  galleryImages: GalleryPhoto[];
  operatingHours: OperatingDay[];
  streetAddress: string;
  neighborhood: string;
  phone: string;
  managerEmail: string;
  latitude: number;
  longitude: number;
  coverageRadiusKm: number;
  holidayTimingEnabled: boolean;
  holidayScheduleNotice?: string;
  lastOrderMinutesBeforeClose: number;
  updatedAt: string;
}

export interface CompletenessItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface CompletenessAudit {
  percentage: number;
  items: CompletenessItem[];
}
