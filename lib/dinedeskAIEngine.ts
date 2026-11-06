// lib/dinedeskAIEngine.ts
// DineDesk AI Knowledge & Search Engine based on real platform catalog

import {
  matchDishIntelligently,
  wordSimilarity,
  scoreDishMatch,
  parseOrderCommand,
  parseDietaryConstraints,
  normalizeFoodTokens,
  COMMON_TYPOS,
  cleanDishName,
  DietaryConstraints,
  DishMatchResult,
} from "./aiFuzzyMatcher";
import realDishesDb from "./real_dishes_db.json";

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
    id: "cmvs6cpze0000bxz82szue2pp",
    name: "DineDesk Flagship Premium Kitchen",
    cuisine: "Continental, Italian, Gourmet Mains, Desi & Handcrafted Desserts",
    cuisineCategory: "continental",
    priceTier: "$$",
    priceRangeStr: "$10 - $45",
    rating: 4.95,
    reviewCount: 520,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.50",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "DineDesk Flagship Premium Kitchen main dining room",
    badge: "Official Restaurant",
    neighborhood: "Gulshan Avenue, Dhaka",
    isOpen: true,
    isHalal: true,
    isVegetarianFriendly: true,
    isKidFriendly: true,
    isDineIn: true,
    isDelivery: true,
    description: "The official culinary flagship of DineDesk offering 400+ chef-curated dishes, woodfired pizzas, prime steaks, and decadent desserts.",
    atmosphere: ["Fine Dining", "Romantic", "Family-Friendly", "Casual"],
  },
];

export const REAL_DISHES: AIDish[] = realDishesDb as AIDish[];

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
  const clean = p.replace(/[^\p{L}0-9\s]/gu, " ").replace(/\s+/g, " ").trim();

  // A. Gemini / AI Status Inquiry
  if (
    clean.includes("gemini") ||
    clean.includes("gemini 1 5") ||
    clean.includes("gemini 15") ||
    clean.includes("ai working") ||
    clean.includes("is ai working") ||
    clean.includes("real time ai") ||
    clean.includes("working or not") ||
    clean.includes("kaj kore") ||
    clean.includes("kaj korche")
  ) {
    return {
      isFoodQuery: false,
      intentType: "ai_status",
      response:
        "Yes! **DineDesk AI is active and streaming real-time responses.**\n\n" +
        "• **Google Gemini Flash Integration:** High-speed streaming AI engine.\n" +
        "• **Live Platform Intelligence:** Every restaurant, dish name, prep time, and USD ($) price comes directly from verified DineDesk kitchens.\n\n" +
        "What would you like to explore today? Tell me your favorite dish or budget in USD ($)!",
    };
  }

  // B. Reservation FAQ (only if not an order or food request)
  if (
    (clean.includes("how to reserve") ||
     clean.includes("how to book a table") ||
     clean.includes("reservation policy") ||
     clean.includes("cancel reservation")) &&
    !clean.includes("food") && !clean.includes("dish") && !clean.includes("dessert") && !clean.includes("burger")
  ) {
    return {
      isFoodQuery: false,
      intentType: "reservation_faq",
      response:
        "Booking a table on **DineDesk** is instant, seamless, and VIP-guaranteed!\n\n" +
        "1. Select your favorite restaurant or seating area.\n" +
        "2. Choose your party size, date, and preferred dining period.\n" +
        "3. Confirm your reservation instantly with zero booking fees.\n\n" +
        "Would you like me to find open tables at our top-rated restaurants?",
    };
  }

  // C. Standalone Greetings
  if (/^(hi|hello|hey|hola|greetings|good morning|good afternoon|good evening|assalamu alaikum|salam)$/i.test(clean)) {
    return {
      isFoodQuery: false,
      intentType: "greeting",
      response:
        "Welcome to **DineDesk Culinary Concierge**! What delicious dishes, cuisine, or restaurant are you craving today?",
    };
  }

  // D. Standalone Gratitude
  if (/^(thanks|thank you|thx|much appreciated|dhonnobad|thank u)$/i.test(clean)) {
    return {
      isFoodQuery: false,
      intentType: "gratitude",
      response:
        "You're very welcome! Let me know if you need any other dish recommendations, table reservations, or live kitchen menus. Enjoy your meal!",
    };
  }

  // ALL other inquiries in the Culinary AI view are treated as food & menu searches!
  return {
    isFoodQuery: true,
    intentType: "food_query",
    response: "",
  };
}

// Search and rank real database records against parsed criteria
export function searchCatalog(prompt: string, filters: QueryFilters = {}, dynamicDishes?: AIDish[]) {
  const p = prompt.toLowerCase();

  // Tokenize prompt for semantic keyword matching
  const stopWords = new Set([
    "i", "want", "find", "me", "the", "a", "an", "for", "in", "with", "show", "some",
    "best", "good", "food", "dish", "dishes", "restaurant", "restaurants", "place",
    "places", "to", "eat", "at", "please", "can", "you", "get", "of", "and", "under", "below", "item", "items", "give"
  ]);

  const rawTokens = p
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const tokens = Array.from(new Set(rawTokens.flatMap((w) => {
    const fixed = COMMON_TYPOS[w];
    return fixed ? [w, fixed] : [w];
  })));

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
  const wantsDessert =
    p.includes("dessert") ||
    p.includes("cake") ||
    p.includes("sweet") ||
    p.includes("firni") ||
    p.includes("tiramisu") ||
    p.includes("cheesecake") ||
    p.includes("lava") ||
    p.includes("pastry") ||
    p.includes("pudding") ||
    tokens.some((t) => t === "dessert" || t.includes("dessert") || wordSimilarity(t, "dessert") >= 0.70 || wordSimilarity(t, "desserts") >= 0.70 || wordSimilarity(t, "sweet") >= 0.75);

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

  // 2. Score and rank dishes with fuzzy typo & semantic matching
  const dishesPool = dynamicDishes && dynamicDishes.length > 0 ? dynamicDishes : REAL_DISHES;
  const dietary = parseDietaryConstraints(prompt);
  const normalizedQueryTokens = normalizeFoodTokens(prompt);

  const scoredDishes = dishesPool.map((d) => {
    // Dietary exclusions check (e.g. "without beef")
    const dText = (d.name + ' ' + d.description + ' ' + d.tags.join(' ')).toLowerCase();
    const isExcluded = dietary.excludedIngredients.some((ing) => dText.includes(ing));
    if (isExcluded) {
      return { dish: d, score: -100 };
    }
    const { score: fuzzyScore } = scoreDishMatch(normalizedQueryTokens, d, dietary);
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
    if (wantsDessert && (categoryLower === "desserts" || tagsLower.includes("dessert") || tagsLower.includes("sweet") || nameLower.includes("cake") || nameLower.includes("cheesecake"))) score += 60;

    score += Math.round(fuzzyScore * 50);
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
