export default function sitemap() {
    const siteUrl = "https://www.wheretobuystablecoin.xyz";

    return [
        {
            url: `${siteUrl}/`,
            lastModified: new Date().toISOString().split('T')[0],
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
