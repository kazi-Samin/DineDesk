// app/api/dinedesk-ai/stream/route.ts
// Progressive Server-Sent Events (SSE) AI Streaming Route with Gemini 1.5 & Intent Classification

import { NextRequest, NextResponse } from "next/server";
import { searchCatalog, detectIntent, QueryFilters } from "@/lib/dinedeskAIEngine";

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
      : `You are DineDesk AI, an expert culinary concierge for DineDesk restaurant platform.
Every price you reference must strictly be in US Dollars ($).
Only recommend real restaurants and dishes from the verified catalog below.

VERIFIED RESTAURANTS:
${restaurantSummary || "None matched strictly"}

VERIFIED DISHES:
${dishSummary || "None matched strictly"}

INSTRUCTIONS:
1. Provide a warm, concise, professional recommendation in the language user used (English or Bengali).
2. Highlight why the recommended kitchen or dish matches their craving, budget in $, or dining occasion.
3. Keep descriptions mouth-watering, elegant, and directly tied to the verified prices and locations.
4. End with a helpful follow-up suggestion.`;

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

        let geminiStreamSucceeded = false;

        if (apiKey) {
          const timeoutMs = 15000;
          const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
          const candidateModels = Array.from(
            new Set([primaryModel, "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"])
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
          } else {
            const topRest = catalogResults.restaurants[0];
            const topDish = catalogResults.dishes[0];

            if (topDish && topRest) {
              fallbackText = `Based on your craving for **${cleanPrompt}**, I recommend starting with the **${topDish.name}** at **${topDish.restaurantName}** (${topDish.priceFormatted}). This signature dish features ${topDish.description.toLowerCase()} and is prepared fresh in about ${topDish.prepTime}.\n\nIf you're planning a dine-in experience, **${topRest.name}** in ${topRest.neighborhood} offers an inviting atmosphere with a ${topRest.rating}★ rating from ${topRest.reviewCount}+ diners. Dishes range from ${topRest.priceRangeStr}.\n\nTake a look at the matching kitchens and dishes below. Would you like to reserve a table or view the full kitchen menu?`;
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
