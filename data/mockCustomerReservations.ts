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
    restaurantId: "the-maple-and-vine",
    restaurantName: "The Maple & Vine",
    restaurantImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop",
    neighborhood: "Corktown, Detroit",
    fullAddress: "1420 Michigan Avenue, Detroit, MI 48216",
    cuisine: "Contemporary American • Wood-Fired Hearth",
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
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop",
    neighborhood: "Downtown Detroit",
    fullAddress: "100 Woodward Ave, Detroit, MI 48226",
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
    restaurantName: "Midtown Grille",
    restaurantImage:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
    neighborhood: "Midtown, Detroit",
    fullAddress: "450 Cass Ave, Detroit, MI 48201",
    cuisine: "American Smokehouse & Craft Bar",
    date: datePlus10.iso,
    displayDate: datePlus10.display,
    time: "1:30 PM (Lunch)",
    mealPeriod: "Lunch",
    partySize: 5,
    seatingArea: "Main Dining Hall",
    tableNumber: "M-08",
    specialNotes: "Window booth requested",
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
    neighborhood: "Downtown Detroit",
    fullAddress: "200 Michigan Ave, Detroit, MI 48226",
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
    reviewComment: "Exemplary kebabs and cordial hospitality.",
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
  },
  {
    id: "RES-8950",
    restaurantId: "eastern-market-deli",
    restaurantName: "Eastern Market Deli & Grill",
    restaurantImage:
      "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=600&auto=format&fit=crop",
    neighborhood: "Eastern Market, Detroit",
    fullAddress: "2934 Russell St, Detroit, MI 48207",
    cuisine: "Artisanal Deli & Smoked Meats",
    date: dateMinus18.iso,
    displayDate: dateMinus18.display,
    time: "8:00 PM (Dinner)",
    mealPeriod: "Dinner",
    partySize: 6,
    seatingArea: "Family Hall",
    tableNumber: "F-02",
    specialNotes: "High chair needed for toddler",
    status: "completed",
    statusDisplay: "Completed",
    createdAt: new Date(Date.now() - 3600000 * 480).toISOString(),
  },
  {
    id: "RES-8712",
    restaurantId: "le-sourdough",
    restaurantName: "Le Sourdough Bistro",
    restaurantImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
    neighborhood: "Midtown, Detroit",
    fullAddress: "3900 Woodward Ave, Detroit, MI 48201",
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
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop",
    neighborhood: "Downtown Detroit",
    fullAddress: "500 Woodward Ave, Detroit, MI 48226",
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
    restaurantId: "detroit-flame-grille",
    restaurantName: "Detroit Flame Grille",
    restaurantImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
    neighborhood: "Downtown Detroit",
    fullAddress: "1200 Woodward Ave, Detroit, MI 48226",
    cuisine: "Flame-Grilled Rotisserie Classics",
    date: dateMinus65.iso,
    displayDate: dateMinus65.display,
    time: "7:00 PM (Dinner)",
    mealPeriod: "Dinner",
    partySize: 4,
    seatingArea: "Main Dining",
    specialNotes: "Window booth requested",
    status: "cancelled",
    statusDisplay: "Cancelled",
    createdAt: new Date(Date.now() - 3600000 * 1550).toISOString(),
  },
];
