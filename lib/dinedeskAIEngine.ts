// lib/dinedeskAIEngine.ts
// DineDesk AI Knowledge & Search Engine based on real platform catalog

export interface AIRestaurant {
  id: string;
  name: string;
  cuisine: string;
  cuisineCategory: string;
  priceTier: "$" | "$$" | "$$$" | "$$$$";
  priceRangeStr: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: string;
  image: string;
  imageAlt: string;
  badge?: string;
  neighborhood: string;
  isOpen: boolean;
  isHalal: boolean;
  isVegetarianFriendly: boolean;
  isKidFriendly: boolean;
  isDineIn: boolean;
  isDelivery: boolean;
  description: string;
  atmosphere: string[];
}

export interface AIDish {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  category: string;
  price: number;
  priceFormatted: string;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  neighborhood: string;
  tags: string[];
  isHalal: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  prepTime: string;
}

export const REAL_RESTAURANTS: AIRestaurant[] = [
  {
    id: "the-maple-and-vine",
    name: "The Maple & Vine",
    cuisine: "Contemporary American, Wood-Fired Hearth & Dry-Aged Steaks",
    cuisineCategory: "american",
    priceTier: "$$$",
    priceRangeStr: "$25 - $45",
    rating: 4.95,
    reviewCount: 420,
    deliveryTime: "30-40 min",
    deliveryFee: "$3.50",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "The Maple and Vine dining room with amber warm lighting",
    badge: "Chef Recommended",
    neighborhood: "Gulshan 1 & 2",
    isOpen: true,
    isHalal: true,
    isVegetarianFriendly: true,
    isKidFriendly: true,
    isDineIn: true,
    isDelivery: true,
    description: "Upscale hearth dining offering dry-aged steaks, wood-fired cuts, and refined romantic ambiance.",
    atmosphere: ["Romantic", "Business Meeting", "Fine Dining", "Outdoor Seating"],
  },
  {
    id: "the-copper-chimney",
    name: "The Copper Chimney",
    cuisine: "North Indian, Charred Galouti & Reshmi Kebabs",
    cuisineCategory: "desi",
    priceTier: "$$",
    priceRangeStr: "$15 - $30",
    rating: 4.8,
    reviewCount: 310,
    deliveryTime: "45 min",
    deliveryFee: "Free over $35",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Clay tandoor and copper chimney grill setup",
    badge: "Tandoor Master",
    neighborhood: "Banani Avenue",
    isOpen: true,
    isHalal: true,
    isVegetarianFriendly: true,
    isKidFriendly: true,
    isDineIn: true,
    isDelivery: true,
    description: "Authentic North Indian clay tandoor specialties, melt-in-mouth kebabs, and velvety curries.",
    atmosphere: ["Family-Friendly", "Group Dining", "Casual", "Outdoor Seating"],
  },
  {
    id: "sultans-heritage",
    name: "Sultan’s Heritage",
    cuisine: "Royal Mughlai, Shahi Kacchi Biryani & Dum Gosht",
    cuisineCategory: "desi",
    priceTier: "$$",
    priceRangeStr: "$12 - $26",
    rating: 4.9,
    reviewCount: 840,
    deliveryTime: "30-40 min",
    deliveryFee: "$2.50",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Steaming aromatic saffron basmati mutton kacchi biryani",
    badge: "Top Rated Biryani",
    neighborhood: "Dhanmondi Satmasjid Rd",
    isOpen: true,
    isHalal: true,
    isVegetarianFriendly: true,
    isKidFriendly: true,
    isDineIn: true,
    isDelivery: true,
    description: "Centuries-old heritage recipes cooked over wood charcoal, serving Dhaka's most celebrated mutton kacchi.",
    atmosphere: ["Family-Friendly", "Celebration", "Casual"],
  },
  {
    id: "izumi-courtyard",
    name: "Izumi Courtyard",
    cuisine: "Japanese Contemporary, Fresh Nigiri & Robata Izakaya",
    cuisineCategory: "japanese",
    priceTier: "$$$",
    priceRangeStr: "$25 - $50",
    rating: 4.9,
    reviewCount: 290,
    deliveryTime: "35 min",
    deliveryFee: "$4.00",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Artisanal sushi rolls on dark slate",
    badge: "Michelin Style",
    neighborhood: "Gulshan 1 & 2",
    isOpen: true,
    isHalal: true,
    isVegetarianFriendly: true,
    isKidFriendly: false,
    isDineIn: true,
    isDelivery: true,
    description: "Quiet Zen courtyard with exquisite Atlantic salmon sashimi, wagyu skewers, and serene garden seating.",
    atmosphere: ["Romantic", "Outdoor Seating", "Business Meeting", "Quiet"],
  },
  {
    id: "madchef-gulshan",
    name: "Madchef Gulshan",
    cuisine: "Artisan Smashed Patties, Truffle Fries & Gourmet Burgers",
    cuisineCategory: "burger",
    priceTier: "$$",
    priceRangeStr: "$10 - $22",
    rating: 4.75,
    reviewCount: 650,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.00",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Double beef smashed burger with crispy edges",
    badge: "Trending Craving",
    neighborhood: "Banani Avenue",
    isOpen: true,
    isHalal: true,
    isVegetarianFriendly: false,
    isKidFriendly: true,
    isDineIn: true,
    isDelivery: true,
    description: "Double smashed premium beef patties with crispy lacy crust, secret house sauces, and brioche buns.",
    atmosphere: ["Casual", "Friends Gathering", "Late Night"],
  },
  {
    id: "osteria-bella",
    name: "Osteria Bella",
    cuisine: "Authentic Neapolitan Woodfired Pizza & Fresh Handmade Pasta",
    cuisineCategory: "italian",
    priceTier: "$$",
    priceRangeStr: "$16 - $32",
    rating: 4.85,
    reviewCount: 380,
    deliveryTime: "30-45 min",
    deliveryFee: "$3.00",
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Freshly baked Neapolitan pizza with blistered crust",
    badge: "Italian Woodfire",
    neighborhood: "Uttara Sectors",
    isOpen: true,
    isHalal: true,
    isVegetarianFriendly: true,
    isKidFriendly: true,
    isDineIn: true,
    isDelivery: true,
    description: "San Marzano tomatoes, fresh buffalo mozzarella, and slow-fermented crusts fired at 900 degrees.",
    atmosphere: ["Romantic", "Family-Friendly", "Outdoor Seating"],
  },
  {
    id: "hanoi-saigon",
    name: "Hanoi Saigon",
    cuisine: "Vietnamese Pho, Crispy Spring Rolls & Southeast Asian Bowls",
    cuisineCategory: "asian",
    priceTier: "$$",
    priceRangeStr: "$13 - $24",
    rating: 4.7,
    reviewCount: 220,
    deliveryTime: "30 min",
    deliveryFee: "$2.50",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Steaming aromatic bowl of Vietnamese beef pho",
    badge: "Herbal Broths",
    neighborhood: "Bashundhara R/A",
    isOpen: true,
    isHalal: true,
    isVegetarianFriendly: true,
    isKidFriendly: true,
    isDineIn: true,
    isDelivery: true,
    description: "Simmered 18-hour bone broths infused with star anise, fresh basil, lime, and hand-cut rice noodles.",
    atmosphere: ["Casual", "Cozy", "Healthy"],
  },
  {
    id: "kacchi-bhai",
    name: "Kacchi Bhai",
    cuisine: "Heritage Dhaka Kacchi Biryani & Zafrani Borhani",
    cuisineCategory: "desi",
    priceTier: "$",
    priceRangeStr: "$10 - $18",
    rating: 4.8,
    reviewCount: 1100,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.00",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Generous platter of golden chicken dum biryani",
    badge: "Best Value",
    neighborhood: "Gulshan 1 & 2",
    isOpen: true,
    isHalal: true,
    isVegetarianFriendly: false,
    isKidFriendly: true,
    isDineIn: true,
    isDelivery: true,
    description: "Famous for hearty servings of tender baby khasi mutton biryani with spiced potato and boiled egg.",
    atmosphere: ["Casual", "Group Dining", "Fast Service"],
  },
];

export const REAL_DISHES: AIDish[] = [
  {
    id: "dish-1",
    restaurantId: "sultans-heritage",
    restaurantName: "Sultan’s Heritage",
    name: "Royal Shahi Kacchi Mutton Biryani Platter",
    category: "desi",
    price: 16.50,
    priceFormatted: "$16.50",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop",
    description: "Tender baby khasi mutton slow-cooked with pure ghee basmati, saffron, cardamom, and roasted potato.",
    rating: 4.95,
    reviewCount: 340,
    neighborhood: "Dhanmondi Satmasjid Rd",
    tags: ["Mutton", "Biryani", "Chef Signature", "Halal"],
    isHalal: true,
    isVegetarian: false,
    isSpicy: false,
    prepTime: "20 mins",
  },
  {
    id: "dish-2",
    restaurantId: "kacchi-bhai",
    restaurantName: "Kacchi Bhai",
    name: "Hyderabadi Special Chicken Dum Biryani",
    category: "desi",
    price: 14.50,
    priceFormatted: "$14.50",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop",
    description: "Marinated chicken pieces layered with long-grain basmati, brown onions, fresh mint, and dum spices.",
    rating: 4.85,
    reviewCount: 290,
    neighborhood: "Gulshan 1 & 2",
    tags: ["Chicken", "Biryani", "Affordable", "Halal"],
    isHalal: true,
    isVegetarian: false,
    isSpicy: true,
    prepTime: "15 mins",
  },
  {
    id: "dish-3",
    restaurantId: "osteria-bella",
    restaurantName: "Osteria Bella",
    name: "Authentic Neapolitan Woodfired Margherita Pizza",
    category: "italian",
    price: 18.50,
    priceFormatted: "$18.50",
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=800&auto=format&fit=crop",
    description: "Crushed San Marzano plum tomatoes, fresh Fior di Latte mozzarella, fragrant basil, and cold-pressed extra virgin olive oil.",
    rating: 4.9,
    reviewCount: 180,
    neighborhood: "Uttara Sectors",
    tags: ["Pizza", "Vegetarian", "Woodfired", "Italian"],
    isHalal: true,
    isVegetarian: true,
    isSpicy: false,
    prepTime: "15 mins",
  },
  {
    id: "dish-4",
    restaurantId: "the-maple-and-vine",
    restaurantName: "The Maple & Vine",
    name: "Pan-Seared Atlantic Salmon with Lemon Herb Butter",
    category: "european",
    price: 29.99,
    priceFormatted: "$29.99",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop",
    description: "Crispy skin Atlantic salmon fillet served over roasted asparagus, creamy garlic mash, and caper dill emulsion.",
    rating: 4.9,
    reviewCount: 140,
    neighborhood: "Gulshan 1 & 2",
    tags: ["Seafood", "Salmon", "Healthy", "Romantic"],
    isHalal: true,
    isVegetarian: false,
    isSpicy: false,
    prepTime: "22 mins",
  },
  {
    id: "dish-5",
    restaurantId: "madchef-gulshan",
    restaurantName: "Madchef Gulshan",
    name: "Double Smash Burger with Cheddar & Bacon",
    category: "burger",
    price: 15.99,
    priceFormatted: "$15.99",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    description: "Two 3.5oz lacy-edged smashed beef patties, melted sharp Wisconsin cheddar, pickles, and signature chipotle spread.",
    rating: 4.8,
    reviewCount: 510,
    neighborhood: "Banani Avenue",
    tags: ["Burger", "Beef", "Trending", "Halal"],
    isHalal: true,
    isVegetarian: false,
    isSpicy: true,
    prepTime: "12 mins",
  },
  {
    id: "dish-6",
    restaurantId: "the-maple-and-vine",
    restaurantName: "The Maple & Vine",
    name: "Truffle Infused Wild Mushroom Risotto",
    category: "european",
    price: 24.99,
    priceFormatted: "$24.99",
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?q=80&w=800&auto=format&fit=crop",
    description: "Carnaroli Italian rice folded with porcini broth, shaved black summer truffles, mascarpone, and 24-month aged Parmigiano Reggiano.",
    rating: 4.92,
    reviewCount: 165,
    neighborhood: "Gulshan 1 & 2",
    tags: ["Vegetarian", "Truffle", "Risotto", "Romantic"],
    isHalal: true,
    isVegetarian: true,
    isSpicy: false,
    prepTime: "25 mins",
  },
  {
    id: "dish-7",
    restaurantId: "izumi-courtyard",
    restaurantName: "Izumi Courtyard",
    name: "Dragon Eye Crispy Ebi Tempura Sushi Roll",
    category: "japanese",
    price: 22.00,
    priceFormatted: "$22.00",
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=800&auto=format&fit=crop",
    description: "Tiger prawn tempura, sliced ripe avocado, tobiko roe, toasted sesame, and sweet unagi drizzle (8 pcs).",
    rating: 4.88,
    reviewCount: 195,
    neighborhood: "Gulshan 1 & 2",
    tags: ["Sushi", "Seafood", "Japanese", "Prawn"],
    isHalal: true,
    isVegetarian: false,
    isSpicy: false,
    prepTime: "18 mins",
  },
  {
    id: "dish-8",
    restaurantId: "the-copper-chimney",
    restaurantName: "The Copper Chimney",
    name: "Creamy Butter Chicken Masala with Garlic Naan",
    category: "desi",
    price: 19.50,
    priceFormatted: "$19.50",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=800&auto=format&fit=crop",
    description: "Charcoal-tandoor smoked chicken morsels simmered in velvety butter-tomato gravy, served with hot butter garlic naan.",
    rating: 4.85,
    reviewCount: 380,
    neighborhood: "Banani Avenue",
    tags: ["Chicken", "Butter Chicken", "North Indian", "Halal"],
    isHalal: true,
    isVegetarian: false,
    isSpicy: false,
    prepTime: "18 mins",
  },
  {
    id: "dish-9",
    restaurantId: "the-copper-chimney",
    restaurantName: "The Copper Chimney",
    name: "Spicy Grilled Prawn Malai Curry",
    category: "desi",
    price: 24.00,
    priceFormatted: "$24.00",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop",
    description: "Jumbo Bay of Bengal tiger prawns simmered in fresh coconut milk, green cardamom, roasted mustard, and green chilies.",
    rating: 4.9,
    reviewCount: 145,
    neighborhood: "Banani Avenue",
    tags: ["Seafood", "Prawn", "Spicy", "Curry"],
    isHalal: true,
    isVegetarian: false,
    isSpicy: true,
    prepTime: "20 mins",
  },
  {
    id: "dish-10",
    restaurantId: "the-copper-chimney",
    restaurantName: "The Copper Chimney",
    name: "Traditional Daal Makhani with Jeera Rice",
    category: "desi",
    price: 11.50,
    priceFormatted: "$11.50",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop",
    description: "Black lentils slow-cooked overnight with ginger, organic butter, and double cream, served with cumin basmati.",
    rating: 4.8,
    reviewCount: 220,
    neighborhood: "Banani Avenue",
    tags: ["Vegetarian", "Lentils", "Comfort Food", "Affordable"],
    isHalal: true,
    isVegetarian: true,
    isSpicy: false,
    prepTime: "10 mins",
  },
  {
    id: "dish-11",
    restaurantId: "hanoi-saigon",
    restaurantName: "Hanoi Saigon",
    name: "Vietnamese Beef Pho Noodle Soup",
    category: "asian",
    price: 19.50,
    priceFormatted: "$19.50",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800&auto=format&fit=crop",
    description: "Tender beef brisket slices in spiced 18-hour bone broth with rice noodles, bean sprouts, Thai basil, and fresh lime.",
    rating: 4.75,
    reviewCount: 180,
    neighborhood: "Bashundhara R/A",
    tags: ["Pho", "Beef", "Soup", "Asian"],
    isHalal: true,
    isVegetarian: false,
    isSpicy: false,
    prepTime: "15 mins",
  },
  {
    id: "dish-12",
    restaurantId: "osteria-bella",
    restaurantName: "Osteria Bella",
    name: "Belgian Chocolate Molten Lava Cake",
    category: "desserts",
    price: 9.99,
    priceFormatted: "$9.99",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop",
    description: "Warm Belgian dark chocolate cake with flowing warm ganache center, served with a scoop of Madagascar vanilla bean gelato.",
    rating: 4.95,
    reviewCount: 420,
    neighborhood: "Uttara Sectors",
    tags: ["Dessert", "Chocolate", "Sweet", "Vegetarian"],
    isHalal: true,
    isVegetarian: true,
    isSpicy: false,
    prepTime: "12 mins",
  },
];

export interface QueryFilters {
  cuisine?: string;
  maxBudget?: number;
  minRating?: number;
  neighborhood?: string;
  isVegetarian?: boolean;
  isHalal?: boolean;
  isSpicy?: boolean;
  atmosphere?: string;
}

export interface DetectedIntent {
  isFoodQuery: boolean;
  intentType:
    | "greeting"
    | "identity"
    | "ai_status"
    | "reservation_faq"
    | "order_cart_faq"
    | "payment_faq"
    | "contact_faq"
    | "gratitude"
    | "general_chat"
    | "food_query";
  response: string;
}

export function detectIntent(prompt: string): DetectedIntent {
  const p = prompt.toLowerCase().trim();
  // Support both English and Bengali / Unicode characters
  const clean = p.replace(/[^\p{L}0-9\s]/gu, " ").replace(/\s+/g, " ").trim();

  // 1. Food keywords - If ANY food term is mentioned, it IS a food query!
  const foodKeywords = [
    "biryani", "kacchi", "dum", "khasi", "mutton", "beef", "chicken", "steak", "meat",
    "burger", "pizza", "pasta", "risotto", "sushi", "sashimi", "ramen", "noodles",
    "salmon", "fish", "prawn", "seafood", "shrimp", "curry", "rice", "bread", "naan",
    "tandoor", "tikka", "kebab", "salad", "soup", "dessert", "cake", "sweet", "gelato",
    "firni", "chocolate", "cheese", "sauce", "drink", "coffee", "tea", "beverage",
    "food", "dish", "dishes", "meal", "eat", "eating", "hungry", "craving", "crave",
    "breakfast", "lunch", "dinner", "brunch", "supper", "snack",
    "restaurant", "restaurants", "cafe", "kitchen", "kitchens", "menu", "menus",
    "dine", "dining", "cuisine", "taste", "delicious", "gourmet", "spicy", "halal", "vegetarian", "veg",
    // Bengali transliterated & native
    "khabar", "khabo", "khete", "khawa", "khadya",
    "খাবার", "বিরিয়ানি", "বিরিয়ানি", "কাচ্চি", "বার্গার", "পিজ্জা", "ভাত", "মাংস", "মাছ"
  ];

  const hasFoodKeyword = foodKeywords.some((word) => {
    // For English word boundaries, or Bengali substring match
    if (/^[a-z0-9]+$/i.test(word)) {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      return regex.test(clean);
    }
    return clean.includes(word);
  });

  // If user explicitly asks for food, dish, hunger, cravings, restaurants -> food_query!
  if (hasFoodKeyword) {
    return {
      isFoodQuery: true,
      intentType: "food_query",
      response: "",
    };
  }

  // 2. Gemini & AI Status FAQ
  if (
    clean.includes("gemini") ||
    clean.includes("gemini 1 5") ||
    clean.includes("gemini 15") ||
    clean.includes("ai working") ||
    clean.includes("is ai working") ||
    clean.includes("real time ai") ||
    clean.includes("real time msg") ||
    clean.includes("working or not") ||
    clean.includes("kaj kore") ||
    clean.includes("kaj korche")
  ) {
    return {
      isFoodQuery: false,
      intentType: "ai_status",
      response:
        "Yes! **DineDesk AI is active and streaming real-time responses.**\n\n" +
        "• **Google Gemini Flash Integration:** Our architecture routes through Google's high-speed **Gemini Flash** streaming API (`streamGenerateContent`) with zero buffering.\n" +
        "• **Live Platform Intelligence:** Every restaurant, dish name, prep time, and USD ($) price comes directly from verified DineDesk kitchens.\n" +
        "• **Lossless Streaming:** SSE data packets are fully buffered and decoded on completion, preventing cut-offs.\n\n" +
        "What would you like to explore today? Tell me your favorite dish or budget in USD ($)!",
    };
  }

  // 2. Reservation / Booking FAQ
  if (
    clean.includes("reservation") ||
    clean.includes("reserve") ||
    clean.includes("book table") ||
    clean.includes("booking") ||
    clean.includes("table book") ||
    clean.includes("cancel reservation") ||
    clean.includes("modify booking")
  ) {
    return {
      isFoodQuery: false,
      intentType: "reservation_faq",
      response:
        "Booking a table on **DineDesk** is instant, seamless, and VIP-guaranteed!\n\n" +
        "**How it works:**\n" +
        "1. Click **\"Reserve Table\"** in the top navigation or ask me to find a restaurant.\n" +
        "2. Choose your preferred date, time slot, and guest count.\n" +
        "3. Select your desired seating ambiance (terrace, indoor hearth, or private dining).\n" +
        "4. Your table is reserved instantly, and you can view or modify bookings anytime under **\"My Table Reservations\"** in your profile menu.\n\n" +
        "Would you like me to recommend a top-rated restaurant for a table reservation?",
    };
  }

  // 3. Cart / Ordering FAQ
  if (
    clean.includes("cart") ||
    clean.includes("how to order") ||
    clean.includes("ordering") ||
    clean.includes("checkout") ||
    clean.includes("add to cart") ||
    clean.includes("shopping bag") ||
    clean.includes("place order")
  ) {
    return {
      isFoodQuery: false,
      intentType: "order_cart_faq",
      response:
        "Ordering on **DineDesk** lets you curate dishes from multiple partner kitchens in a single checkout:\n\n" +
        "1. Discover delicious dishes via **DineDesk AI** or **Browse Menus**.\n" +
        "2. Click **\"Add to Cart\"** on any dish to save it directly to your unified cart.\n" +
        "3. Click the shopping bag icon in the top-right navbar to view your order, modify quantities, and review live delivery fees.\n" +
        "4. Checkout securely with live tracking right to your doorstep.\n\n" +
        "Tell me what you'd like to eat, and I'll find the best options to add to your cart!",
    };
  }

  // 4. Payment / Stripe FAQ
  if (
    clean.includes("payment") ||
    clean.includes("pay") ||
    clean.includes("stripe") ||
    clean.includes("card") ||
    clean.includes("credit card") ||
    clean.includes("bkash") ||
    clean.includes("nagad") ||
    clean.includes("cash on delivery") ||
    clean.includes("refund")
  ) {
    return {
      isFoodQuery: false,
      intentType: "payment_faq",
      response:
        "**DineDesk** supports secure, encrypted payment options for your convenience:\n\n" +
        "• **Global Cards:** Visa, MasterCard, and American Express processed securely via Stripe with 256-bit encryption.\n" +
        "• **Digital Wallets:** Apple Pay and Google Pay.\n" +
        "• **Local MFS & Cash on Delivery:** Available for designated partner kitchen deliveries.\n\n" +
        "All transactions are protected by end-to-end security protocols.",
    };
  }

  // 5. Contact / Support FAQ
  if (
    clean.includes("contact") ||
    clean.includes("support") ||
    clean.includes("help center") ||
    clean.includes("phone") ||
    clean.includes("email") ||
    clean.includes("customer care") ||
    clean.includes("hotline") ||
    clean.includes("office")
  ) {
    return {
      isFoodQuery: false,
      intentType: "contact_faq",
      response:
        "Our dedicated **DineDesk Concierge Support** team is here to assist you 24/7:\n\n" +
        "• **Email:** support@dinedesk.com\n" +
        "• **Concierge Hotline:** +880 1700-DINEDESK (9:00 AM – 11:00 PM)\n" +
        "• **Live Order Inquiries:** Open your **Executive Dashboard** to view live order and table status.\n\n" +
        "How can we help make your dining experience smoother?",
    };
  }

  // 6. Gratitude / Appreciation / Parting
  const gratitudeWords = [
    "thank you", "thanks", "thx", "thank u", "dhonnobad", "bye", "goodbye", "see you",
    "awesome", "great", "nice", "cool", "super", "ok", "okay", "alright", "got it"
  ];
  if (gratitudeWords.some((w) => clean === w || clean.startsWith(w + " ") || clean.endsWith(" " + w))) {
    return {
      isFoodQuery: false,
      intentType: "gratitude",
      response:
        "You're very welcome! It's always my pleasure assisting you.\n\n" +
        "Whenever you're hungry, planning a dinner date, or looking for something delicious to order, I'm right here. Wishing you a delightful dining experience! 🍽️✨",
    };
  }

  // 7. Identity & Capabilities
  if (
    clean.includes("who are you") ||
    clean.includes("what are you") ||
    clean.includes("what is dinedesk") ||
    clean.includes("what is this") ||
    clean.includes("what can you do") ||
    clean.includes("tumi ke") ||
    clean.includes("eta ki") ||
    clean.includes("ki korte paro") ||
    clean.includes("tell me about yourself") ||
    clean.includes("your features") ||
    clean.includes("introduce yourself") ||
    clean.includes("তুমি কে") ||
    clean.includes("এটা কি") ||
    clean === "help"
  ) {
    return {
      isFoodQuery: false,
      intentType: "identity",
      response:
        "I am **DineDesk AI**, your intelligent culinary concierge!\n\n" +
        "**Here is what I can do for you:**\n" +
        "• **Smart Food Discovery:** Ask for specific dishes like *biryani, wood-fired pizza, salmon, gourmet burgers, or steaks*.\n" +
        "• **Budget Control:** Filter dishes strictly in US Dollars (e.g. *\"dinner under $20\"*).\n" +
        "• **Taste & Lifestyle:** Find vegetarian, halal-certified, or spicy options across verified kitchens.\n" +
        "• **Table Reservations & Multi-Cart:** Reserve tables or add dishes to your unified cart with live checkout.\n\n" +
        "What kind of food or dining experience are you looking for today?",
    };
  }

  // 8. Greetings & Chit-Chat (English & Bengali)
  const greetingWords = [
    "hello", "hi", "hey", "hola", "heya", "yo",
    "good morning", "good afternoon", "good evening", "good day",
    "how are you", "how r u", "how do you do", "whats up", "what's up",
    "ki khobor", "kemon acho", "kemon asen", "salam", "assalamu alaikum",
    "হ্যালো", "হাই", "কেমন আছো", "কেমন আছেন", "কি খবর", "সালাম", "আসসালামু আলাইকুম"
  ];
  if (greetingWords.some((w) => clean === w || clean.startsWith(w + " ") || clean.endsWith(" " + w))) {
    return {
      isFoodQuery: false,
      intentType: "greeting",
      response:
        "Hello! Welcome to **DineDesk AI**.\n\n" +
        "I'm your personal culinary concierge. Whether you're searching for authentic biryani, wood-fired pizza, fresh seafood, or a romantic dinner spot tonight, I can help you find verified dishes and kitchens instantly.\n\n" +
        "What are you craving today?",
    };
  }

  // 9. General Non-Food Questions (fallback to polite guidance rather than pushing food cards!)
  return {
    isFoodQuery: false,
    intentType: "general_chat",
    response:
      `I understand your question! As your **DineDesk Culinary Concierge**, my specialty is helping you discover extraordinary restaurants, verify live menus, find dishes that match your exact cravings and budget, or book table reservations.\n\n` +
      `Is there a specific dish, cuisine, or restaurant you'd like me to look up for you?`,
  };
}

// Search and rank real database records against parsed criteria
export function searchCatalog(prompt: string, filters: QueryFilters = {}) {
  const p = prompt.toLowerCase();

  // Natural language intent detection
  const wantsBiryani = p.includes("biryani") || p.includes("kacchi") || p.includes("dum");
  const wantsRomantic = p.includes("romantic") || p.includes("two") || p.includes("date") || filters.atmosphere === "Romantic";
  const wantsVegetarian = p.includes("vegetarian") || p.includes("veg") || filters.isVegetarian;
  const wantsSpicy = p.includes("spicy") || p.includes("hot") || p.includes("chili") || filters.isSpicy;
  const wantsSeafood = p.includes("seafood") || p.includes("salmon") || p.includes("prawn") || p.includes("fish");
  const wantsFamily = p.includes("family") || p.includes("kids") || p.includes("children") || filters.atmosphere === "Family-Friendly";
  const wantsSteak = p.includes("steak") || p.includes("beef") || p.includes("meat");
  const wantsBurger = p.includes("burger") || p.includes("smash");
  const wantsPizza = p.includes("pizza") || p.includes("pasta") || p.includes("italian");
  const wantsSushi = p.includes("sushi") || p.includes("japanese") || p.includes("ramen");
  const wantsDessert = p.includes("dessert") || p.includes("cake") || p.includes("sweet");

  // Price constraint extraction (e.g. "under $20" or "under 20")
  let maxPrice = filters.maxBudget;
  const priceMatch = p.match(/(?:under|below|less than|\$)\s*(\d+)/i);
  if (priceMatch && !maxPrice) {
    maxPrice = parseFloat(priceMatch[1]);
  }

  // Location extraction
  let targetLocation = filters.neighborhood;
  if (!targetLocation) {
    if (p.includes("gulshan")) targetLocation = "Gulshan 1 & 2";
    else if (p.includes("banani")) targetLocation = "Banani Avenue";
    else if (p.includes("dhanmondi")) targetLocation = "Dhanmondi Satmasjid Rd";
    else if (p.includes("uttara")) targetLocation = "Uttara Sectors";
    else if (p.includes("bashundhara")) targetLocation = "Bashundhara R/A";
  }

  // Tokenize prompt for semantic keyword matching
  const stopWords = new Set([
    "i", "want", "find", "me", "the", "a", "an", "for", "in", "with", "show", "some",
    "best", "good", "food", "dish", "dishes", "restaurant", "restaurants", "place",
    "places", "to", "eat", "at", "please", "can", "you", "get", "of", "and", "under", "below"
  ]);

  const tokens = p
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // 1. Score and rank restaurants
  const scoredRestaurants = REAL_RESTAURANTS.map((r) => {
    let score = r.rating;
    const nameLower = r.name.toLowerCase();
    const cuisineLower = r.cuisine.toLowerCase();
    const descLower = r.description.toLowerCase();
    const neighLower = r.neighborhood.toLowerCase();

    for (const token of tokens) {
      if (nameLower.includes(token)) score += 15;
      else if (cuisineLower.includes(token)) score += 10;
      else if (descLower.includes(token)) score += 6;
      else if (neighLower.includes(token)) score += 8;
    }

    if (wantsRomantic && r.atmosphere.includes("Romantic")) score += 12;
    if (wantsFamily && r.isKidFriendly) score += 10;
    if (wantsBiryani && cuisineLower.includes("biryani")) score += 20;
    if (wantsBurger && r.cuisineCategory === "burger") score += 20;
    if (wantsPizza && r.cuisineCategory === "italian") score += 20;
    if (wantsSushi && r.cuisineCategory === "japanese") score += 20;

    return { restaurant: r, score };
  });

  const hasSpecificQuery =
    tokens.length > 0 ||
    wantsBiryani ||
    wantsBurger ||
    wantsPizza ||
    wantsSushi ||
    wantsSeafood ||
    wantsSteak ||
    wantsDessert ||
    wantsRomantic ||
    wantsFamily;

  const validRestaurants = scoredRestaurants
    .filter(({ restaurant: r }) => {
      if (filters.cuisine && filters.cuisine !== "all" && r.cuisineCategory !== filters.cuisine) return false;
      if (filters.minRating && r.rating < filters.minRating) return false;
      if (filters.isHalal && !r.isHalal) return false;
      if (wantsVegetarian && !r.isVegetarianFriendly) return false;
      if (wantsFamily && !r.isKidFriendly) return false;
      if (targetLocation && r.neighborhood.toLowerCase() !== targetLocation.toLowerCase()) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score);

  const matchedRestaurants = (
    hasSpecificQuery && validRestaurants.some((item) => item.score > item.restaurant.rating)
      ? validRestaurants.filter((item) => item.score > item.restaurant.rating)
      : validRestaurants
  ).map(({ restaurant }) => restaurant);

  // 2. Score and rank dishes
  const scoredDishes = REAL_DISHES.map((d) => {
    let score = d.rating;
    const nameLower = d.name.toLowerCase();
    const descLower = d.description.toLowerCase();
    const restLower = d.restaurantName.toLowerCase();
    const categoryLower = d.category.toLowerCase();
    const tagsLower = d.tags.map((t) => t.toLowerCase()).join(" ");

    for (const token of tokens) {
      if (nameLower.includes(token)) score += 20;
      else if (tagsLower.includes(token)) score += 14;
      else if (categoryLower.includes(token)) score += 10;
      else if (descLower.includes(token)) score += 8;
      else if (restLower.includes(token)) score += 10;
    }

    if (wantsBiryani && (tagsLower.includes("biryani") || nameLower.includes("biryani"))) score += 25;
    if (wantsBurger && (categoryLower === "burger" || nameLower.includes("burger"))) score += 25;
    if (wantsPizza && (tagsLower.includes("pizza") || categoryLower === "italian")) score += 25;
    if (wantsSushi && (tagsLower.includes("sushi") || categoryLower === "japanese")) score += 25;
    if (wantsSeafood && (tagsLower.includes("seafood") || tagsLower.includes("salmon") || tagsLower.includes("prawn"))) score += 25;
    if (wantsSteak && (tagsLower.includes("beef") || tagsLower.includes("mutton"))) score += 25;
    if (wantsDessert && categoryLower === "desserts") score += 25;

    return { dish: d, score };
  });

  const validDishes = scoredDishes
    .filter(({ dish: d }) => {
      if (filters.cuisine && filters.cuisine !== "all" && d.category !== filters.cuisine) return false;
      if (maxPrice && d.price > maxPrice) return false;
      if (wantsVegetarian && !d.isVegetarian) return false;
      if (wantsSpicy && !d.isSpicy) return false;
      if (filters.isHalal && !d.isHalal) return false;
      if (targetLocation && d.neighborhood.toLowerCase() !== targetLocation.toLowerCase()) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score);

  const matchedDishes = (
    hasSpecificQuery && validDishes.some((item) => item.score > item.dish.rating)
      ? validDishes.filter((item) => item.score > item.dish.rating)
      : validDishes
  ).map(({ dish }) => dish);

  return {
    restaurants: matchedRestaurants.slice(0, 4),
    dishes: matchedDishes.slice(0, 6),
    appliedConstraints: {
      cuisine: filters.cuisine,
      maxPrice,
      targetLocation,
      wantsVegetarian,
      wantsSpicy,
      wantsRomantic,
      wantsFamily,
    },
  };
}
