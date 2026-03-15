const GUARDARIAN_ESTIMATE_URL = "https://api-payments.guardarian.com/v1/estimate";

export async function fetchGuardarianQuote() {
  const apiKey = process.env.GUARDARIAN_API_KEY;
  const fromAmount = 10000;
  try {
    if (!apiKey) throw new Error("Missing GUARDARIAN_API_KEY");
    const url = new URL(GUARDARIAN_ESTIMATE_URL);
    url.searchParams.set("from_amount", String(fromAmount));
    url.searchParams.set("from_currency", "INR");
    url.searchParams.set("to_currency", "USDT");
    url.searchParams.set("to_network", "TRC20");

    const res = await fetch(url.toString(), {
      headers: { "x-api-key": apiKey },
    });
    if (!res.ok) throw new Error(`Guardarian ${res.status}`);
    const data = await res.json();
    const toAmount = parseFloat(data?.estimated_exchange_amount ?? data?.to_amount ?? 0);
    const rate = parseFloat(data?.rate ?? 0);
    const fee = parseFloat(data?.fee ?? 0);
    if (toAmount <= 0 && rate <= 0) throw new Error("Invalid Guardarian estimate");
    const buyRateInrPerUsdt = rate > 0 ? rate : fromAmount / toAmount;
    const feePct = fromAmount > 0 ? (fee / fromAmount) * 100 : 1.0;
    return {
      providerId: "guardarian",
      buyRateInrPerUsdt: Number(buyRateInrPerUsdt.toFixed(4)),
      platformFeePct: Number((feePct * 0.7).toFixed(2)),
      paymentFeePct: Number((feePct * 0.3).toFixed(2)),
      spreadPct: 0.45,
      timestamp: new Date().toISOString(),
      source: "live",
      isLive: true,
    };
  } catch (e) {
    return {
      providerId: "guardarian",
      buyRateInrPerUsdt: 88.7,
      platformFeePct: 1.0,
      paymentFeePct: 0.3,
      spreadPct: 0.45,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
