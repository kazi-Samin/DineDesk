// app/sitemap.ts -> served at /sitemap.xml
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://YOUR_LIVE_DOMAIN";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ];

    // TODO: Add dynamic menu/restaurant sitemap entries if needed

    return [...staticPages];
}