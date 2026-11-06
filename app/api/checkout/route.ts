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

        // Calculate total amount in cents
        const totalAmountInCents = items.reduce((sum: number, item: any) => {
            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 1);
            return sum + Math.round(price * quantity * 100);
        }, 0);

        const email = typeof customerEmail === "string" && customerEmail.trim() ? customerEmail.trim() : undefined;

        // Create Stripe PaymentIntent for embedded Stripe Payment Element (No external redirect!)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.max(50, totalAmountInCents),
            currency: "usd",
            description: `DineDesk Order #${createdOrderId}`,
            receipt_email: email,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: String(createdOrderId),
                customerEmail: email || "",
            },
        });

        return NextResponse.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            orderId: createdOrderId,
            total: Math.max(0.5, totalAmountInCents / 100),
        });
    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
