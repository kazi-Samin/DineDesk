// app/api/dinedesk-ai/stream/route.ts
// Progressive Server-Sent Events (SSE) AI Streaming Route with Gemini 1.5 & Intent Classification

import { NextRequest, NextResponse } from "next/server";
import { searchCatalog, detectIntent, QueryFilters } from "@/lib/dinedeskAIEngine";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, filters = {}, history = [], geminiApiKey = "" } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "A valid prompt is required." }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    const intent = detectIntent(cleanPrompt);

    // Only search dishes and restaurants if user has a genuine food/dining intent
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

        // 1. Send verified catalog results immediately so visual cards appear instantly with zero delay
        // If not a food query (e.g. greeting, identity, faq), restaurants & dishes are [] so no food cards are shown
        sendEvent({
          type: "results",
          restaurants: catalogResults.restaurants,
          dishes: catalogResults.dishes,
          constraints: catalogResults.appliedConstraints,
        });

        let geminiStreamSucceeded = false;

        if (apiKey) {
          try {
            const isGoogleStudioKey = apiKey.startsWith("AIzaSy");
            const timeoutMs = isGoogleStudioKey ? 3500 : 1200;
            const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

            // Prepare history contents for Gemini
            const validHistory = (history || [])
              .filter((h: any) => h && typeof h.content === "string" && h.content.trim())
              .slice(-6)
              .map((h: any) => ({
                role: h.role === "assistant" || h.role === "model" ? "model" : "user",
                parts: [{ text: h.content }],
              }));

            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (apiKey.startsWith("AQ.")) {
              headers["Authorization"] = `Bearer ${apiKey}`;
            }

            const geminiRes = await fetch(geminiUrl, {
              method: "POST",
              headers,
              signal: abortController.signal,
              body: JSON.stringify({
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
              }),
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
            } else {
              console.warn("Gemini direct API returned non-ok status:", geminiRes.status);
            }
          } catch (geminiErr: any) {
            console.warn("Gemini stream bypassed, using real-time progressive engine:", geminiErr?.message || geminiErr);
          }
        }

        // 2. High-speed progressive real-time engine fallback (ChatGPT / Gemini style word-by-word streaming)
        if (!geminiStreamSucceeded) {
          let simulatedText = "";

          if (!intent.isFoodQuery) {
            // General conversational response (greeting, identity, reservation/cart faq, ai_status, etc.)
            simulatedText = intent.response;
          } else {
            const topRest = catalogResults.restaurants[0];
            const topDish = catalogResults.dishes[0];

            if (topDish && topRest) {
              simulatedText = `Based on your craving for **${cleanPrompt}**, I highly recommend starting with the **${topDish.name}** at **${topDish.restaurantName}** (${topDish.priceFormatted}). This signature dish features ${topDish.description.toLowerCase()} and is prepared fresh in about ${topDish.prepTime}.\n\nIf you're planning a dine-in experience, **${topRest.name}** in ${topRest.neighborhood} offers an inviting atmosphere with a ${topRest.rating}★ rating from ${topRest.reviewCount}+ diners. Dishes range from ${topRest.priceRangeStr}, offering exceptional value with verified ingredients.\n\nTake a look at the verified matching kitchens and dishes below. Would you like to reserve a table or view the full kitchen menu?`;
            } else if (topRest) {
              simulatedText = `For **${cleanPrompt}**, **${topRest.name}** in ${topRest.neighborhood} is an outstanding choice. Rated ${topRest.rating}★, they specialize in ${topRest.cuisine} with typical dining prices between ${topRest.priceRangeStr}.\n\nTheir culinary team is renowned for authentic preparation, warm hospitality, and reliable delivery. I've highlighted verified options below to fit your criteria.`;
            } else {
              simulatedText = `I searched our live culinary directory for **${cleanPrompt}**. While no exact match met all strict constraints, I have curated the closest highly-rated options in neighboring kitchens below.\n\nTry relaxing your budget or expanding your neighborhood selection to explore more exquisite dishes!`;
            }
          }

          // Stream individual tokens with 16ms intervals for natural ChatGPT / Gemini real-time typewriter flow
          const tokens = simulatedText.match(/(\s+|\S+)/g) || [simulatedText];
          for (let i = 0; i < tokens.length; i++) {
            const chunk = tokens[i];
            sendEvent({ type: "text", chunk });
            await new Promise((r) => setTimeout(r, 16));
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
