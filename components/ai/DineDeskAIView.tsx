// components/ai/DineDeskAIView.tsx
// Complete DineDesk AI Discovery Experience with Progressive Streaming

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import DineDeskAILogo from "./DineDeskAILogo";
import { AIRestaurant, AIDish, QueryFilters } from "@/lib/dinedeskAIEngine";
import { useCart } from "@/context/CartContext";

const SUGGESTED_PROMPTS = [
  { label: "Biryani under $20", query: "Find the best biryani under $20" },
  { label: "Romantic dinner for two", query: "Recommend a romantic restaurant for two tonight" },
  { label: "Best vegetarian options", query: "Show me top rated vegetarian dishes" },
  { label: "Family-friendly restaurants", query: "Find family-friendly restaurants with good atmosphere" },
  { label: "Affordable lunch nearby", query: "Show affordable lunch dishes under $15" },
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  restaurants?: AIRestaurant[];
  dishes?: AIDish[];
  isStreaming?: boolean;
}

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
  const scrollTimeoutRef = useRef<any>(null);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Toggle Continuous Voice Search Mode (Streams words in real-time without timing out)
  const toggleVoiceMode = () => {
    if (isListening || shouldListenRef.current) {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      toast.error("Voice mode is not supported by your browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      // continuous keeps the microphone open without shutting down after a pause
      recognition.continuous = true;
      // interimResults delivers speech in real time as each word is spoken
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
          // Zero-latency direct DOM update so text appears without render lag
          if (textareaRef.current) {
            textareaRef.current.value = fullLiveText;
          }
          setPrompt(fullLiveText);
        }
      };

      recognition.onerror = (event: any) => {
        // "no-speech" is normal when pausing between words; do not stop listening
        if (event.error === "no-speech") {
          return;
        }

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          shouldListenRef.current = false;
          setIsListening(false);
          toast.error("Microphone permission was denied. Please allow microphone access in your browser.");
          return;
        }

        console.warn("Speech Recognition notice:", event.error);
      };

      recognition.onend = () => {
        // Automatically keep listening if user hasn't explicitly turned it off
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch (e) {
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

  // Auto-scroll efficiently when streaming or adding messages
  useEffect(() => {
    if (!bottomRef.current) return;
    if (isGenerating) {
      if (!scrollTimeoutRef.current) {
        scrollTimeoutRef.current = setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
          scrollTimeoutRef.current = null;
        }, 80);
      }
    } else {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isGenerating]);

  // Count active filters
  const activeFilterCount =
    (activeFilters.cuisine && activeFilters.cuisine !== "all" ? 1 : 0) +
    (activeFilters.maxBudget ? 1 : 0) +
    (activeFilters.neighborhood && activeFilters.neighborhood !== "All Locations" ? 1 : 0) +
    (activeFilters.isVegetarian ? 1 : 0) +
    (activeFilters.isHalal ? 1 : 0) +
    (activeFilters.isSpicy ? 1 : 0) +
    (activeFilters.atmosphere ? 1 : 0);

  const clearAllFilters = () => {
    setActiveFilters({ cuisine: "all" });
  };

  // Execute Search with real progressive SSE streaming
  const handleSearch = async (queryText?: string) => {
    const textToSubmit = (queryText || prompt).trim();
    if (!textToSubmit || isGenerating) return;

    setPrompt("");
    setIsGenerating(true);

    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `assistant_${Date.now()}`;

    // Append User Message
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: textToSubmit,
    };

    // Pre-create Assistant Message with streaming indicator
    const assistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
      restaurants: [],
      dishes: [],
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    try {
      const response = await fetch("/api/dinedesk-ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      let targetFullText = "";
      let displayedText = "";
      let streamFinished = false;

      // Real-time progressive streaming ticker (ChatGPT / Gemini style typewriter flow)
      const tickerInterval = setInterval(() => {
        if (displayedText.length < targetFullText.length) {
          // Advance smoothly by 1 word or 2-4 characters per tick
          const remaining = targetFullText.slice(displayedText.length);
          const nextWordMatch = remaining.search(/\s+/);
          let step = 3;
          if (nextWordMatch !== -1 && nextWordMatch < 10) {
            step = nextWordMatch + 1;
          } else {
            step = Math.min(4, remaining.length);
          }

          displayedText = targetFullText.slice(0, displayedText.length + step);
          const current = displayedText;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: current } : msg
            )
          );
        } else if (streamFinished) {
          clearInterval(tickerInterval);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: targetFullText, isStreaming: false }
                : msg
            )
          );
        }
      }, 16);

      const processLine = (rawLine: string) => {
        const line = rawLine.trim();
        if (!line || !line.startsWith("data:")) return;
        const jsonStr = line.replace(/^data:\s*/, "");
        if (!jsonStr) return;

        try {
          const data = JSON.parse(jsonStr);

          if (data.type === "text" && data.chunk) {
            targetFullText += data.chunk;
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
            streamFinished = true;
          }
        } catch {
          // Incomplete chunk - wait for next stream packet
        }
      };

      try {
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
            // Flush decoder and any remaining buffered line
            buffer += decoder.decode();
            if (buffer.trim()) {
              const lines = buffer.split(/\r?\n/);
              for (const line of lines) {
                processLine(line);
              }
              buffer = "";
            }
            streamFinished = true;
            break;
          }
        }
      } finally {
        // Allow ticker a brief window to flush remaining tail words smoothly
        setTimeout(() => {
          clearInterval(tickerInterval);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: targetFullText || msg.content,
                    isStreaming: false,
                  }
                : msg
            )
          );
        }, 400);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to complete search");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  msg.content ||
                  "I apologize, but I encountered an error while consulting our kitchens. Please verify your connection or try again.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleAddDishToCart = (dish: AIDish) => {
    const newItem = {
      id: dish.id,
      menuId: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      restaurantName: dish.restaurantName,
      quantity: 1,
    };

    // 1. Direct sync with the platform's primary cart storage ("dine_desk_cart")
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

    // 2. Sync with CartContext if mounted
    if (typeof addItem === "function") {
      try {
        addItem(newItem as any);
      } catch (e) {
        // ignore
      }
    }

    toast.success(`${dish.name} added to cart! ($${dish.price.toFixed(2)})`, { icon: "🛒" });
  };

  const renderAIMessage = (text: string, isStreaming?: boolean) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\n+/);

    return (
      <div className="flex flex-col gap-3">
        {paragraphs.map((para, pIdx) => {
          const lines = para.split(/\n/);
          const isLastParagraph = pIdx === paragraphs.length - 1;

          return (
            <div key={pIdx} className="leading-relaxed">
              {lines.map((line, lIdx) => {
                const isLastLine = lIdx === lines.length - 1;
                const trimmed = line.trim();
                const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
                const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : line;
                const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

                const renderedLine = parts.map((part, partIdx) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={partIdx} className="font-extrabold text-[#1b3b2b]">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return <span key={partIdx}>{part}</span>;
                });

                if (isBullet) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C05621] mt-2 shrink-0" />
                      <span className="text-sm sm:text-base">
                        {renderedLine}
                        {isLastParagraph && isLastLine && isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1.5 bg-[#C05621] animate-pulse align-middle rounded-xs" />
                        )}
                      </span>
                    </div>
                  );
                }

                return (
                  <p key={lIdx} className={lIdx > 0 ? "mt-1" : ""}>
                    {renderedLine}
                    {isLastParagraph && isLastLine && isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1.5 bg-[#C05621] animate-pulse align-middle rounded-xs" />
                    )}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1b3b2b] flex flex-col font-sans selection:bg-[#1b3b2b] selection:text-white">
      {/* =========================================================================
          1. HEADER
          Strict Rule: Mobile header shows ONLY the restaurant AI logo!
          Desktop view: Polished laptop/desktop header with brand & fast navigation.
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#1b3b2b]/10 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Mobile View: ONLY the restaurant AI logo is visible, centered and uncluttered */}
          <div className="flex md:hidden items-center justify-center w-full">
            <DineDeskAILogo size="lg" withLink={true} iconOnly={true} href="/" />
          </div>

          {/* Desktop & Laptop View: Full Brand + Status Capsule + Minimal Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <DineDeskAILogo size="md" withLink={true} iconOnly={false} href="/" />
            <div className="h-5 w-px bg-[#1b3b2b]/15" />
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1b3b2b]/80 bg-white px-3.5 py-1.5 rounded-full border border-[#1b3b2b]/15 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gemini 1.5 Real-Time Discovery • Verified Kitchens</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/explore"
              className="text-xs font-bold text-[#1b3b2b]/80 hover:text-[#1b3b2b] px-3.5 py-2 rounded-xl hover:bg-[#1b3b2b]/5 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-[#C05621]">restaurant_menu</span>
              <span>Browse Menus</span>
            </Link>

            <Link
              href="/reservations"
              className="text-xs font-bold text-[#1b3b2b]/80 hover:text-[#1b3b2b] px-3.5 py-2 rounded-xl hover:bg-[#1b3b2b]/5 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-[#1b3b2b]">event_seat</span>
              <span>Reserve Table</span>
            </Link>

            <Link
              href="/"
              className="text-xs font-bold bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Main Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT AREA (LAPTOP & MOBILE OPTIMIZED)
         ========================================================================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6">
        {/* Hero Section if no conversation yet */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-3 pt-2 pb-1"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E69557]/15 text-[#C05621] text-xs font-extrabold uppercase tracking-wider border border-[#E69557]/30">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Intelligent Food &amp; Kitchen Concierge</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#1b3b2b] tracking-tight">
              What are you craving?
            </h1>
            <p className="text-sm sm:text-base text-[#1b3b2b]/70 font-medium max-w-xl">
              Describe a dish, maximum budget in $, restaurant ambiance, or dining occasion.
              DineDesk AI verifies live kitchen menus and availability instantly.
            </p>
          </motion.div>
        )}

        {/* =========================================================================
            3. AI PROMPT COMPOSER (INITIAL HERO STATE)
           ========================================================================= */}
        {messages.length === 0 && (
          <>
            <div className="w-full bg-white rounded-3xl border border-[#1b3b2b]/15 shadow-[0_12px_40px_rgba(27,59,43,0.06)] p-3 sm:p-4 flex flex-col gap-3 relative transition-shadow focus-within:shadow-[0_16px_50px_rgba(27,59,43,0.12)] focus-within:border-[#1b3b2b]/30">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-xl text-[#C05621] pt-2 shrink-0">
              magic_button
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
                  : "Describe the food, restaurant, budget, or experience you're looking for..."
              }
              className="w-full bg-transparent resize-none text-sm sm:text-base text-[#1b3b2b] placeholder-[#1b3b2b]/40 outline-none focus:ring-0 leading-relaxed font-medium"
            />
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              {/* Voice Mode Button */}
              <button
                type="button"
                onClick={toggleVoiceMode}
                disabled={isGenerating}
                className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer group relative ${
                  isListening
                    ? "bg-[#1b3b2b] text-[#FFE082] border border-[#FFAA40]/70 shadow-[0_0_15px_rgba(246,173,85,0.35)]"
                    : "bg-[#FDFBF7] text-[#1b3b2b] hover:bg-[#1b3b2b]/10 border border-[#1b3b2b]/15"
                }`}
                title={isListening ? "Listening continuously... Click to finish speaking" : "Voice Mode: Click to speak"}
                aria-label={isListening ? "Stop voice listening" : "Start voice search"}
              >
                {isListening ? (
                  <div className="flex items-center gap-1.5 px-0.5">
                    <span className="material-symbols-outlined text-lg text-[#FFE082]">mic</span>
                    <span className="flex items-center gap-0.5">
                      <span className="w-0.5 h-3 bg-[#FFE082] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-0.5 h-4 bg-[#FFAA40] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-0.5 h-3 bg-[#FFE082] rounded-full animate-bounce" />
                    </span>
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-xl text-[#1b3b2b]/80 group-hover:text-[#1b3b2b] group-hover:scale-110 transition-transform">
                    mic
                  </span>
                )}
              </button>

              {/* Send Button */}
              <button
                onClick={() => handleSearch()}
                disabled={!prompt.trim() || isGenerating}
                className="p-3 rounded-2xl bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center cursor-pointer group"
                type="button"
                aria-label="Send prompt"
              >
                {isGenerating ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-0.5 transition-transform">
                    arrow_upward
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Suggested Prompts */}
          <div className="pt-2 border-t border-[#1b3b2b]/10 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <span className="text-[11px] font-bold text-[#1b3b2b]/50 shrink-0 uppercase tracking-wider">
              Try:
            </span>
            {SUGGESTED_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(item.query)}
                disabled={isGenerating}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FDFBF7] hover:bg-[#1b3b2b]/10 text-[#1b3b2b]/80 hover:text-[#1b3b2b] border border-[#1b3b2b]/10 shrink-0 transition-colors cursor-pointer"
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            4. ADVANCED RESTAURANT & DISH FILTERS TOOLBAR
           ========================================================================= */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Desktop / Laptop Quick Category Filters */}
            <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
              {CUISINE_OPTIONS.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveFilters((prev) => ({ ...prev, cuisine: c.id }))}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                    activeFilters.cuisine === c.id
                      ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-sm"
                      : "bg-white text-[#1b3b2b]/70 border-[#1b3b2b]/15 hover:bg-[#1b3b2b]/5"
                  }`}
                  type="button"
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Filter Toggle and Controls */}
            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeFilterCount > 0
                    ? "bg-[#E69557]/20 border-[#C05621] text-[#C05621]"
                    : "bg-white border-[#1b3b2b]/15 text-[#1b3b2b] hover:bg-[#1b3b2b]/5"
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
                  Clear all
                </button>
              )}

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-bold bg-white border border-[#1b3b2b]/15 rounded-xl px-3 py-2 text-[#1b3b2b] outline-none cursor-pointer"
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
              <span className="text-[11px] font-bold text-[#1b3b2b]/50">Active:</span>

              {activeFilters.cuisine && activeFilters.cuisine !== "all" && (
                <span className="inline-flex items-center gap-1 bg-[#1b3b2b] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  Cuisine: {activeFilters.cuisine.toUpperCase()}
                  <button
                    onClick={() => setActiveFilters((prev) => ({ ...prev, cuisine: "all" }))}
                    className="hover:opacity-75"
                  >
                    ✕
                  </button>
                </span>
              )}

              {activeFilters.maxBudget && (
                <span className="inline-flex items-center gap-1 bg-[#1b3b2b] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  Max: ${activeFilters.maxBudget}
                  <button
                    onClick={() => setActiveFilters((prev) => ({ ...prev, maxBudget: undefined }))}
                    className="hover:opacity-75"
                  >
                    ✕
                  </button>
                </span>
              )}

              {activeFilters.neighborhood && activeFilters.neighborhood !== "All Locations" && (
                <span className="inline-flex items-center gap-1 bg-[#1b3b2b] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  Loc: {activeFilters.neighborhood}
                  <button
                    onClick={() => setActiveFilters((prev) => ({ ...prev, neighborhood: undefined }))}
                    className="hover:opacity-75"
                  >
                    ✕
                  </button>
                </span>
              )}

              {activeFilters.isVegetarian && (
                <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  Vegetarian
                  <button
                    onClick={() => setActiveFilters((prev) => ({ ...prev, isVegetarian: false }))}
                    className="hover:opacity-75"
                  >
                    ✕
                  </button>
                </span>
              )}

              {activeFilters.isHalal && (
                <span className="inline-flex items-center gap-1 bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  Halal Certified
                  <button
                    onClick={() => setActiveFilters((prev) => ({ ...prev, isHalal: false }))}
                    className="hover:opacity-75"
                  >
                    ✕
                  </button>
                </span>
              )}

              {activeFilters.isSpicy && (
                <span className="inline-flex items-center gap-1 bg-amber-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  Spicy
                  <button
                    onClick={() => setActiveFilters((prev) => ({ ...prev, isSpicy: false }))}
                    className="hover:opacity-75"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Drawer / Popover for Expanded Filters */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-white rounded-2xl border border-[#1b3b2b]/15 p-4 shadow-lg flex flex-col gap-4 mt-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Cuisine */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider">
                      Cuisine Category
                    </label>
                    <select
                      value={activeFilters.cuisine || "all"}
                      onChange={(e) => setActiveFilters((prev) => ({ ...prev, cuisine: e.target.value }))}
                      className="text-xs font-semibold p-2 rounded-xl border border-[#1b3b2b]/15 bg-[#FDFBF7]"
                    >
                      {CUISINE_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget Limit */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider">
                      Max Price in Dollars ($)
                    </label>
                    <select
                      value={activeFilters.maxBudget || ""}
                      onChange={(e) =>
                        setActiveFilters((prev) => ({
                          ...prev,
                          maxBudget: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      className="text-xs font-semibold p-2 rounded-xl border border-[#1b3b2b]/15 bg-[#FDFBF7]"
                    >
                      {BUDGET_OPTIONS.map((b, idx) => (
                        <option key={idx} value={b.value || ""}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Neighborhood */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider">
                      Neighborhood Area
                    </label>
                    <select
                      value={activeFilters.neighborhood || "All Locations"}
                      onChange={(e) =>
                        setActiveFilters((prev) => ({
                          ...prev,
                          neighborhood: e.target.value === "All Locations" ? undefined : e.target.value,
                        }))
                      }
                      className="text-xs font-semibold p-2 rounded-xl border border-[#1b3b2b]/15 bg-[#FDFBF7]"
                    >
                      {NEIGHBORHOOD_OPTIONS.map((n, idx) => (
                        <option key={idx} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dietary Checks */}
                <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-[#1b3b2b]/10 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!activeFilters.isVegetarian}
                      onChange={(e) =>
                        setActiveFilters((prev) => ({ ...prev, isVegetarian: e.target.checked }))
                      }
                      className="rounded text-[#1b3b2b] focus:ring-0"
                    />
                    <span>Vegetarian Only</span>
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
                    <span>Halal Certified</span>
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
                    <span>Spicy Craving</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    )}

        {/* =========================================================================
            5. CONVERSATION & REAL-TIME STREAMING RESULTS (NATURAL TOP-DOWN FLOW)
           ========================================================================= */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-8 pb-8 pt-2">
            {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col gap-3 ${
                message.role === "user" ? "items-end" : "items-start w-full"
              }`}
            >
              {/* User Bubble */}
              {message.role === "user" && (
                <div className="bg-[#1b3b2b] text-white px-5 py-3 rounded-2xl rounded-br-none max-w-lg text-sm sm:text-base font-semibold shadow-md">
                  {message.content}
                </div>
              )}

              {/* Assistant Response Container */}
              {message.role === "assistant" && (
                <div className="w-full bg-white rounded-3xl border border-[#1b3b2b]/15 p-5 sm:p-7 shadow-sm flex flex-col gap-6">
                  {/* Assistant Identity Bar with upgraded Restaurant AI Emblem */}
                  <div className="flex items-center justify-between border-b border-[#1b3b2b]/10 pb-3">
                    <div className="flex items-center gap-3">
                      <DineDeskAILogo size="sm" iconOnly={true} withLink={false} />
                      <div className="flex flex-col">
                        <span className="font-heading font-black text-sm text-[#1b3b2b]">
                          DineDesk AI Recommendation
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C05621]">
                          Verified Real-Time Discovery
                        </span>
                      </div>
                    </div>

                    {message.isStreaming && (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#C05621]">
                        <span className="w-2 h-2 rounded-full bg-[#C05621] animate-ping" />
                        <span>Streaming live intelligence...</span>
                      </div>
                    )}
                  </div>

                  {/* Real-Time Progressive Streamed Explanation Text */}
                  <div className="prose prose-sm sm:prose-base text-[#1b3b2b] font-medium leading-relaxed max-w-none">
                    {message.content ? (
                      <div className="relative inline-block w-full">
                        {renderAIMessage(message.content, message.isStreaming)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-[#1b3b2b]/60 italic py-2">
                        <span className="material-symbols-outlined text-lg animate-spin text-[#C05621]">
                          progress_activity
                        </span>
                        <span>Consulting verified kitchens and live menus...</span>
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1.5 bg-[#C05621] animate-pulse align-middle rounded-xs" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* =========================================================================
                      6. VERIFIED DISH RESULTS CARDS (LAPTOP 3-COL, MOBILE 1-COL)
                     ========================================================================= */}
                  {message.dishes && message.dishes.length > 0 && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-black text-base sm:text-lg text-[#1b3b2b] flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-700">restaurant</span>
                          <span>Verified Matching Dishes ({message.dishes.length})</span>
                        </h3>
                        <span className="text-xs font-bold text-[#1b3b2b]/60">
                          Prices in USD ($)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {message.dishes.map((dish) => (
                          <div
                            key={dish.id}
                            className="bg-[#FDFBF7] rounded-2xl border border-[#1b3b2b]/15 overflow-hidden flex flex-col hover:border-[#1b3b2b]/40 hover:shadow-md transition-all group"
                          >
                            {/* Dish Photo */}
                            <div className="relative h-44 w-full overflow-hidden bg-stone-200">
                              <Image
                                src={dish.image}
                                alt={dish.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                              />
                              <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md text-[#FFE082] font-mono font-black text-xs px-2.5 py-1 rounded-xl shadow-md border border-white/20">
                                {dish.priceFormatted}
                              </div>
                            </div>

                            {/* Dish Details */}
                            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C05621]">
                                  {dish.restaurantName} • {dish.neighborhood}
                                </span>
                                <h4 className="font-heading font-black text-sm text-[#1b3b2b] line-clamp-1">
                                  {dish.name}
                                </h4>
                                <p className="text-xs text-[#1b3b2b]/70 font-medium line-clamp-2">
                                  {dish.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-[#1b3b2b]/10">
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                                  <span className="material-symbols-outlined text-sm">star</span>
                                  <span>{dish.rating}</span>
                                </div>

                                <button
                                  onClick={() => handleAddDishToCart(dish)}
                                  className="text-xs font-bold bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                  <span>Add to Cart</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      7. VERIFIED RESTAURANT CARDS (LAPTOP 2-COL, MOBILE 1-COL)
                     ========================================================================= */}
                  {message.restaurants && message.restaurants.length > 0 && (
                    <div className="flex flex-col gap-3 pt-4 border-t border-[#1b3b2b]/10">
                      <h3 className="font-heading font-black text-base sm:text-lg text-[#1b3b2b] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#C05621]">storefront</span>
                        <span>Recommended Partner Kitchens ({message.restaurants.length})</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {message.restaurants.map((rest) => (
                          <div
                            key={rest.id}
                            className="bg-[#FDFBF7] rounded-2xl border border-[#1b3b2b]/15 p-4 flex flex-col sm:flex-row gap-4 hover:border-[#1b3b2b]/40 hover:shadow-md transition-all group"
                          >
                            {/* Photo */}
                            <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden shrink-0 bg-stone-200">
                              <Image
                                src={rest.image}
                                alt={rest.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between gap-2">
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-heading font-black text-base text-[#1b3b2b]">
                                    {rest.name}
                                  </h4>
                                  <span className="text-xs font-bold text-amber-700 flex items-center gap-0.5 shrink-0">
                                    ★ {rest.rating}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-[#C05621]">{rest.neighborhood}</p>
                                <p className="text-xs text-[#1b3b2b]/70 font-medium line-clamp-2 mt-1">
                                  {rest.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-[#1b3b2b]/10 text-xs">
                                <span className="font-mono font-bold text-[#1b3b2b]/80">
                                  {rest.priceRangeStr}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/explore?q=${encodeURIComponent(rest.name)}`}
                                    className="font-bold text-[#1b3b2b] hover:underline"
                                  >
                                    View Menu
                                  </Link>
                                  <Link
                                    href="/reservations"
                                    className="font-bold bg-[#1b3b2b]/10 hover:bg-[#1b3b2b]/20 text-[#1b3b2b] px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    Reserve
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up refinement prompts */}
                  {!message.isStreaming && (
                    <div className="pt-3 border-t border-[#1b3b2b]/10 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-[#1b3b2b]/50">Follow up:</span>
                      <button
                        onClick={() => handleSearch("Make it cheaper under $15")}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FDFBF7] hover:bg-[#1b3b2b]/10 border border-[#1b3b2b]/15 text-[#1b3b2b]/80 cursor-pointer"
                        type="button"
                      >
                        Make it cheaper
                      </button>
                      <button
                        onClick={() => handleSearch("Show vegetarian alternatives only")}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FDFBF7] hover:bg-[#1b3b2b]/10 border border-[#1b3b2b]/15 text-[#1b3b2b]/80 cursor-pointer"
                        type="button"
                      >
                        Show vegetarian alternatives
                      </button>
                      <button
                        onClick={() => handleSearch("Show places with outdoor seating")}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FDFBF7] hover:bg-[#1b3b2b]/10 border border-[#1b3b2b]/15 text-[#1b3b2b]/80 cursor-pointer"
                        type="button"
                      >
                        Outdoor seating
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
      </main>

      {/* =========================================================================
          6. DOCKED STICKY BOTTOM CHAT COMPOSER (PRO AI EXPERIENCE)
         ========================================================================= */}
      {messages.length > 0 && (
        <div className="sticky bottom-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xl border-t border-[#1b3b2b]/10 py-3 sm:py-4 px-4 shadow-[0_-8px_30px_rgba(27,59,43,0.06)]">
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-2.5">
            {/* Quick suggested follow-up chips + New Search button */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1b3b2b]/50 shrink-0">
                  Quick:
                </span>
                {SUGGESTED_PROMPTS.slice(0, 5).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item.query)}
                    disabled={isGenerating}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-white hover:bg-[#1b3b2b]/10 text-[#1b3b2b]/80 border border-[#1b3b2b]/15 shrink-0 transition-colors cursor-pointer shadow-2xs"
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Reset/New Chat button */}
              <button
                onClick={() => {
                  setMessages([]);
                  setPrompt("");
                }}
                disabled={isGenerating}
                className="text-xs font-bold text-[#1b3b2b]/60 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer border border-[#1b3b2b]/10"
                type="button"
                title="Start a new conversation"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span className="hidden sm:inline">New Search</span>
              </button>
            </div>

            {/* Input Composer Box */}
            <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#1b3b2b]/20 shadow-[0_4px_20px_rgba(27,59,43,0.08)] p-2.5 sm:p-3 flex items-center gap-2.5 transition-shadow focus-within:shadow-[0_8px_30px_rgba(27,59,43,0.15)] focus-within:border-[#1b3b2b]/40">
              <span className="material-symbols-outlined text-lg sm:text-xl text-[#C05621] shrink-0 pl-1">
                magic_button
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
                    : "Ask a follow-up or describe what you want to eat..."
                }
                className="w-full bg-transparent resize-none text-sm sm:text-base text-[#1b3b2b] placeholder-[#1b3b2b]/40 outline-none focus:ring-0 leading-normal font-medium max-h-32"
              />

              <div className="flex items-center gap-2 shrink-0">
                {/* Voice mode button */}
                <button
                  type="button"
                  onClick={toggleVoiceMode}
                  disabled={isGenerating}
                  className={`p-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer ${
                    isListening
                      ? "bg-[#1b3b2b] text-[#FFE082] border border-[#FFAA40]/70"
                      : "bg-[#FDFBF7] text-[#1b3b2b] hover:bg-[#1b3b2b]/10 border border-[#1b3b2b]/15"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Voice mode: Click to speak"}
                >
                  <span className="material-symbols-outlined text-lg">mic</span>
                </button>

                {/* Send button */}
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={!prompt.trim() || isGenerating}
                  className="p-2.5 rounded-xl bg-[#1b3b2b] text-white hover:bg-[#1b3b2b]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center cursor-pointer"
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

            <p className="text-[10px] text-center text-[#1b3b2b]/50 font-medium">
              DineDesk AI verifies live kitchen menus and prices in USD ($).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
