import {
  RestaurantProfile,
  CompletenessAudit,
  CompletenessItem,
} from "@/types/profile";
import { INITIAL_RESTAURANT_PROFILE } from "@/data/mockRestaurantProfile";

const PROFILE_STORAGE_KEY = "dinedesk_vendor_profile";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getRestaurantProfile(): RestaurantProfile {
  if (!isClient()) return INITIAL_RESTAURANT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(INITIAL_RESTAURANT_PROFILE)
      );
      return INITIAL_RESTAURANT_PROFILE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.name) {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(INITIAL_RESTAURANT_PROFILE)
      );
      return INITIAL_RESTAURANT_PROFILE;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading restaurant profile from storage:", err);
    return INITIAL_RESTAURANT_PROFILE;
  }
}

export function saveRestaurantProfile(
  profile: RestaurantProfile
): RestaurantProfile {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const updatedProfile: RestaurantProfile = {
    ...profile,
    updatedAt: `Today at ${timeString}`,
  };

  if (isClient()) {
    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );
    } catch (err) {
      console.error("Error saving restaurant profile to storage:", err);
    }
  }

  return updatedProfile;
}

export function resetRestaurantProfile(): RestaurantProfile {
  if (isClient()) {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(INITIAL_RESTAURANT_PROFILE)
      );
    } catch (e) {
      console.error("Reset profile error:", e);
    }
  }
  return INITIAL_RESTAURANT_PROFILE;
}

export function calculateCompleteness(
  profile: RestaurantProfile
): CompletenessAudit {
  const items: CompletenessItem[] = [
    {
      id: "identity",
      label: "Restaurant identity and moniker defined",
      completed: !!(profile.name?.trim().length >= 3 && profile.tagline?.trim().length >= 8),
    },
    {
      id: "cuisines",
      label: "Primary cuisine tags specified (min 2)",
      completed: Array.isArray(profile.cuisineTags) && profile.cuisineTags.length >= 2,
    },
    {
      id: "license",
      label: "BSTI food safety certification registered",
      completed: !!(profile.licenseReference && profile.licenseReference.trim().length >= 4),
    },
    {
      id: "hours",
      label: "All 7 days operating schedule set",
      completed:
        Array.isArray(profile.operatingHours) &&
        profile.operatingHours.length === 7 &&
        profile.operatingHours.some((day) => day.isOpen),
    },
    {
      id: "banner",
      label: "Hero visual banner uploaded",
      completed: !!(profile.coverImage && profile.coverImage.trim().length > 0),
    },
    {
      id: "logo",
      label: "Marketplace brand avatar uploaded",
      completed: !!(profile.logoImage && profile.logoImage.trim().length > 0),
    },
    {
      id: "contact",
      label: "Contact and physical address registered",
      completed: !!(
        profile.streetAddress?.trim() &&
        profile.phone?.trim() &&
        profile.managerEmail?.trim()
      ),
    },
    {
      id: "gallery",
      label: "Atmosphere gallery curated (at least 4 photos)",
      completed:
        Array.isArray(profile.galleryImages) && profile.galleryImages.length >= 4,
    },
  ];

  const total = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  // Calculate percentage out of 100
  const percentage = Math.round((completedCount / total) * 100);

  return {
    percentage,
    items,
  };
}
