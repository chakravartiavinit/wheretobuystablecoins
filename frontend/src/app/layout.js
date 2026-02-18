import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = "https://www.wheretobuystablecoin.xyz";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Where to Buy Stablecoins | Compare Rates & Find the Best Deals",
    template: "%s | Where to Buy Stablecoins",
  },
  description:
    "Compare the cheapest and fastest ways to buy USDT, USDC, and other stablecoins with your local currency. Real-time rates, fees, and trusted exchanges — all in one place.",
  keywords: [
    "buy stablecoins",
    "buy USDT",
    "buy USDC",
    "stablecoin exchange",
    "cheapest way to buy stablecoins",
    "buy crypto with local currency",
    "stablecoin rates comparison",
    "buy USDT with INR",
    "buy USDC with USD",
    "crypto on-ramp",
    "stablecoin on-ramp",
    "best stablecoin exchange",
    "where to buy stablecoins",
    "USDT price comparison",
  ],
  authors: [{ name: "Where to Buy Stablecoins" }],
  creator: "Where to Buy Stablecoins",
  publisher: "Where to Buy Stablecoins",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Where to Buy Stablecoins",
    title: "Where to Buy Stablecoins | Compare Rates & Find the Best Deals",
    description:
      "Compare the cheapest and fastest ways to buy USDT, USDC, and other stablecoins with your local currency. Real-time rates, fees, and trusted exchanges.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Where to Buy Stablecoins — Compare Rates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where to Buy Stablecoins | Compare Rates & Find the Best Deals",
    description:
      "Compare the cheapest and fastest ways to buy USDT, USDC, and other stablecoins with your local currency.",
    images: ["/og-image.png"],
    creator: "@wheretobuystablecoins",
  },
  category: "finance",
  verification: {
    // Replace with your actual Google Search Console verification code
    // Get it from: https://search.google.com/search-console → Add property → HTML tag method
    google: "REPLACE_WITH_YOUR_GOOGLE_VERIFICATION_CODE",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={`${siteUrl}/`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Where to Buy Stablecoins",
              url: siteUrl,
              description:
                "Compare the cheapest and fastest ways to buy USDT, USDC, and other stablecoins with your local currency.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}/?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Where to Buy Stablecoins",
              url: siteUrl,
              logo: `${siteUrl}/favicon.ico`,
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

