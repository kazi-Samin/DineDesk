import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: Request) {
    try {
        const { items, customerEmail } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items provided for checkout" }, { status: 400 });
        }

        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(Number(item.price) * 100), // Stripe expects amounts in cents
            },
            quantity: item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            customer_email: customerEmail || undefined, // Pre-fills the user's email in Stripe Checkout
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/explore?payment=cancelled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}