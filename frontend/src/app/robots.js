export default function robots() {
    const siteUrl = "https://www.wheretobuystablecoin.xyz";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/_next/"],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
