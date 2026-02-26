export async function fetchOnramperQuote() {
  return {
    providerId: "onramper-aggregator",
    buyRateInrPerUsdt: 88.25,
    platformFeePct: 0.45,
    paymentFeePct: 0.2,
    spreadPct: 0.35,
    isLive: true,
    timestamp: new Date().toISOString(),
    source: "seed-adapter",
  };
}
