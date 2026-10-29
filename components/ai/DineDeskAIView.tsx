// components/ai/DineDeskAIView.tsx
// High-Performance DineDesk AI Discovery Experience with Stream Throttling & Zero-Lag Architecture

"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import DineDeskAILogo from "./DineDeskAILogo";
import Logo from "@/components/Logo";
import { AIRestaurant, AIDish, QueryFilters } from "@/lib/dinedeskAIEngine";
import { useCart } from "@/context/CartContext";

// =========================================================================
// CONSTANTS & CATALOG MAPPINGS
// =========================================================================

const SUGGESTED_PROMPTS = [
  { label: "Biryani under $20", query: "Find the best biryani under $20" },
  { label: "Romantic dinner for two", query: "Recommend a romantic restaurant for two tonight" },
  { label: "Top-rated vegetarian", query: "Show me top rated vegetarian dishes" },
  { label: "Family-friendly dining", query: "Find family-friendly restaurants with good atmosphere" },
  { label: "Quick lunch under $15", query: "Show affordable lunch dishes under $15" },
  { label: "Spicy chicken in Banani", query: "Find spicy chicken dishes near Banani" },
  { label: "Fresh salmon & seafood", query: "Show exquisite seafood and salmon dishes" },
];

const CUISINE_OPTIONS = [
  { id: "all", label: "All Cuisines" },
  { id: "desi", label: "Desi & Biryani" },
  { id: "japanese", label: "Japanese & Sushi" },
  { id: "italian", label: "Italian & Pizza" },
  { id: "american", label: "American & Steaks" },
  { id: "burger", label: "Gourmet Burgers" },
  { id: "asian", label: "Asian & Pho" },
  { id: "european", label: "European Hearth" },
  { id: "desserts", label: "Desserts & Bakery" },
];

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: undefined },
  { label: "Under $15", value: 15 },
  { label: "Under $20", value: 20 },
  { label: "Under $30", value: 30 },
  { label: "Under $40", value: 40 },
];

const NEIGHBORHOOD_OPTIONS = [
  "All Locations",
  "Gulshan 1 & 2",
  "Banani Avenue",
  "Dhanmondi Satmasjid Rd",
  "Uttara Sectors",
  "Bashundhara R/A",
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  restaurants?: AIRestaurant[];
  dishes?: AIDish[];
  isStreaming?: boolean;
}

// =========================================================================
// MEMOIZED SUB-COMPONENTS (Eliminates Re-render Freezes During Streaming)
// =========================================================================

/**
 * High-performance memoized Dish Card
 */
const DishCardItem = memo(function DishCardItem({
  dish,
  onAddToCart,
}: {
  dish: AIDish;
  onAddToCart: (dish: AIDish) => void;
}) {
  const cleanSearchQuery = dish.name.replace(/^Menu Item #\d+:\s*/, "");
  const itemHref = dish.id && dish.id.startsWith("cm")
    ? `/menus/${dish.id}`
    : `/explore?q=${encodeURIComponent(cleanSearchQuery)}`;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden flex flex-col hover:border-[#1b3b2b]/30 hover:shadow-md transition-all duration-200 group">
      <Link href={itemHref} className="relative h-40 w-full overflow-hidden bg-stone-100 block cursor-pointer">
        <Image
          src={dish.image}
          alt={dish.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm border border-white/10">
          {dish.priceFormatted}
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9f4122]">
            {dish.restaurantName} • {dish.neighborhood}
          </span>
          <Link href={itemHref} className="hover:text-[#9f4122] transition-colors">
            <h4 className="font-heading font-bold text-sm text-[#1b3b2b] line-clamp-1 hover:underline">
              {dish.name}
            </h4>
          </Link>
          <p className="text-xs text-[#1b3b2b]/70 font-normal line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
            <span className="material-symbols-outlined text-sm">star</span>
            <span>{dish.rating}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={itemHref}
              className="text-xs font-bold text-[#1b3b2b] hover:text-[#9f4122] bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Item</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>

            <button
              onClick={() => onAddToCart(dish)}
              className="text-xs font-bold bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0"
              type="button"
            >
              <span className="material-symbols-outlined text-xs">add_shopping_cart</span>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * High-performance memoized Restaurant Card
 */
const RestaurantCardItem = memo(function RestaurantCardItem({
  rest,
}: {
  rest: AIRestaurant;
}) {
  const restHref = `/explore?q=${encodeURIComponent(rest.name)}`;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 flex flex-col sm:flex-row gap-4 hover:border-[#1b3b2b]/30 hover:shadow-md transition-all duration-200 group">
      <Link href={restHref} className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden shrink-0 bg-stone-100 block cursor-pointer">
        <Image
          src={rest.image}
          alt={rest.name}
          fill
          sizes="(max-width: 640px) 100vw, 150px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
      </Link>

      <div className="flex-1 flex flex-col justify-between gap-2">
        <div>
          <div className="flex items-center justify-between gap-2">
            <Link href={restHref} className="hover:text-[#9f4122] transition-colors">
              <h4 className="font-heading font-bold text-base text-[#1b3b2b] hover:underline">
                {rest.name}
              </h4>
            </Link>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5 shrink-0">
              ★ {rest.rating}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#9f4122]">{rest.neighborhood}</p>
          <p className="text-xs text-[#1b3b2b]/70 font-normal line-clamp-2 mt-1 leading-relaxed">
            {rest.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 text-xs">
          <span className="font-mono font-semibold text-[#1b3b2b]/80">
            {rest.priceRangeStr}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={restHref}
              className="font-semibold text-[#1b3b2b] hover:text-[#9f4122] hover:underline px-2 py-1 flex items-center gap-1"
            >
              <span>View Menu</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
            <Link
              href="/reservations"
              className="font-semibold bg-[#1b3b2b]/10 hover:bg-[#1b3b2b]/15 text-[#1b3b2b] px-3 py-1 rounded-lg transition-colors"
            >
              Reserve
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Clean, lightweight AI formatted text renderer without heavy regex thrashing
 */
const RenderStreamedParagraphs = memo(function RenderStreamedParagraphs({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming?: boolean;
}) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-3 text-[#1b3b2b] text-sm sm:text-base leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const isLastParagraph = pIdx === paragraphs.length - 1;
        const lines = para.split(/\n/);

        return (
          <div key={pIdx}>
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
              const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : line;
              const isLastLine = isLastParagraph && lIdx === lines.length - 1;

              // Parse bold markers **text**
              const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

              const renderedParts = parts.map((part, idx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={idx} className="font-semibold text-[#1b3b2b]">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={idx}>{part}</span>;
              });

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 my-1.5 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C05621] mt-2 shrink-0" />
                    <span>
                      {renderedParts}
                      {isLastLine && isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 ml-1.5 bg-[#C05621] animate-pulse align-middle rounded-xs" />
                      )}
                    </span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className={lIdx > 0 ? "mt-1.5" : ""}>
                  {renderedParts}
                  {isLastLine && isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 ml-1.5 bg-[#C05621] animate-pulse align-middle rounded-xs" />
                  )}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});

// =========================================================================
// MAIN DINEDESK AI VIEW COMPONENT
// =========================================================================

export default function DineDeskAIView() {
  const { addItem } = useCart() as any;

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeFilters, setActiveFilters] = useState<QueryFilters>({
    cuisine: "all",
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "price_low">("relevance");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const initialPromptRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Buffer ref for high-speed streaming without freezing React
  const streamBufferRef = useRef<string>("");
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up speech recognition & active fetch abort controller on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);

  // 1. Session Persistence: Restore previous chat when entering or navigating back (up to 30 minutes)
  useEffect(() => {
    try {
      const saved =
        sessionStorage.getItem("dinedesk_ai_chat_session") ||
        localStorage.getItem("dinedesk_ai_chat_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        const ageMs = Date.now() - (parsed.timestamp || 0);
        const MAX_CACHE_MS = 30 * 60 * 1000; // 30 minutes retention
        if (ageMs < MAX_CACHE_MS && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setMessages(parsed.messages);
        } else {
          sessionStorage.removeItem("dinedesk_ai_chat_session");
          localStorage.removeItem("dinedesk_ai_chat_session");
        }
      }
    } catch {}
  }, []);

  // 2. Save active chat messages so navigating to "View Item" and clicking Back restores the conversation
  useEffect(() => {
    if (messages.length > 0 && !isGenerating) {
      try {
        const payload = {
          timestamp: Date.now(),
          messages: messages.map((m) => ({ ...m, isStreaming: false })),
        };
        sessionStorage.setItem("dinedesk_ai_chat_session", JSON.stringify(payload));
        localStorage.setItem("dinedesk_ai_chat_session", JSON.stringify(payload));
      } catch {}
    }
  }, [messages, isGenerating]);

  // 3. Clear Chat to start a fresh search
  const handleClearChat = useCallback(() => {
    setMessages([]);
    try {
      sessionStorage.removeItem("dinedesk_ai_chat_session");
      localStorage.removeItem("dinedesk_ai_chat_session");
    } catch {}
  }, []);

  // Smart non-intrusive auto-scroll (only scrolls if user is near bottom)
  const smartAutoScroll = useCallback((smooth = false) => {
    if (typeof window === "undefined") return;
    const scrollBottomDistance =
      document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);

    // Only scroll if user is within 180px of bottom (following stream)
    if (scrollBottomDistance < 180) {
      window.requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "end",
        });
      });
    }
  }, []);

  // Voice Search Mode
  const toggleVoiceMode = () => {
    if (isListening || shouldListenRef.current) {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      toast.error("Voice mode is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = (typeof navigator !== "undefined" && navigator.language) || "en-US";
      recognition.maxAlternatives = 1;

      shouldListenRef.current = true;
      initialPromptRef.current = prompt.trim() ? prompt.trim() + " " : "";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const fullLiveText = (initialPromptRef.current + final + interim).trimStart();
        if (fullLiveText) {
          if (textareaRef.current) {
            textareaRef.current.value = fullLiveText;
          }
          setPrompt(fullLiveText);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "no-speech") return;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          shouldListenRef.current = false;
          setIsListening(false);
          toast.error("Microphone permission was denied.");
          return;
        }
        console.warn("Speech Recognition notice:", event.error);
      };

      recognition.onend = () => {
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start voice recognition:", err);
      shouldListenRef.current = false;
      setIsListening(false);
      toast.error("Could not activate voice mode.");
    }
  };

  // Add Dish to Cart
  const handleAddDishToCart = useCallback(
    (dish: AIDish) => {
      const newItem = {
        id: dish.id,
        menuId: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        restaurantName: dish.restaurantName,
        quantity: 1,
      };

      try {
        const existingCart = JSON.parse(localStorage.getItem("dine_desk_cart") || "[]");
        const idx = existingCart.findIndex((i: any) => i.id === dish.id || i.menuId === dish.id);
        if (idx > -1) {
          existingCart[idx].quantity = (existingCart[idx].quantity || 1) + 1;
        } else {
          existingCart.push(newItem);
        }
        localStorage.setItem("dine_desk_cart", JSON.stringify(existingCart));
        localStorage.setItem("dinedesk_cart", JSON.stringify(existingCart));
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } catch (e) {
        console.error("Cart storage sync error:", e);
      }

      if (typeof addItem === "function") {
        try {
          addItem(newItem as any);
        } catch {}
      }

      toast.success(`${dish.name} added to cart! ($${dish.price.toFixed(2)})`, { icon: "🛒" });
    },
    [addItem]
  );

  // Active filters count
  const activeFilterCount =
    (activeFilters.cuisine && activeFilters.cuisine !== "all" ? 1 : 0) +
    (activeFilters.maxBudget ? 1 : 0) +
    (activeFilters.neighborhood && activeFilters.neighborhood !== "All Locations" ? 1 : 0) +
    (activeFilters.isVegetarian ? 1 : 0) +
    (activeFilters.isHalal ? 1 : 0) +
    (activeFilters.isSpicy ? 1 : 0);

  const clearAllFilters = () => {
    setActiveFilters({ cuisine: "all" });
  };

  // Execute Search with Batched Stream Updates & Anti-Freeze Architecture
  const handleSearch = async (queryText?: string) => {
    const textToSubmit = (queryText || prompt).trim();
    if (!textToSubmit || isGenerating) return;

    // 1. Abort any previous in-flight search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setPrompt("");
    setIsGenerating(true);

    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `assistant_${Date.now()}`;

    // Append User and initial Assistant Message
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: textToSubmit },
      { id: assistantMsgId, role: "assistant", content: "", isStreaming: true, restaurants: [], dishes: [] },
    ]);

    // Initial scroll down to user prompt
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);

    streamBufferRef.current = "";

    try {
      const response = await fetch("/api/dinedesk-ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          prompt: textToSubmit,
          filters: activeFilters,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Unable to connect to DineDesk AI streaming service.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      // Function to flush buffered text to React state in a throttled frame
      const scheduleFlush = () => {
        if (flushTimeoutRef.current) return;
        flushTimeoutRef.current = setTimeout(() => {
          flushTimeoutRef.current = null;
          const currentText = streamBufferRef.current;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: currentText } : msg
            )
          );
          smartAutoScroll();
        }, 40); // 25 FPS max during text streaming = zero lag
      };

      const processLine = (rawLine: string) => {
        const line = rawLine.trim();
        if (!line || !line.startsWith("data:")) return;
        const jsonStr = line.replace(/^data:\s*/, "");
        if (!jsonStr) return;

        try {
          const data = JSON.parse(jsonStr);

          if (data.type === "text" && data.chunk) {
            streamBufferRef.current += data.chunk;
            scheduleFlush();
          } else if (data.type === "results") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      restaurants: data.restaurants || [],
                      dishes: data.dishes || [],
                    }
                  : msg
              )
            );
          } else if (data.type === "done") {
            // Immediate flush on stream completion
            if (flushTimeoutRef.current) {
              clearTimeout(flushTimeoutRef.current);
              flushTimeoutRef.current = null;
            }
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: streamBufferRef.current, isStreaming: false }
                  : msg
              )
            );
            smartAutoScroll(true);
          }
        } catch {
          // Incomplete chunk
        }
      };

      while (true) {
        const { done, value } = await reader.read();

        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            processLine(line);
          }
        }

        if (done) {
          buffer += decoder.decode();
          if (buffer.trim()) {
            const lines = buffer.split(/\r?\n/);
            for (const line of lines) {
              processLine(line);
            }
          }
          break;
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return; // Normal cancellation on new search
      }
      toast.error(err.message || "Failed to complete search");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  msg.content ||
                  "I apologize, but I encountered an error consulting our kitchens. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      setIsGenerating(false);
      smartAutoScroll(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1b3b2b] flex flex-col font-sans selection:bg-[#1b3b2b] selection:text-white">
      {/* =========================================================================
          1. HEADER (Mobile shows ONLY the DineDesk Logo, Desktop shows Brand & Nav)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/70 py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Mobile View: STRICT RULE - Show ONLY the existing DineDesk logo */}
          <div className="flex md:hidden items-center justify-between w-full">
            <div className="w-8" />
            <Logo size="sm" withLink={true} />
            {messages.length > 0 ? (
              <button
                onClick={handleClearChat}
                type="button"
                className="text-xs font-semibold text-[#1b3b2b]/70 hover:text-[#9f4122] p-1.5 rounded-lg border border-stone-200 bg-white"
                title="New Search"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
            ) : (
              <div className="w-8" />
            )}
          </div>

          {/* Desktop & Tablet View: Clean Brand + Professional AI Label + Navigation */}
          <div className="hidden md:flex items-center gap-5">
            <DineDeskAILogo size="md" withLink={true} iconOnly={false} href="/" />
            <div className="h-4 w-px bg-stone-300" />
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1b3b2b]/75 bg-stone-100 px-3 py-1 rounded-full border border-stone-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>AI-Powered Dining Discovery</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                type="button"
                className="text-xs font-semibold text-[#1b3b2b]/75 hover:text-[#9f4122] px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer mr-1"
                title="Start a new dining conversation"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>New Search</span>
              </button>
            )}

            <Link
              href="/explore"
              className="text-xs font-semibold text-[#1b3b2b]/75 hover:text-[#1b3b2b] px-3 py-1.5 rounded-lg hover:bg-stone-200/50 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-[#9f4122]">restaurant_menu</span>
              <span>Browse Menus</span>
            </Link>

            <Link
              href="/reservations"
              className="text-xs font-semibold text-[#1b3b2b]/75 hover:text-[#1b3b2b] px-3 py-1.5 rounded-lg hover:bg-stone-200/50 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-[#1b3b2b]">event_seat</span>
              <span>Reserve Table</span>
            </Link>

            <Link
              href="/"
              className="text-xs font-bold bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 px-3.5 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 ml-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Main Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT CONTAINER
         ========================================================================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Hero Section (Before Any Search) */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center gap-3 pt-6 pb-2">
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#1b3b2b] tracking-tight">
              What are you craving?
            </h1>
            <p className="text-sm sm:text-base text-[#1b3b2b]/70 font-normal max-w-xl leading-relaxed">
              Tell us what you're in the mood for. Discover dishes and restaurants that match your taste, budget, and dining preferences.
            </p>
          </div>
        )}

        {/* =========================================================================
            3. PROMPT COMPOSER (INITIAL STATE)
           ========================================================================= */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-4">
            <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm p-3.5 sm:p-4 flex flex-col gap-3 transition-shadow focus-within:shadow-md focus-within:border-[#1b3b2b]/30">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-xl text-[#C05621] pt-2 shrink-0">
                  search
                </span>
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isGenerating}
                  placeholder={
                    isListening
                      ? "Listening live... describe what you're craving..."
                      : "Describe the dish, budget, restaurant, or dining experience you're looking for…"
                  }
                  className="w-full bg-transparent resize-none text-sm sm:text-base text-[#1b3b2b] placeholder-stone-400 outline-none focus:ring-0 leading-relaxed font-normal"
                />
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  {/* Voice Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceMode}
                    disabled={isGenerating}
                    className={`p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                      isListening
                        ? "bg-[#1b3b2b] text-amber-300 border border-amber-400"
                        : "bg-stone-100 text-[#1b3b2b] hover:bg-stone-200 border border-stone-200"
                    }`}
                    title={isListening ? "Listening... click to stop" : "Voice Mode"}
                    aria-label="Toggle voice search"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">mic</span>
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSearch()}
                    disabled={!prompt.trim() || isGenerating}
                    className="p-2.5 sm:p-3 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center cursor-pointer"
                    type="button"
                    aria-label="Submit search"
                  >
                    {isGenerating ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-lg sm:text-xl">arrow_upward</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Suggested Prompts with Elegant Wrapping */}
              <div className="pt-2.5 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
                  Try:
                </span>
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item.query)}
                    disabled={isGenerating}
                    className="text-xs font-medium px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-[#1b3b2b]/80 hover:text-[#1b3b2b] border border-stone-200/60 transition-colors cursor-pointer"
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* =========================================================================
                4. FILTERS & CUISINE SHORTCUTS
               ========================================================================= */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Desktop Quick Category Shortcuts */}
                <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
                  {CUISINE_OPTIONS.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveFilters((prev) => ({ ...prev, cuisine: c.id }))}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                        activeFilters.cuisine === c.id
                          ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-2xs"
                          : "bg-white text-[#1b3b2b]/70 border-stone-200 hover:bg-stone-50"
                      }`}
                      type="button"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Filter and Sort Actions */}
                <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeFilterCount > 0
                        ? "bg-amber-500/10 border-amber-600 text-amber-700"
                        : "bg-white border-stone-200 text-[#1b3b2b] hover:bg-stone-50"
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">tune</span>
                    <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                  </button>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 underline cursor-pointer"
                      type="button"
                    >
                      Clear
                    </button>
                  )}

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-semibold bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-[#1b3b2b] outline-none cursor-pointer"
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="rating">Sort: Highest Rating</option>
                    <option value="price_low">Sort: Lowest Price ($)</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-bold text-stone-400">Active:</span>

                  {activeFilters.cuisine && activeFilters.cuisine !== "all" && (
                    <span className="inline-flex items-center gap-1 bg-[#1b3b2b] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      Cuisine: {activeFilters.cuisine.toUpperCase()}
                      <button
                        onClick={() => setActiveFilters((prev) => ({ ...prev, cuisine: "all" }))}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {activeFilters.maxBudget && (
                    <span className="inline-flex items-center gap-1 bg-[#1b3b2b] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      Max: ${activeFilters.maxBudget}
                      <button
                        onClick={() => setActiveFilters((prev) => ({ ...prev, maxBudget: undefined }))}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {activeFilters.neighborhood && activeFilters.neighborhood !== "All Locations" && (
                    <span className="inline-flex items-center gap-1 bg-[#1b3b2b] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      {activeFilters.neighborhood}
                      <button
                        onClick={() => setActiveFilters((prev) => ({ ...prev, neighborhood: undefined }))}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {activeFilters.isVegetarian && (
                    <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      Vegetarian
                      <button
                        onClick={() => setActiveFilters((prev) => ({ ...prev, isVegetarian: false }))}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {activeFilters.isHalal && (
                    <span className="inline-flex items-center gap-1 bg-emerald-800 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      Halal
                      <button
                        onClick={() => setActiveFilters((prev) => ({ ...prev, isHalal: false }))}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {activeFilters.isSpicy && (
                    <span className="inline-flex items-center gap-1 bg-amber-700 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      Spicy
                      <button
                        onClick={() => setActiveFilters((prev) => ({ ...prev, isSpicy: false }))}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Expandable Filter Drawer / Sheet */}
              {mobileFilterOpen && (
                <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-col gap-4 mt-1 transition-all">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Cuisine */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider">
                        Cuisine
                      </label>
                      <select
                        value={activeFilters.cuisine || "all"}
                        onChange={(e) => setActiveFilters((prev) => ({ ...prev, cuisine: e.target.value }))}
                        className="text-xs font-medium p-2 rounded-lg border border-stone-200 bg-stone-50"
                      >
                        {CUISINE_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Budget */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider">
                        Budget Limit
                      </label>
                      <select
                        value={activeFilters.maxBudget || ""}
                        onChange={(e) =>
                          setActiveFilters((prev) => ({
                            ...prev,
                            maxBudget: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                        className="text-xs font-medium p-2 rounded-lg border border-stone-200 bg-stone-50"
                      >
                        {BUDGET_OPTIONS.map((b, idx) => (
                          <option key={idx} value={b.value || ""}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Neighborhood */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider">
                        Neighborhood
                      </label>
                      <select
                        value={activeFilters.neighborhood || "All Locations"}
                        onChange={(e) =>
                          setActiveFilters((prev) => ({
                            ...prev,
                            neighborhood: e.target.value === "All Locations" ? undefined : e.target.value,
                          }))
                        }
                        className="text-xs font-medium p-2 rounded-lg border border-stone-200 bg-stone-50"
                      >
                        {NEIGHBORHOOD_OPTIONS.map((n, idx) => (
                          <option key={idx} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dietary Checkboxes */}
                  <div className="flex items-center gap-4 flex-wrap pt-2.5 border-t border-stone-100 text-xs font-semibold text-[#1b3b2b]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!activeFilters.isVegetarian}
                        onChange={(e) =>
                          setActiveFilters((prev) => ({ ...prev, isVegetarian: e.target.checked }))
                        }
                        className="rounded text-[#1b3b2b] focus:ring-0"
                      />
                      <span>Vegetarian</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!activeFilters.isHalal}
                        onChange={(e) =>
                          setActiveFilters((prev) => ({ ...prev, isHalal: e.target.checked }))
                        }
                        className="rounded text-[#1b3b2b] focus:ring-0"
                      />
                      <span>Halal</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!activeFilters.isSpicy}
                        onChange={(e) =>
                          setActiveFilters((prev) => ({ ...prev, isSpicy: e.target.checked }))
                        }
                        className="rounded text-[#1b3b2b] focus:ring-0"
                      />
                      <span>Spicy</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            5. CONVERSATION MESSAGES & REAL-TIME STREAMED CARDS
           ========================================================================= */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-6 pb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col gap-2.5 ${
                  message.role === "user" ? "items-end" : "items-start w-full"
                }`}
              >
                {/* User Message Bubble */}
                {message.role === "user" && (
                  <div className="bg-[#1b3b2b] text-white px-5 py-3 rounded-2xl rounded-br-none max-w-lg text-sm sm:text-base font-medium shadow-xs">
                    {message.content}
                  </div>
                )}

                {/* Assistant Message Container */}
                {message.role === "assistant" && (
                  <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <DineDeskAILogo size="sm" iconOnly={true} withLink={false} />
                        <div className="flex flex-col">
                          <span className="font-heading font-bold text-sm text-[#1b3b2b] leading-tight">
                            DineDesk AI
                          </span>
                          <span className="text-[10px] font-semibold text-[#C05621] uppercase tracking-wider leading-tight">
                            Dining Recommendation
                          </span>
                        </div>
                      </div>

                      {message.isStreaming && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C05621]">
                          <span className="w-2 h-2 rounded-full bg-[#C05621] animate-ping" />
                          <span>Streaming recommendation...</span>
                        </div>
                      )}
                    </div>

                    {/* AI Response Text */}
                    <div>
                      {message.content ? (
                        <RenderStreamedParagraphs
                          text={message.content}
                          isStreaming={message.isStreaming}
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-[#1b3b2b]/60 italic py-2">
                          <span className="material-symbols-outlined text-lg animate-spin text-[#C05621]">
                            progress_activity
                          </span>
                          <span>Searching menus and dining options...</span>
                        </div>
                      )}
                    </div>

                    {/* Verified Matching Dishes */}
                    {message.dishes && message.dishes.length > 0 && (
                      <div className="flex flex-col gap-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading font-bold text-sm sm:text-base text-[#1b3b2b] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-emerald-700 text-lg">restaurant</span>
                            <span>Matching Dishes ({message.dishes.length})</span>
                          </h3>
                          <span className="text-xs font-medium text-stone-400">
                            Prices in USD ($)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {message.dishes.map((dish) => (
                            <DishCardItem
                              key={dish.id}
                              dish={dish}
                              onAddToCart={handleAddDishToCart}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Kitchens */}
                    {message.restaurants && message.restaurants.length > 0 && (
                      <div className="flex flex-col gap-3 pt-3 border-t border-stone-100">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-[#1b3b2b] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#C05621] text-lg">storefront</span>
                          <span>Recommended Kitchens ({message.restaurants.length})</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {message.restaurants.map((rest) => (
                            <RestaurantCardItem key={rest.id} rest={rest} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Refinements */}
                    {!message.isStreaming && (
                      <div className="pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-stone-400">Refine:</span>
                        <button
                          onClick={() => handleSearch("Make it cheaper under $15")}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[#1b3b2b] cursor-pointer transition-colors"
                          type="button"
                        >
                          Under $15
                        </button>
                        <button
                          onClick={() => handleSearch("Show vegetarian options only")}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[#1b3b2b] cursor-pointer transition-colors"
                          type="button"
                        >
                          Vegetarian only
                        </button>
                        <button
                          onClick={() => handleSearch("Places with outdoor seating")}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[#1b3b2b] cursor-pointer transition-colors"
                          type="button"
                        >
                          Outdoor seating
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* =========================================================================
          6. DOCKED STICKY BOTTOM INPUT (WHEN CHAT HAS STARTED)
         ========================================================================= */}
      {messages.length > 0 && (
        <div className="sticky bottom-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-stone-200 py-3 px-4 shadow-sm">
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-2">
            {/* Quick Suggestions & New Chat */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
                  Quick:
                </span>
                {SUGGESTED_PROMPTS.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item.query)}
                    disabled={isGenerating}
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white hover:bg-stone-100 text-[#1b3b2b] border border-stone-200 shrink-0 transition-colors cursor-pointer"
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (abortControllerRef.current) abortControllerRef.current.abort();
                  setMessages([]);
                  setPrompt("");
                }}
                disabled={isGenerating}
                className="text-xs font-semibold text-stone-500 hover:text-red-700 px-2 py-0.5 rounded-md transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                type="button"
                title="Start a new search"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span className="hidden sm:inline">New Search</span>
              </button>
            </div>

            {/* Input Composer Box */}
            <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-2 sm:p-2.5 flex items-center gap-2 transition-shadow focus-within:shadow-md focus-within:border-[#1b3b2b]/30">
              <span className="material-symbols-outlined text-lg text-[#C05621] shrink-0 pl-1">
                search
              </span>
              <textarea
                ref={textareaRef}
                rows={1}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                placeholder={
                  isListening
                    ? "Listening live... speak now..."
                    : "Ask a follow-up or describe another craving…"
                }
                className="w-full bg-transparent resize-none text-sm sm:text-base text-[#1b3b2b] placeholder-stone-400 outline-none focus:ring-0 leading-normal font-normal max-h-24"
              />

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleVoiceMode}
                  disabled={isGenerating}
                  className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    isListening
                      ? "bg-[#1b3b2b] text-amber-300 border border-amber-400"
                      : "bg-stone-100 text-[#1b3b2b] hover:bg-stone-200 border border-stone-200"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Voice mode"}
                >
                  <span className="material-symbols-outlined text-lg">mic</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={!prompt.trim() || isGenerating}
                  className="p-2 rounded-lg bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center cursor-pointer"
                  aria-label="Send message"
                >
                  {isGenerating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">arrow_upward</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
