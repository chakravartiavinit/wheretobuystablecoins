const COINBASE_ONRAMP_URL = "https://api.developer.coinbase.com/onramp/v1/buy/quote";

export async function fetchCoinbaseQuote() {
  const apiKey = process.env.COINBASE_CDP_API_KEY;
  const fiatAmount = 10000;
  try {
    if (!apiKey) throw new Error("Missing COINBASE_CDP_API_KEY");
    const res = await fetch(COINBASE_ONRAMP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": apiKey,
        "X-CC-Version": "2024-11-20",
      },
      body: JSON.stringify({
        purchase_currency: "USDT",
        payment_amount: String(fiatAmount),
        payment_currency: "INR",
        payment_method: "CARD",
        country: "IN",
      }),
    });
    if (!res.ok) throw new Error(`Coinbase Onramp ${res.status}`);
    const data = await res.json();
    const paymentTotal = parseFloat(data?.payment_total ?? 0);
    const purchaseAmount = parseFloat(data?.purchase_amount ?? 0);
    if (purchaseAmount <= 0) throw new Error("Invalid Coinbase quote");
    const buyRateInrPerUsdt = paymentTotal / purchaseAmount;
    const fee = parseFloat(data?.coinbase_fee ?? 0) + parseFloat(data?.network_fee ?? 0);
    const feePct = paymentTotal > 0 ? (fee / paymentTotal) * 100 : 0;
    return {
      providerId: "coinbase-onramp",
      buyRateInrPerUsdt: Number(buyRateInrPerUsdt.toFixed(4)),
      platformFeePct: Number((feePct * 0.7).toFixed(2)),
      paymentFeePct: Number((feePct * 0.3).toFixed(2)),
      spreadPct: 0.5,
      timestamp: new Date().toISOString(),
      source: "live",
      isLive: true,
    };
  } catch (e) {
    return {
      providerId: "coinbase-onramp",
      buyRateInrPerUsdt: 88.9,
      platformFeePct: 1.0,
      paymentFeePct: 0.3,
      spreadPct: 0.5,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
