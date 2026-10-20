export async function initiateStripeCheckout(
    items: Array<{ name: string; price: number; quantity: number; image?: string }>,
    customerEmail?: string
) {
    try {
        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items, customerEmail }),
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url; // Redirects user to Stripe's secure checkout page
        } else {
            throw new Error(data.error || "Failed to create checkout session");
        }
    } catch (err) {
        console.error("Stripe redirect error:", err);
        throw err;
    }
}