export default function sitemap() {
    const siteUrl = "https://www.wheretobuystablecoin.xyz";

    return [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
