import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

export async function POST(req: Request) {
    try {
        const { items, customerEmail, token, orderType, deliveryAddress } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items provided for checkout" }, { status: 400 });
        }

        let createdOrderId = `DD-${Math.floor(10000 + Math.random() * 90000)}`;

        // Attempt to create order in live backend if token is a standard JWT (not Better-Auth pseudo-token)
        const isBackendJwt = token && typeof token === "string" && !token.startsWith("better_auth_");
        if (isBackendJwt) {
            try {
                const backendRes = await fetch(`${BACKEND_URL}/api/v1/orders`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        orderType: orderType || "DELIVERY",
                        paymentMethod: "STRIPE",
                        deliveryAddress: deliveryAddress || "Standard Delivery Address",
                        items: items,
                    }),
                });

                if (backendRes.ok) {
                    const backendData = await backendRes.json().catch(() => ({}));
                    if (backendData?.data?.order?.id) {
                        createdOrderId = String(backendData.data.order.id);
                    }
                } else {
                    console.warn(`Backend order API returned status ${backendRes.status}, continuing to Stripe checkout with fallback order ID`);
                }
            } catch (backendErr) {
                console.warn("Backend order API request failed:", backendErr);
            }
        }

        // Map line items for Stripe Checkout Session
        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name || "DineDesk Menu Item",
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(Number(item.price || 0) * 100),
            },
            quantity: Number(item.quantity) || 1,
        }));

        const appUrl = (
            process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.NODE_ENV === "production" ? "https://dine-desk-one.vercel.app" : "http://localhost:3000")
        ).replace(/\/+$/, "");

        const email = typeof customerEmail === "string" && customerEmail.trim() ? customerEmail.trim() : undefined;

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            line_items: lineItems,
            mode: "payment",
            success_url: `${appUrl}/order-confirmation?order_id=${createdOrderId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/order-confirmation/error?payment=cancelled`,
            metadata: {
                orderId: String(createdOrderId),
                customerEmail: email || "",
            },
        });

        return NextResponse.json({ url: session.url, orderId: createdOrderId });
    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
