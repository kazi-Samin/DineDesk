// app/api/dinedesk-ai/stream/route.ts
// Progressive Server-Sent Events (SSE) AI Streaming Route with Gemini 1.5 & Intent Classification

import { NextRequest, NextResponse } from "next/server";
import { searchCatalog, detectIntent, QueryFilters } from "@/lib/dinedeskAIEngine";
import {
  matchDishIntelligently,
  parseOrderCommand,
  parseDietaryConstraints,
  cleanDishName,
} from "@/lib/aiFuzzyMatcher";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, filters = {}, history = [], geminiApiKey = "" } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "A valid prompt is required." }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    const intent = detectIntent(cleanPrompt);

    // Ground search strictly against verified restaurant catalog
    const catalogResults = intent.isFoodQuery
      ? searchCatalog(cleanPrompt, filters as QueryFilters)
      : { restaurants: [], dishes: [], appliedConstraints: {} };

    // Intelligent Typo Detection, Natural Language & Order Command Understanding
    const orderCommand = parseOrderCommand(cleanPrompt);
    const dietary = parseDietaryConstraints(cleanPrompt);
    const intelligentMatch = intent.isFoodQuery
      ? matchDishIntelligently(cleanPrompt, catalogResults.dishes, dietary)
      : null;

    // Build context summary for Gemini
    const restaurantSummary = catalogResults.restaurants
      .map((r) => `• ${r.name} (${r.neighborhood}) - ${r.cuisine}, Price: ${r.priceRangeStr}, Rating: ${r.rating}★`)
      .join("\n");

    const dishSummary = catalogResults.dishes
      .map((d) => `• ${d.name} at ${d.restaurantName} - ${d.priceFormatted} (${d.category}, ${d.tags.join(", ")})`)
      .join("\n");

    const systemPrompt = !intent.isFoodQuery
      ? `You are DineDesk AI, a helpful, polite, and elegant culinary concierge for DineDesk restaurant platform.
The user is asking a general conversation question or platform inquiry (not ordering food).
Answer their question directly and warmly in the language they used (English, Bengali, or Banglish) in 1-2 short paragraphs.
Do NOT force food recommendations or suggest specific dishes unless they ask for food.`
      : `You are DineDesk AI, the official culinary concierge exclusively for DineDesk Flagship Premium Kitchen.
Every price you reference must strictly be in US Dollars ($).

CRITICAL ACCURACY & RESTAURANT RULES:
1. All dishes belong exclusively to the verified restaurant: "DineDesk Flagship Premium Kitchen". NEVER mention or invent any other restaurant.
2. ONLY recommend real dishes present in the VERIFIED DISHES catalog below.
3. If the user asks for an item that is NOT in the verified catalog (e.g. tacos, sushi burrito, etc.), explicitly tell them:
   "That item is not currently available at DineDesk Flagship Premium Kitchen. However, here are delicious options from our active menu that you might enjoy:"
   and recommend relevant items from the verified dishes below.
4. If the user asks for desserts or a category, showcase the matching items from the verified menu.
5. Provide a warm, concise, professional recommendation in the language user used (English or Bengali).

VERIFIED RESTAURANT:
${restaurantSummary || "• DineDesk Flagship Premium Kitchen (Gulshan Avenue, Dhaka) - Continental, Italian, Gourmet Mains, Desi & Handcrafted Desserts, Price: $10 - $45, Rating: 4.95★"}

VERIFIED DISHES:
${dishSummary || "None matched strictly"}`;

    const apiKey =
      geminiApiKey ||
      req.headers.get("x-gemini-api-key") ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";

    const encoder = new TextEncoder();

    // Streaming response with ReadableStream
    const readable = new ReadableStream({
      async start(controller) {
        // Send initial comment byte immediately so browser HTTP connection flushes with 0ms delay
        controller.enqueue(encoder.encode(": stream-start\n\n"));

        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // 1. Send verified catalog results immediately so visual cards appear without delay
        sendEvent({
          type: "results",
          restaurants: catalogResults.restaurants,
          dishes: catalogResults.dishes,
          constraints: catalogResults.appliedConstraints,
        });

        // 1b. If user gave an active order command with high/medium confidence, trigger immediate cart action
        if (orderCommand.isOrderCommand && intelligentMatch?.topMatch) {
          const top = intelligentMatch.topMatch;
          const qty = intelligentMatch.requestedQuantity || 1;
          sendEvent({
            type: "cart_action",
            action: "add",
            items: [
              {
                id: top.id,
                dishId: top.id,
                name: cleanDishName(top.name),
                price: top.price,
                priceFormatted: top.priceFormatted,
                restaurantName: top.restaurantName,
                image: top.image,
                quantity: qty,
              },
            ],
          });
        }

        let geminiStreamSucceeded = false;

        if (apiKey) {
          const timeoutMs = 15000;
          const primaryModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
          const candidateModels = Array.from(
            new Set([primaryModel, "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"])
          );

          // Prepare conversation history
          const validHistory = (history || [])
            .filter((h: any) => h && typeof h.content === "string" && h.content.trim())
            .slice(-6)
            .map((h: any) => ({
              role: h.role === "assistant" || h.role === "model" ? "model" : "user",
              parts: [{ text: h.content }],
            }));

          const requestBody = JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              ...validHistory,
              { role: "user", parts: [{ text: cleanPrompt }] },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          });

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          };
          if (apiKey.startsWith("AQ.")) {
            headers["Authorization"] = `Bearer ${apiKey}`;
          }

          for (const model of candidateModels) {
            if (geminiStreamSucceeded) break;

            try {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
              const abortController = new AbortController();
              const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

              const geminiRes = await fetch(geminiUrl, {
                method: "POST",
                headers,
                signal: abortController.signal,
                body: requestBody,
              });

              clearTimeout(timeoutId);

              if (geminiRes.ok && geminiRes.body) {
                const reader = geminiRes.body.getReader();
                const decoder = new TextDecoder();
                let gBuffer = "";

                const processGeminiLine = (trimmed: string) => {
                  if (!trimmed.startsWith("data:")) return;
                  try {
                    const json = JSON.parse(trimmed.replace(/^data:\s*/, ""));
                    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                      sendEvent({ type: "text", chunk: text });
                      geminiStreamSucceeded = true;
                    }
                  } catch {}
                };

                while (true) {
                  const { done, value } = await reader.read();
                  if (value) {
                    gBuffer += decoder.decode(value, { stream: !done });
                    const lines = gBuffer.split("\n");
                    gBuffer = lines.pop() ?? "";
                    for (const line of lines) {
                      processGeminiLine(line.trim());
                    }
                  }
                  if (done) {
                    gBuffer += decoder.decode();
                    if (gBuffer.trim()) {
                      const lines = gBuffer.split("\n");
                      for (const line of lines) {
                        processGeminiLine(line.trim());
                      }
                    }
                    break;
                  }
                }

                if (geminiStreamSucceeded) {
                  break; // Stream completed successfully
                }
              } else {
                console.warn(`Gemini API model ${model} responded with status ${geminiRes.status}`);
              }
            } catch (modelErr: any) {
              console.warn(`Gemini model ${model} attempt bypassed:`, modelErr?.message || modelErr);
            }
          }
        }

        // 2. High-speed grounded engine fallback if Gemini is offline or unconfigured
        if (!geminiStreamSucceeded) {
          let fallbackText = "";

          if (!intent.isFoodQuery) {
            fallbackText = intent.response;
          } else if (intelligentMatch?.isUnavailable) {
            const dishName = cleanDishName(intelligentMatch.requestedDishName || cleanPrompt);
            fallbackText = `**${dishName}** is not currently available at **DineDesk Flagship Premium Kitchen**.\n\nHowever, here are delicious chef-recommended signature options from our active kitchen menu that you might enjoy:`;
          } else if ((intelligentMatch?.isCategory || cleanPrompt.toLowerCase().includes("dessert") || cleanPrompt.toLowerCase().includes("sweet") || cleanPrompt.toLowerCase().includes("cake") || cleanPrompt.toLowerCase().includes("burger") || cleanPrompt.toLowerCase().includes("pizza") || cleanPrompt.toLowerCase().includes("biryani")) && catalogResults.dishes.length > 0) {
            const catName = cleanPrompt.toLowerCase().includes("dessert") || cleanPrompt.toLowerCase().includes("sweet") || cleanPrompt.toLowerCase().includes("cake") ? "dessert & handcrafted sweet" : (intelligentMatch?.categoryLabel || "chef-crafted");
            fallbackText = `Here are our exquisite **${catName}** selections freshly prepared at **DineDesk Flagship Premium Kitchen**:\n\nEvery dish is prepared fresh using authentic, premium ingredients. You can add any item directly to your cart or explore our verified options below.`;
          } else if (orderCommand.isOrderCommand && intelligentMatch?.topMatch) {
            const top = intelligentMatch.topMatch;
            const qty = intelligentMatch.requestedQuantity || 1;
            fallbackText = `🛒 I've added **${qty > 1 ? `${qty}x ` : ""}${cleanDishName(top.name)}** to your cart (${(top.price * qty).toFixed(2)}).\n\nIt's freshly prepared by **${top.restaurantName}** in about ${top.prepTime}. Would you like to add any drinks, desserts, or explore more from this kitchen?`;
          } else if (intelligentMatch?.confidence === "HIGH" && intelligentMatch?.topMatch) {
            const top = intelligentMatch.topMatch;
            fallbackText = `I found **${cleanDishName(top.name)}** at **${top.restaurantName}** (${top.priceFormatted})!\n\n${top.description} It's prepared fresh in about ${top.prepTime}. You can add it directly to your cart or explore the options below.`;
          } else if (intelligentMatch?.confidence === "MEDIUM" && intelligentMatch?.topMatch) {
            const top = intelligentMatch.topMatch;
            fallbackText = `Did you mean **${cleanDishName(top.name)}** from **${top.restaurantName}** (${top.priceFormatted})?\n\n${top.description} It's prepared fresh in about ${top.prepTime}. You can add it directly to your cart or check out the options below.`;
          } else if (dietary.excludedIngredients.length > 0) {
            const excludedList = dietary.excludedIngredients.join(", ");
            fallbackText = `Here are our chef-recommended dishes prepared completely without **${excludedList}**. Every dish below has been verified against our ingredient database:\n\nCheck out the options below!`;
          } else {
            const topRest = catalogResults.restaurants[0];
            const topDish = intelligentMatch?.topMatch || catalogResults.dishes[0];

            if (topDish && topRest) {
              fallbackText = `Based on your craving for **${cleanPrompt}**, I recommend the **${cleanDishName(topDish.name)}** at **${topDish.restaurantName}** (${topDish.priceFormatted}). This signature dish features ${topDish.description.toLowerCase()} and is prepared fresh in about ${topDish.prepTime}.\n\nIf you're planning a dine-in experience, **${topRest.name}** in ${topRest.neighborhood} offers an inviting atmosphere with a ${topRest.rating}★ rating from ${topRest.reviewCount}+ diners. Dishes range from ${topRest.priceRangeStr}.\n\nTake a look at the matching kitchens and dishes below. Would you like to reserve a table or view the full kitchen menu?`;
            } else if (topRest) {
              fallbackText = `For **${cleanPrompt}**, **${topRest.name}** in ${topRest.neighborhood} is an outstanding choice. Rated ${topRest.rating}★, they specialize in ${topRest.cuisine} with dining prices typically between ${topRest.priceRangeStr}.\n\nTheir culinary team is renowned for authentic preparation and warm hospitality. I've highlighted verified options below to fit your criteria.`;
            } else {
              fallbackText = `I searched our culinary directory for **${cleanPrompt}**. While no exact match met all strict constraints, I have curated the closest highly-rated options in neighboring kitchens below.\n\nTry relaxing your budget or expanding your neighborhood selection to explore more exquisite dishes!`;
            }
          }

          // Stream chunks progressively
          const words = fallbackText.match(/(\s+|\S+)/g) || [fallbackText];
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i];
            sendEvent({ type: "text", chunk });
            await new Promise((r) => setTimeout(r, 20));
          }
        }

        sendEvent({ type: "done" });
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform, no-store, must-revalidate",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "Content-Encoding": "none",
      },
    });
  } catch (err: any) {
    console.error("DineDesk AI route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
