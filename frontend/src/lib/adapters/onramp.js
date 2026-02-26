export async function fetchOnrampQuote() {
  return {
    providerId: "onramp-money",
    buyRateInrPerUsdt: 88.35,
    platformFeePct: 0.6,
    paymentFeePct: 0.2,
    spreadPct: 0.5,
    timestamp: new Date().toISOString(),
    source: "seed-adapter",
  };
}
