export async function fetchDollarPeQuote() {
  return {
    providerId: "dollarpe-binance-merchant",
    buyRateInrPerUsdt: 87.9,
    platformFeePct: 0,
    paymentFeePct: 0,
    spreadPct: 0.35,
    timestamp: new Date().toISOString(),
    source: "seed-adapter",
  };
}
