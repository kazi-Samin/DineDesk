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

        // 1. Send request to your live backend order API to save the order and items in PostgreSQL
        const backendRes = await fetch(`${BACKEND_URL}/api/v1/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                orderType: orderType || "DELIVERY",
                paymentMethod: "STRIPE",
                deliveryAddress: deliveryAddress || "Standard Delivery Address",
                items: items, // Pass frontend cart items directly so the backend can create order items
            }),
        });

        const backendData = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: backendData.message || "Failed to create order in database" },
                { status: backendRes.status }
            );
        }

        const createdOrder = backendData.data.order;

        // 2. Map line items for Stripe Checkout Session using database order prices
        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(Number(item.price) * 100),
            },
            quantity: item.quantity || 1,
        }));

        // 3. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer_email: customerEmail || undefined,
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order-confirmation?order_id=${createdOrder.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order-confirmation/error?payment=cancelled`,
            metadata: { orderId: createdOrder.id },
        });

        return NextResponse.json({ url: session.url, orderId: createdOrder.id });
    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}