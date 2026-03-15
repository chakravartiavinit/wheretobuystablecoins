const BINANCE_P2P_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

function median(arr) {
  if (!arr?.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export async function fetchDollarPeQuote() {
  try {
    const res = await fetch(BINANCE_P2P_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        asset: "USDT",
        fiat: "INR",
        tradeType: "BUY",
        payTypes: [],
        publisherType: "merchant",
        merchantCheck: true,
        rows: 10,
        page: 1,
      }),
    });
    if (!res.ok) throw new Error(`DollarPe/Binance P2P ${res.status}`);
    const data = await res.json();
    const advs = data?.data?.advs ?? [];
    const prices = advs
      .slice(0, 10)
      .map((a) => parseFloat(a?.adv?.price ?? 0))
      .filter((p) => p > 0);
    const buyRateInrPerUsdt = median(prices);
    if (buyRateInrPerUsdt == null) throw new Error("No prices");
    return {
      providerId: "dollarpe-binance-merchant",
      buyRateInrPerUsdt: Number(buyRateInrPerUsdt.toFixed(4)),
      platformFeePct: 0,
      paymentFeePct: 0,
      spreadPct: 0.35,
      timestamp: new Date().toISOString(),
      source: "live",
      isLive: true,
    };
  } catch (e) {
    return {
      providerId: "dollarpe-binance-merchant",
      buyRateInrPerUsdt: 87.9,
      platformFeePct: 0,
      paymentFeePct: 0,
      spreadPct: 0.35,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
