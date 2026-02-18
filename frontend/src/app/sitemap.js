export default function sitemap() {
    const siteUrl = "https://wheretobuystablecoins.com";

    return [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
