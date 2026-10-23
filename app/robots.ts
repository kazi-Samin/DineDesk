// app/robots.ts  ->  served at /robots.txt
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://YOUR_LIVE_DOMAIN";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // Private pages have no SEO value, so keep crawlers out.
                disallow: [
                    "/dashboard",
                    "/checkout",
                    "/order-confirmation",
                    "/sign-in",
                    "/sign-up",
                    "/login",
                    "/unauthorized",
                    "/api/",
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}