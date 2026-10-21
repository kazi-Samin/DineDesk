import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-02-28.acacia" as any,
});

export async function GET(request: Request) {
    try {
        const sessions = await stripe.checkout.sessions.list({
            limit: 100,
            status: "complete",
        });

        const payments = sessions.data.map((session) => ({
            stripeSessionId: session.id,
            paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || session.id,
            createdAt: new Date(session.created * 1000).toISOString(),
            amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        }));

        return NextResponse.json({
            success: true,
            payments,
        });
    } catch (error: any) {
        // Return dynamic fallback structure
        return NextResponse.json({
            success: true,
            payments: [],
        });
    }
}