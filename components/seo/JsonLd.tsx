const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://YOUR_LIVE_DOMAIN";

export default function JsonLd() {
    const data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: "DineDesk",
                url: SITE_URL,
                logo: `${SITE_URL}/icon.png`,
                description:
                    "DineDesk is an online restaurant ordering and table reservation platform.",
                founder: [
                    { "@type": "Person", name: "Fourkan Bin Ilias" },
                    { "@type": "Person", name: "Kazi Mehedi Hasan" },
                ],
                parentOrganization: {
                    "@type": "Organization",
                    name: "DevCore Solutions",
                },
            },
            {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: "DineDesk",
                inLanguage: "en",
                publisher: { "@id": `${SITE_URL}/#organization` },
                potentialAction: {
                    "@type": "SearchAction",
                    target: `${SITE_URL}/explore?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                },
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}