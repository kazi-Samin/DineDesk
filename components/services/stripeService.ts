export async function initiateStripeCheckout(
    items: Array<{ name: string; price: number; quantity: number; image?: string }>,
    customerEmail?: string
) {
    try {
        const token = typeof window !== "undefined"
            ? localStorage.getItem("dinedesk_auth_token") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken") || ""
            : "";

        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items,
                customerEmail,
                token
            }),
        });

        const data = await response.json();

        if (response.ok && data.clientSecret) {
            return {
                clientSecret: data.clientSecret,
                paymentIntentId: data.paymentIntentId,
                orderId: data.orderId,
                total: data.total,
            };
        } else {
            throw new Error(data.error || "Failed to initialize embedded Stripe payment gateway");
        }
    } catch (err) {
        console.error("Stripe payment gateway initialization error:", err);
        throw err;
    }
}
