import { RestaurantProfile } from "@/types/profile";

export const INITIAL_RESTAURANT_PROFILE: RestaurantProfile = {
  id: "the-maple-and-vine",
  name: "The Maple & Vine",
  tagline: "Contemporary American Hearth, Michigan Heritage & Craft Cellar",
  cuisineTags: [
    "Contemporary American",
    "Wood-Fired Hearth",
    "Steak & Seafood",
    "Artisanal Cellar",
  ],
  priceTier: "fine-dining",
  licenseReference: "MI-DET-2024-98421",
  hygieneGrade: "Grade A+",
  coverImage:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop",
  coverImageAlt:
    "Warm and refined heritage restaurant interior with polished oak tables, amber chandelier glow, and guests dining in an upscale American bistro room.",
  coverSubtitle: "Evening Dining Room Setting (Main Dining Room)",
  logoImage:
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600&auto=format&fit=crop",
  logoImageAlt:
    "Refined emblem for The Maple & Vine.",
  galleryImages: [
    {
      id: "gal-1",
      url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
      alt: "Prime dry-aged ribeye steak with rosemary butter and charred heirloom carrots.",
      caption: "Prime Dry-Aged Ribeye",
    },
    {
      id: "gal-2",
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
      alt: "Wood-fired hearth dining preparation with farm-fresh organic ingredients.",
      caption: "Wood-Fired Hearth Kitchen",
    },
    {
      id: "gal-3",
      url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
      alt: "Private tasting alcove and curated Michigan wine cellar display.",
      caption: "Private Wine Alcove",
    },
  ],
  operatingHours: [
    {
      day: "Saturday",
      isOpen: true,
      openingTime: "11:30 AM",
      closingTime: "11:30 PM",
      serviceType: "Dinner & Bar Service",
    },
    {
      day: "Sunday",
      isOpen: true,
      openingTime: "11:30 AM",
      closingTime: "10:30 PM",
      serviceType: "Brunch & Dinner",
    },
    {
      day: "Monday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "10:30 PM",
      serviceType: "Dinner Service",
    },
    {
      day: "Tuesday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "10:30 PM",
      serviceType: "Dinner Service",
    },
    {
      day: "Wednesday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "10:30 PM",
      serviceType: "Dinner Service",
    },
    {
      day: "Thursday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "11:30 PM",
      serviceType: "Dinner & Cocktails",
      badge: "Chef Pairing",
    },
    {
      day: "Friday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "12:00 AM",
      serviceType: "Extended Weekend",
      badge: "Live Hearth",
    },
  ],
  streetAddress: "1420 Michigan Avenue",
  neighborhood: "Corktown, Detroit, MI 48216",
  phone: "(313) 555-0142",
  managerEmail: "manager@mapleandvine.com",
  latitude: 42.3318,
  longitude: -83.0682,
  coverageRadiusKm: 12.0,
  holidayTimingEnabled: false,
  holidayScheduleNotice: "Special holiday tasting menus apply on Thanksgiving, Christmas Eve, and New Year's Eve.",
  lastOrderMinutesBeforeClose: 45,
  updatedAt: "Today at 4:15 PM EST",
};

export const NEIGHBORHOOD_OPTIONS = [
  "Corktown, Detroit, MI 48216",
  "Downtown Detroit, MI 48226",
  "Midtown Detroit, MI 48201",
  "Riverfront, Detroit, MI 48207",
  "Eastern Market, Detroit, MI 48207",
  "Woodbridge, Detroit, MI 48208",
  "Indian Village, Detroit, MI 48214",
  "Palmer Woods, Detroit, MI 48221",
];

export const POPULAR_CUISINE_SUGGESTIONS = [
  "Contemporary American",
  "Wood-Fired Hearth",
  "Prime Steakhouse",
  "Artisanal Cellar",
  "Great Lakes Fish",
  "Farm-to-Table",
  "Handcrafted Pasta",
  "Craft Cocktails",
  "Seasonal Tasting",
  "Heritage Poultry",
];
