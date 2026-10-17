import { CustomerReservation } from "@/types/customerReservation";

function getRelativeDate(daysFromNow: number): { iso: string; display: string } {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const iso = d.toISOString().split("T")[0];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const display = `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
  return { iso, display };
}

const datePlus2 = getRelativeDate(2);
const datePlus5 = getRelativeDate(5);
const datePlus10 = getRelativeDate(10);
const dateMinus4 = getRelativeDate(-4);
const dateMinus18 = getRelativeDate(-18);
const dateMinus35 = getRelativeDate(-35);
const dateMinus50 = getRelativeDate(-50);
const dateMinus65 = getRelativeDate(-65);

export const INITIAL_CUSTOMER_RESERVATIONS: CustomerReservation[] = [
  {
    id: "RES-9402",
    restaurantId: "sultans-heritage",
    restaurantName: "Sultan's Heritage Kitchen",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC54dRRGACF2UU7AKnmYe9nrUHH6KZhKTf2vRTWcMSBnIn8lDaicIqo_mULlcypcTr4KPzPKpp54FjhET53v0KORX28p91whJ8cai9oxaZC4lz0MYCb1eqvpQC7ogYYYCZhAFsdAi0opbNqWQCFRShxRk9yb0wPG4XulyJSPu8YbJ_8_QzaexPsDk7lTZaOJbmE_4D6iLiXNUNInFA4o3TYCjONvLWRMK94h7gEGm1zblkm4PaUaEgubA",
    neighborhood: "Banani 11, Dhaka",
    fullAddress: "House 42, Road 11, Block D, Banani, Dhaka-1213",
    cuisine: "Fine Heritage Dining • Mughlai",
    date: datePlus2.iso,
    displayDate: datePlus2.display,
    time: "8:00 PM (Sharp)",
    mealPeriod: "Dinner",
    partySize: 4,
    seatingArea: "Courtyard Seating #C-04",
    tableNumber: "C-04",
    specialNotes: "Quiet corner table for family anniversary",
    status: "confirmed",
    statusDisplay: "Confirmed",
    isFeaturedUpcoming: true,
    upcomingDaysLabel: "Upcoming Seating in 2 Days",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "RES-9388",
    restaurantId: "izumi-courtyard",
    restaurantName: "Izumi Courtyard & Robata Grill",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyyVCRSNT6MhKzuuEpQ3QGMeiukmx8qbdXO4l-wkXQnHi4COl9TsVnZ2ohAN3Min7LEfzRrIiob2y9lFDTfG2a0X_pkDEBdQ7etl_af_sfbYG0aspVaolv1nQbwwe33HxTOG16MIl8sLIEoRiMoTx3zzFTfn8nqCB2OijjRmL28OH1UQenp7KC1VO9XBFAjDkxf7QPxphVET4A-_eyDpH21f2zOz5ln1og_0Chi43fVifEDk1GxUjPzw",
    neighborhood: "Gulshan 2, Dhaka",
    fullAddress: "House 24C, Road 113, Gulshan 2, Dhaka-1212",
    cuisine: "Japanese Contemporary • Omakase",
    date: datePlus5.iso,
    displayDate: datePlus5.display,
    time: "8:30 PM (Dinner)",
    mealPeriod: "Dinner",
    partySize: 2,
    seatingArea: "Omakase Counter",
    tableNumber: "K-02",
    specialNotes: "Chef's seasonal tasting menu selection",
    status: "pending",
    statusDisplay: "Pending Venue",
    isFeaturedUpcoming: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "RES-9520",
    restaurantId: "dacca-tehari-ghar",
    restaurantName: "Dacca Tehari Ghar",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHmdDAyvLeoacifacW8rJicKfpVI81Ncf-D0RTKPNT6Ucw8fsWL1jQgRlYE91KdTQAiw6ZgfbT13w6oeWpBaNxl9lwjAUo6yp6TYzyXtFba4JAzxQb9Fmzgg-akhptWEBZ6ehtJ7HGrQT8cyMW12dW4cSToNbWrNkUY0BPvZg4tEBJA9Ft0jkUVFkyjmB4A7vzmoKUABdywjbwDe4dqdcVuqczOvVDKTGbvX_gfwgObtmEFqLi0ZX6qQ",
    neighborhood: "Old Dhaka & Banani",
    fullAddress: "Plot 89, Road 11, Banani, Dhaka-1213",
    cuisine: "Authentic Heritage Classics",
    date: datePlus10.iso,
    displayDate: datePlus10.display,
    time: "1:30 PM (Lunch)",
    mealPeriod: "Lunch",
    partySize: 5,
    seatingArea: "Main Dining Hall",
    tableNumber: "M-08",
    specialNotes: "Mild spice preferred for elders",
    status: "confirmed",
    statusDisplay: "Confirmed",
    isFeaturedUpcoming: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "RES-9114",
    restaurantId: "the-copper-chimney",
    restaurantName: "The Copper Chimney",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAGBrLH5ajusIu7MHAoby2pk5Jg418M6J-Cu78oi9qx2qQNV5BYEXCeJ0hsH8X2IKSXO0xfl4XYHK79Jsn5QPMfA42-LID3nUIbxgR2AE_KRQQv-npk7IODpra2R_UsvgQMVVSEJF1OYGeuMJozAdr2lEpT0rHR31pllAG-hN7PGVjX6KSzv8WysfPBAs7P8WiqeM59l5lHd95zIiLQBMP_QrKLqwwNqnwX0UdOW6FPem6vSbJ_mQvQ",
    neighborhood: "Banani 11, Dhaka",
    fullAddress: "House 67, Road 11, Block D, Banani, Dhaka-1213",
    cuisine: "Awadhi & North Indian",
    date: dateMinus4.iso,
    displayDate: dateMinus4.display,
    time: "1:30 PM (Lunch)",
    mealPeriod: "Lunch",
    partySize: 3,
    seatingArea: "Main Dining",
    tableNumber: "T-14",
    specialNotes: "No notes provided",
    status: "completed",
    statusDisplay: "Completed",
    rating: 5,
    reviewComment: "Exemplary galouti kebabs and cordial hospitality.",
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
  },
  {
    id: "RES-8950",
    restaurantId: "star-kabab",
    restaurantName: "Star Kabab & Heritage Biryani",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAynW47GxjfwGapFKKcsY7IuW4kqHfCXUe7TiLX200KTAEtDwDlSZIcenq9-NqhRY35p_T8Yb5-OACxT5MBxecujPwMRSdQt_kpCY8JfgaXQ0X08WEk5TlLafJqxmaZc79Dys1jgger7AyfwAFr7bDnJSFpG4DuIoHL2Bh-kgu8PhDo_YTITymqVIjmJAv4sdbubdPl3PhUejLyMmYiOfZjgRkpttoKmrKuAvyRgFUUJu19y4XX9NCZg",
    neighborhood: "Dhanmondi 2, Dhaka",
    fullAddress: "House 15, Road 2, Dhanmondi R/A, Dhaka-1205",
    cuisine: "Traditional Classics & Kacchi",
    date: dateMinus18.iso,
    displayDate: dateMinus18.display,
    time: "8:00 PM (Dinner)",
    mealPeriod: "Dinner",
    partySize: 6,
    seatingArea: "Family Hall",
    tableNumber: "F-02",
    specialNotes: "High chair needed for 18-month-old child",
    status: "completed",
    statusDisplay: "Completed",
    createdAt: new Date(Date.now() - 3600000 * 480).toISOString(),
  },
  {
    id: "RES-8712",
    restaurantId: "le-sourdough",
    restaurantName: "Le Sourdough Bistro",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwDt4vrCgh-YrhXXUh6HcPGsi-owUHObULBorYCTb0KUJBJpr8BBWavI2NF4FVLt9qjd4ZpIea3WRQ8bC33v_-OG6X7YBU8k30xtB8QeDurl38TQ29nj8KOgRwUxRxeKOPeddA2ozHKacsfKP3P8xH16dFrszweVD0GulVAAejkxzy9Tt_6Iyo7aHIVFkqP9cCNhp-trhV9x61Y7yYPTT0OzyMC7HJllpR9jqlvxZo0Z2Bkyvvmuv83g",
    neighborhood: "Banani 10, Dhaka",
    fullAddress: "Plot 34, Road 10, Block C, Banani, Dhaka-1213",
    cuisine: "Artisanal Bakery & French Grill",
    date: dateMinus35.iso,
    displayDate: dateMinus35.display,
    time: "7:30 PM (Dinner)",
    mealPeriod: "Dinner",
    partySize: 2,
    seatingArea: "Patio Garden",
    specialNotes: "Outdoor heating preferred if breezy",
    status: "declined",
    statusDisplay: "Fully Booked",
    createdAt: new Date(Date.now() - 3600000 * 850).toISOString(),
  },
  {
    id: "RES-8540",
    restaurantId: "mori-artisan-sushi",
    restaurantName: "Mori Artisan Sushi & Izakaya",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyyVCRSNT6MhKzuuEpQ3QGMeiukmx8qbdXO4l-wkXQnHi4COl9TsVnZ2ohAN3Min7LEfzRrIiob2y9lFDTfG2a0X_pkDEBdQ7etl_af_sfbYG0aspVaolv1nQbwwe33HxTOG16MIl8sLIEoRiMoTx3zzFTfn8nqCB2OijjRmL28OH1UQenp7KC1VO9XBFAjDkxf7QPxphVET4A-_eyDpH21f2zOz5ln1og_0Chi43fVifEDk1GxUjPzw",
    neighborhood: "Gulshan 1, Dhaka",
    fullAddress: "Avenue 5, Gulshan 1, Dhaka-1212",
    cuisine: "Contemporary Nigiri & Robata",
    date: dateMinus50.iso,
    displayDate: dateMinus50.display,
    time: "8:00 PM (Dinner)",
    mealPeriod: "Dinner",
    partySize: 2,
    seatingArea: "Private Dining Room",
    specialNotes: "Anniversary table with floral arrangement",
    status: "completed",
    statusDisplay: "Completed",
    rating: 5,
    reviewComment: "Spectacular toro and pristine omakase counter service.",
    createdAt: new Date(Date.now() - 3600000 * 1200).toISOString(),
  },
  {
    id: "RES-8321",
    restaurantId: "nandos-dhaka",
    restaurantName: "Nando's Dhaka Heritage",
    restaurantImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBbUX39LmZnKcPElw0YvglkBGE3e7_hAsRyCSoo9KjYOrTtOGoUq9GjM86lOKpcD2OyftLQs0-YJ-wgnDabWEtj-DV2FZmdi_l-LxWNZzhm-_Xh6jdTZ2yxMaCr_wS9HEy5K5SdEpJGc2fx164Dvd1KBTrAsnt8HQZK6iryHXz_xEwhzExRdQf5x-0iiUTEEywx33AnfrzDJNdBkoF9J3u7nPF1TWXp6whuhP5-c5CNjeUuN8gyXlJMrA",
    neighborhood: "Gulshan 2, Dhaka",
    fullAddress: "House 12, Road 45, Gulshan 2, Dhaka-1212",
    cuisine: "Flame-Grilled Peri-Peri Classics",
    date: dateMinus65.iso,
    displayDate: dateMinus65.display,
    time: "7:00 PM (Dinner)",
    mealPeriod: "Dinner",
    partySize: 4,
    seatingArea: "Main Dining",
    specialNotes: "Extra hot peri-peri marinade requested",
    status: "cancelled",
    statusDisplay: "Cancelled",
    createdAt: new Date(Date.now() - 3600000 * 1550).toISOString(),
  },
];
