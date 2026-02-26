export async function fetchBinanceP2pQuote() {
  return {
    providerId: "binance-p2p",
    buyRateInrPerUsdt: 87.95,
    platformFeePct: 0,
    paymentFeePct: 0,
    spreadPct: 0.4,
    timestamp: new Date().toISOString(),
    source: "seed-adapter",
  };
}
