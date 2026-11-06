// lib/aiFuzzyMatcher.ts
// Intelligent Typo Detection, Fuzzy Matching & Natural Language Dish Understanding for DineDesk AI

import type { AIDish } from "./dinedeskAIEngine";

// =========================================================================
// 1. DICTIONARIES: PHONETIC VARIANTS, TYPOS & CULINARY SYNONYMS
// =========================================================================

export const COMMON_TYPOS: Record<string, string> = {
  // Common chicken typos
  chiken: "chicken",
  chikn: "chicken",
  chickn: "chicken",
  chkn: "chicken",
  chikenwings: "chicken wings",
  chikken: "chicken",
  chickin: "chicken",

  // Pizza typos
  piza: "pizza",
  pizaa: "pizza",
  pizzza: "pizza",
  peaza: "pizza",
  pezza: "pizza",

  // Pasta & Alfredo typos
  alferdo: "alfredo",
  alfrado: "alfredo",
  alfredoone: "alfredo",
  pastaa: "pasta",
  psta: "pasta",
  fettucine: "fettuccine",
  spagheti: "spaghetti",
  carbonaraa: "carbonara",
  lasana: "lasagna",
  risottoo: "risotto",
  risoto: "risotto",

  // Burger & Beef typos
  burgar: "burger",
  burgr: "burger",
  bogar: "burger",
  burgers: "burger",
  burgars: "burger",
  hamberger: "hamburger",
  hamburgers: "hamburger",
  beaf: "beef",
  bef: "beef",
  chese: "cheese",
  cheez: "cheese",
  bacn: "bacon",

  // Sides & Desserts
  frise: "fries",
  frys: "fries",
  frenchfrise: "french fries",
  frenchfries: "french fries",
  choclate: "chocolate",
  choclet: "chocolate",
  chcolate: "chocolate",
  cheesecak: "cheesecake",
  gelatto: "gelato",
  dessertss: "dessert",
  desserts: "dessert",
  deserts: "dessert",
  desert: "dessert",
  desertss: "dessert",
  sweetss: "dessert",
  sweets: "dessert",
  sweet: "dessert",
  pastryy: "pastry",
  pastrys: "pastry",

  // Desi & Asian
  biriyani: "biryani",
  biryany: "biryani",
  birny: "biryani",
  kachi: "kacchi",
  kacci: "kacchi",
  kachhi: "kacchi",
  shwarma: "shawarma",
  shawrma: "shawarma",
  noodles: "noodles",
  nudles: "noodles",
  sushiroll: "sushi roll",
  salmn: "salmon",
  coke: "coke",
  pepsi: "pepsi",
};

export const CULINARY_SYNONYMS: Record<string, string[]> = {
  spicy: ["hot", "chili", "fiery", "peppery", "jalapeño", "jalapeno", "flamin", "spiced"],
  burger: ["smash burger", "hamburger", "beef burger", "patty", "cheeseburger"],
  fries: ["french fries", "potato fries", "truffle fries", "chips", "potato wedges"],
  pasta: ["fettuccine", "spaghetti", "penne", "ravioli", "alfredo", "carbonara", "macaroni"],
  biryani: ["kacchi", "dum biryani", "shahi biryani", "polao", "khasi biryani"],
  drink: ["coke", "coca cola", "pepsi", "soda", "cold drink", "soft drink", "beverage", "water"],
  dessert: ["cake", "cheesecake", "lava cake", "molten lava", "pastry", "sweet", "brownie"],
  steak: ["ribeye", "strip steak", "sirloin", "beef steak", "tenderloin"],
  seafood: ["salmon", "prawn", "shrimp", "fish", "calamari", "lobster", "crab"],
};

export const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  a: 1,
  an: 1,
  single: 1,
  double: 2,
  pair: 2,
  couple: 2,
};

// =========================================================================
// 2. HIGH-PERFORMANCE FUZZY MATCHING (DAMERAU-LEVENSHTEIN)
// =========================================================================

/**
 * Damerau-Levenshtein distance with adjacent transposition support
 * (e.g. 'alferdo' -> 'alfredo' distance = 1, 'frise' -> 'fries' distance = 1)
 */
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (!al) return bl;
  if (!bl) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition check (swap adjacent characters)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }

  return matrix[al][bl];
}

/**
 * Normalized string similarity (0.0 to 1.0)
 */
export function wordSimilarity(a: string, b: string): number {
  const al = a.toLowerCase().trim();
  const bl = b.toLowerCase().trim();
  if (al === bl) return 1.0;
  if (!al || !bl) return 0.0;

  // Exact prefix or substring match gets high base score
  if (al.startsWith(bl) || bl.startsWith(al)) {
    const minL = Math.min(al.length, bl.length);
    const maxL = Math.max(al.length, bl.length);
    return Math.max(minL / maxL, 0.85);
  }

  const dist = damerauLevenshtein(al, bl);
  const maxLen = Math.max(al.length, bl.length);
  return maxLen === 0 ? 1 : Math.max(0, 1 - dist / maxLen);
}

// =========================================================================
// 3. TEXT NORMALIZATION & TOKENIZATION
// =========================================================================

const CONVERSATIONAL_FILLERS = new Set([
  "i", "want", "can", "i", "get", "give", "me", "please", "would", "like",
  "order", "add", "to", "cart", "in", "the", "a", "an", "of", "and", "with",
  "have", "bring", "one", "some", "buy", "for", "me", "show", "is", "there",
  "any", "do", "you", "that", "again", "my", "item", "items", "dish", "dishes",
  "food", "foods", "menu", "option", "options"
]);

/**
 * Normalizes input text by fixing known typos and stripping conversational noise
 */
export function normalizeFoodTokens(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}0-9\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  const corrected = words.map((w) => COMMON_TYPOS[w] || w);
  return corrected.filter((w) => !CONVERSATIONAL_FILLERS.has(w) && w.length > 1);
}

/**
 * Clean dish name by removing prefixes like "Menu Item #XX:"
 */
export function cleanDishName(name: string): string {
  return name.replace(/^Menu Item #\d+:\s*/i, "").trim();
}

// =========================================================================
// 4. ORDER COMMAND PARSING (E.G. "Give me two of the chicken burger")
// =========================================================================

export interface ParsedOrderItem {
  query: string;
  quantity: number;
}

export interface ParsedOrderCommand {
  isOrderCommand: boolean;
  items: ParsedOrderItem[];
}

export function parseOrderCommand(prompt: string): ParsedOrderCommand {
  const p = prompt.toLowerCase().trim();
  const orderTrigger = /\b(give me|add|order|buy|get me|i want|bring me|can i get|put in cart|i'd like|i would like)\b/i;
  const isOrder = orderTrigger.test(p);

  // Strip opening conversational command prefix
  let core = p.replace(
    /^(please\s+)?(can i get|give me|add|order|get me|i want|bring me|i would like|i'd like)\s+/i,
    ""
  );
  core = core.replace(/\s+(please|thanks|thank you)\b/gi, "");
  core = core.replace(/\s+(to my cart|in my cart|to cart|in cart)\b/gi, "");

  // Split multiple dishes joined by 'and', '&', 'plus', ','
  const segments = core
    .split(/\s*(?:,|\band\b|\bplus\b|&)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  const items: ParsedOrderItem[] = [];
  for (const seg of segments) {
    const match = seg.match(
      /^(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an|single|double)\s+(?:of\s+)?(?:the\s+)?(.*)$/i
    );
    if (match) {
      const qtyStr = match[1].toLowerCase();
      const qty = parseInt(qtyStr, 10) || NUMBER_WORDS[qtyStr] || 1;
      const cleanItem = match[2].trim();
      if (cleanItem) items.push({ quantity: qty, query: cleanItem });
    } else {
      if (seg) items.push({ quantity: 1, query: seg });
    }
  }

  return { isOrderCommand: isOrder, items };
}

// =========================================================================
// 5. DIETARY & INGREDIENT EXCLUSION PARSER
// =========================================================================

export interface DietaryConstraints {
  excludedIngredients: string[];
  requiresSpicy?: boolean;
  requiresVegetarian?: boolean;
  requiresHalal?: boolean;
  maxBudget?: number;
}

export function parseDietaryConstraints(prompt: string): DietaryConstraints {
  const p = prompt.toLowerCase();
  const excludedIngredients: string[] = [];

  // Match negative constraints: "without beef", "no beef", "free from beef", "doesn't have beef"
  const exclusionMatches = [
    ...p.matchAll(/\b(?:without|no|exclude|free from|dont want|don't want)\s+([a-z]+)/gi),
  ];
  for (const m of exclusionMatches) {
    const ingredient = m[1].toLowerCase().trim();
    if (ingredient) excludedIngredients.push(ingredient);
  }

  const requiresSpicy = p.includes("spicy") || p.includes("hot") || p.includes("chili");
  const requiresVegetarian = p.includes("vegetarian") || p.includes("veg") || p.includes("no meat");
  const requiresHalal = p.includes("halal");

  let maxBudget: number | undefined;
  const priceMatch = p.match(/(?:under|below|less than|\$)\s*(\d+)/i);
  if (priceMatch) {
    maxBudget = parseFloat(priceMatch[1]);
  }

  return {
    excludedIngredients,
    requiresSpicy,
    requiresVegetarian,
    requiresHalal,
    maxBudget,
  };
}

// =========================================================================
// 6. INTELLIGENT DISH MATCHING WITH CONFIDENCE SCORING
// =========================================================================

export interface ScoredCandidate {
  dish: AIDish;
  score: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  matchedTokens: string[];
}

export interface DishMatchResult {
  topMatch: AIDish | null;
  candidates: ScoredCandidate[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  suggestedClarification?: string;
  isOrderCommand: boolean;
  requestedQuantity: number;
  isCategory?: boolean;
  categoryLabel?: string;
  isUnavailable?: boolean;
  requestedDishName?: string;
}

/**
 * Calculates a match score (0.0 to 1.0) between user query tokens and a target dish
 */
export function scoreDishMatch(
  queryTokens: string[],
  dish: AIDish,
  constraints?: DietaryConstraints
): { score: number; matchedTokens: string[] } {
  const cleanName = cleanDishName(dish.name);
  const dishNameTokens = normalizeFoodTokens(cleanName);
  const dishDescTokens = normalizeFoodTokens(dish.description || "");
  const dishTags = (dish.tags || []).map((t) => t.toLowerCase());

  // 1. Strict Negative Exclusion Checks (e.g. "without beef")
  if (constraints && constraints.excludedIngredients.length > 0) {
    const fullDishText = `${cleanName} ${dish.description} ${dishTags.join(" ")}`.toLowerCase();
    for (const forbidden of constraints.excludedIngredients) {
      if (fullDishText.includes(forbidden)) {
        return { score: 0, matchedTokens: [] }; // Disqualified completely!
      }
    }
  }

  // 2. Dietary Requirement Penalties
  if (constraints?.requiresVegetarian && !dish.isVegetarian) {
    return { score: 0, matchedTokens: [] };
  }
  if (constraints?.requiresHalal && !dish.isHalal) {
    return { score: 0, matchedTokens: [] };
  }

  if (queryTokens.length === 0) {
    return { score: 0, matchedTokens: [] };
  }

  // 3. Multi-level Token Matching
  let queryMatchedWeight = 0;
  const matchedTokens: string[] = [];

  for (const qToken of queryTokens) {
    let bestTokenScore = 0;

    // A. Check against Dish Name Tokens (Highest Priority)
    for (const dToken of dishNameTokens) {
      const sim = wordSimilarity(qToken, dToken);
      if (sim > bestTokenScore) bestTokenScore = sim;
    }

    // B. Check against Synonyms (e.g. 'hot' -> 'spicy')
    for (const [key, synList] of Object.entries(CULINARY_SYNONYMS)) {
      if (qToken === key || synList.includes(qToken)) {
        const fullDishContext = `${cleanName} ${dishTags.join(" ")}`.toLowerCase();
        if (fullDishContext.includes(key) || synList.some((s) => fullDishContext.includes(s))) {
          bestTokenScore = Math.max(bestTokenScore, 0.90);
        }
      }
    }

    // C. Check against Dish Description Tokens (Secondary Priority)
    if (bestTokenScore < 0.8) {
      for (const descToken of dishDescTokens) {
        const sim = wordSimilarity(qToken, descToken);
        if (sim * 0.85 > bestTokenScore) bestTokenScore = sim * 0.85;
      }
    }

    // D. Check against Tags & Category (flexible for category queries like "dessertss", "burgers", "pizzas")
    const categoryLower = dish.category.toLowerCase();
    if (
      qToken === categoryLower ||
      qToken.startsWith(categoryLower) ||
      categoryLower.startsWith(qToken) ||
      wordSimilarity(qToken, categoryLower) >= 0.75
    ) {
      bestTokenScore = Math.max(bestTokenScore, 0.88);
    }
    for (const tag of dishTags) {
      if (
        qToken === tag ||
        qToken.startsWith(tag) ||
        tag.startsWith(qToken) ||
        wordSimilarity(qToken, tag) >= 0.75
      ) {
        bestTokenScore = Math.max(bestTokenScore, 0.88);
      }
    }

    if (bestTokenScore >= 0.70) {
      queryMatchedWeight += bestTokenScore;
      matchedTokens.push(qToken);
    }
  }

  // Compute coverage metrics
  const queryCoverage = queryMatchedWeight / queryTokens.length;
  const targetCoverage = dishNameTokens.length > 0 ? queryMatchedWeight / dishNameTokens.length : 0;

  // Composite Score formula prioritizing user query coverage
  let finalScore = 0.70 * queryCoverage + 0.30 * Math.min(targetCoverage, 1.0);

  // Bonus for Spicy request if dish is marked spicy
  if (constraints?.requiresSpicy && dish.isSpicy) {
    finalScore = Math.min(finalScore + 0.15, 1.0);
  }

  return { score: Math.round(finalScore * 100) / 100, matchedTokens };
}

/**
 * Grounded intelligent matcher that handles typos, synonyms, categories, and confidence categorization
 */
export function matchDishIntelligently(
  query: string,
  availableDishes: AIDish[],
  constraints?: DietaryConstraints
): DishMatchResult {
  const orderCommand = parseOrderCommand(query);
  const effectiveQuery = orderCommand.items[0]?.query || query;
  const queryTokens = normalizeFoodTokens(effectiveQuery);

  // 1. Category Detection (e.g., "give some dessertss item", "show burgers", "any pasta options")
  const p = query.toLowerCase();
  const categoryKeywords: Record<string, string> = {
    dessert: "desserts",
    desserts: "desserts",
    dessertss: "desserts",
    sweet: "desserts",
    sweets: "desserts",
    sweetss: "desserts",
    cake: "desserts",
    cakes: "desserts",
    burger: "burger",
    burgers: "burger",
    pizza: "pizza",
    pizzas: "pizza",
    pasta: "pasta",
    pastas: "pasta",
    biryani: "biryani",
    biryanis: "biryani",
    desi: "desi-biryani",
    seafood: "seafood",
    steak: "steak",
    steaks: "steak",
  };

  const isBrowsingIntent =
    /\b(some|any|show|give|list|options|items|variety|what|recommend|all|available|types?)\b/i.test(p) ||
    queryTokens.length <= 2;

  let matchedCategoryLabel: string | undefined;
  for (const token of queryTokens) {
    if (categoryKeywords[token]) {
      matchedCategoryLabel = categoryKeywords[token];
      break;
    }
  }

  const isCategory = !!matchedCategoryLabel && isBrowsingIntent && !orderCommand.isOrderCommand;

  const scored: ScoredCandidate[] = [];

  for (const dish of availableDishes) {
    const { score, matchedTokens } = scoreDishMatch(queryTokens, dish, constraints);
    if (score >= 0.35) {
      let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
      if (score >= 0.80) confidence = "HIGH";
      else if (score >= 0.55) confidence = "MEDIUM";

      scored.push({ dish, score, confidence, matchedTokens });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const topMatch = scored.length > 0 ? scored[0].dish : null;
  const topScore = scored.length > 0 ? scored[0].score : 0;

  // 2. Unavailable Item Detection (User explicitly requested a food not on the menu)
  const unavailableFoodTriggers =
    /\b(taco|tacos|burrito|burritos|sushi|sashimi|hotdog|hot dog|lasagna|dim sum|pad thai|ramen|pho|crepe|crepes|waffle|waffles|pancake|pancakes|donut|doughnut)\b/i;
  const isExplicitFoodQuery =
    orderCommand.isOrderCommand ||
    /\b(can i get|i want|give me|do you have|is there|any|order|bring|menu for)\b/i.test(p) ||
    unavailableFoodTriggers.test(p);

  const isUnavailable = isExplicitFoodQuery && !isCategory && topScore < 0.45;

  let overallConfidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (topScore >= 0.80) {
    // If top match is distinct from 2nd candidate by at least 0.08, high confidence
    const secondScore = scored[1]?.score || 0;
    overallConfidence = topScore - secondScore >= 0.08 || topScore >= 0.90 ? "HIGH" : "MEDIUM";
  } else if (topScore >= 0.55) {
    overallConfidence = "MEDIUM";
  }

  let suggestedClarification: string | undefined;
  if (isCategory) {
    suggestedClarification = undefined;
  } else if (isUnavailable) {
    suggestedClarification = `**${cleanDishName(effectiveQuery)}** is not currently available at DineDesk Flagship Premium Kitchen.`;
  } else if (overallConfidence === "MEDIUM" && topMatch) {
    suggestedClarification = `Did you mean **${cleanDishName(topMatch.name)}**?`;
  } else if (overallConfidence === "LOW") {
    suggestedClarification = `I couldn't find an exact dish matching "${effectiveQuery}". Here are our top kitchen recommendations below.`;
  }

  return {
    topMatch: (!isCategory && overallConfidence !== "LOW") ? topMatch : null,
    candidates: scored.slice(0, 5),
    confidence: isCategory ? "HIGH" : overallConfidence,
    suggestedClarification,
    isOrderCommand: orderCommand.isOrderCommand,
    requestedQuantity: orderCommand.items[0]?.quantity || 1,
    isCategory,
    categoryLabel: matchedCategoryLabel,
    isUnavailable,
    requestedDishName: effectiveQuery,
  };
}
