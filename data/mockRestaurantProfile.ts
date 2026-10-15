import { RestaurantProfile } from "@/types/profile";

export const INITIAL_RESTAURANT_PROFILE: RestaurantProfile = {
  id: "sultans-heritage",
  name: "Sultan's Heritage Kitchen",
  tagline: "Authentic Mughlai, Old Dhaka Kacchi & Dum Biryanis since 1984",
  cuisineTags: [
    "Old Dhaka Heritage",
    "Mughlai & Biryani",
    "Kebab & Tandoor",
    "Desi Traditional",
  ],
  priceTier: "moderate",
  licenseReference: "BSTI-DHK-2024-98421",
  hygieneGrade: "Grade A+",
  coverImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC2Q7uYYMZdoo2hjkbpiFXfQRoaFzjIrtJOHN8K27noqpLjyJZbhbPa-hXKlYSLSCl5UzQQvWQ-iXz_3xVyCi3b-HkMUorHCxEgiiRueNutqO6KYMBiPB7P0Qi4qErduZFUJfN3NivRern-um0K_4bo3owDlI3xDEFCkgobdA1vBNGz7UINgHOgejZli2wLMMV1-V6Wp-HtcHzldGACmBGCQraM4GkCcIal_AewhjBq6_k26XTu-TPCkw",
  coverImageAlt:
    "Warm and opulent heritage restaurant interior with polished dark teakwood dining tables, brass accents, soft ambient hanging amber lamps, and guests dining peacefully in an upscale Mughal-inspired banquet room.",
  coverSubtitle: "Evening Dining Room Setting (Banani Main Hall)",
  logoImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDfxrYWJRzx3OckptUiR_SWPr8WmwCEcWRr65SaiytUTXRIRCQNMvEZT3pQ6P6C3gnIySaxHqYzzCeJokm0AuijVYOyFgjIG39T-XcNkXuTXv7GWLfXh51L_ZREnAu7I49f2MrvsbsR2TOQUvYoDKP6At2gkZS5emxL79dsYiC96iLq4RdcQxuZSzxJbmxeo-fm4WLBgSKNESbOnFZ0INuLztL-uxj6ZyArGIUa3rua9NuAEPxGathW5w",
  logoImageAlt:
    "Refined golden Mughal monogram icon on deep forest green ceramic tile, minimalist elegant restaurant logo crest with Bengali calligraphy details.",
  galleryImages: [
    {
      id: "gal-1",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhhzmTaqrHVfYx527nZuBMDq061H3h3UzyOyiRgZmAKZkY4Wtx6XD9IydyUzCN888RG1Hs0byiJ4CRojb4fXh0_Pp2sr-CMcljZ-bdRd8Wft2B2gzs1ine8p201nb2DoqqD1srOciFvUEGTAq8s66ZcoB2U0HHqrH6GHIuvApPren5l1qXKlv-vnc6rQIMCaArun9oVtkztj7uh1OeADSSpXL1bARpwjT1eMEXX1TetJivfH5M7wN3Kg",
      alt: "Traditional earthen pot Dum Kacchi Biryani garnished with saffron rice, roasted cashews, fried onions, and braised mutton shank in soft studio dining light.",
      caption: "Dum Kacchi Biryani Pot",
    },
    {
      id: "gal-2",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ghA-hSJsgxjBdUmouecFjFYN-85eR16szqQFfzxZUBW39lmuV7E8pFzEr3hF4hyINAqwa3uG9206jTpUr2u_6W1yHEvj69GPj28wx7ddzFELaJ5LMq7zuFxSALf44D76Sxd2P-D7rStGPTCrTvNVNgTuKsLdx648USIXv5orfVhu4AvDK6F0fzSJHOX8WlrknF0Ae_kN6IzpudKlVolwact3CcBpxu_FG1EywwH_8gFS9iuvoOwTZA",
      alt: "Sizzling grilled reshmi kebabs resting on handcrafted cast iron platter surrounded by fresh coriander and lemon wedges in authentic bistro environment.",
      caption: "Sizzling Reshmi Kebabs",
    },
    {
      id: "gal-3",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaBsA8-gXdQqgRGVSIQYXvzjTp0MTVdCQxDW_ExUCrmD87ON5Gy-8yNfuyzKN0W3xHIKZ7S1ZbWy-AT4NnSpA2dOLbHPX8g6lZBBwhdO0BSHLrSk_XEyIhSYUtk9yfRBEQut-0gQGwpbw4vm0GFn_Ti5B2peSOWv5tva1LyWTMZUVsQqm4vjtO_qok6ggcqfnsg2-mPUqwekTw-Pv8QLyozlxVeOpQpOH-c9HZNAMAZNUZx2-K4qKnvg",
      alt: "Private family dining enclave framed by brass jali lattice screens, candle lanterns, and woven linen napkins on a vintage wood banquet.",
      caption: "Mughal Private Dining Enclave",
    },
  ],
  operatingHours: [
    {
      day: "Saturday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "11:30 PM",
      serviceType: "Dine-in & Takeaway",
    },
    {
      day: "Sunday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "11:30 PM",
      serviceType: "Dine-in & Takeaway",
    },
    {
      day: "Monday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "11:30 PM",
      serviceType: "Dine-in & Takeaway",
    },
    {
      day: "Tuesday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "11:30 PM",
      serviceType: "Dine-in & Takeaway",
    },
    {
      day: "Wednesday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "11:30 PM",
      serviceType: "Dine-in & Takeaway",
    },
    {
      day: "Thursday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "12:30 AM",
      serviceType: "Extended Midnight",
      badge: "Late Night",
    },
    {
      day: "Friday",
      isOpen: true,
      openingTime: "12:00 PM",
      closingTime: "12:30 AM",
      serviceType: "Extended Midnight",
      badge: "Jummah Service",
    },
  ],
  streetAddress: "House 42, Road 11, Block D",
  neighborhood: "Banani, Dhaka 1213",
  phone: "+880 1711-209844",
  managerEmail: "manager@sultansheritage.com",
  latitude: 23.7937,
  longitude: 90.4066,
  coverageRadiusKm: 7.5,
  holidayTimingEnabled: false,
  holidayScheduleNotice: "Special Eid and Ramadan schedules apply during festive seasons.",
  lastOrderMinutesBeforeClose: 30,
  updatedAt: "Today at 4:15 PM",
};

export const NEIGHBORHOOD_OPTIONS = [
  "Banani, Dhaka 1213",
  "Gulshan 1, Dhaka 1212",
  "Gulshan 2, Dhaka 1212",
  "Uttara Sector 3, Dhaka 1230",
  "Dhanmondi, Dhaka 1205",
  "Bashundhara R/A, Dhaka 1229",
  "Mirpur 10, Dhaka 1216",
  "Mohakhali DOHS, Dhaka 1206",
];

export const POPULAR_CUISINE_SUGGESTIONS = [
  "Old Dhaka Heritage",
  "Mughlai & Biryani",
  "Kebab & Tandoor",
  "Desi Traditional",
  "Bengali Fish Curry",
  "Bhorta & Rice",
  "Bakarkhani & Tea",
  "Halim & Nehari",
  "Continental Grill",
  "Seafood Special",
];
