export async function fetchTopperQuote() {
  return {
    providerId: "topper",
    buyRateInrPerUsdt: 88.6,
    platformFeePct: 0.95,
    paymentFeePct: 0.25,
    spreadPct: 0.45,
    timestamp: new Date().toISOString(),
    source: "seed-adapter",
    isLive: false,
  };
}
