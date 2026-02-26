export async function fetchOnmetaQuote() {
  return {
    providerId: "onmeta",
    buyRateInrPerUsdt: 88.15,
    platformFeePct: 0.7,
    paymentFeePct: 0.25,
    spreadPct: 0.55,
    timestamp: new Date().toISOString(),
    source: "seed-adapter",
  };
}
