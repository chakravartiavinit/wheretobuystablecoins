const MERCURYO_BASE = "https://api.mercuryo.io/v1.6/widget/buy/rate";

export async function fetchMercuryoQuote() {
  const widgetId = process.env.MERCURYO_WIDGET_ID;
  const amount = 10000;
  try {
    if (!widgetId) throw new Error("Missing MERCURYO_WIDGET_ID");
    const url = new URL(MERCURYO_BASE);
    url.searchParams.set("from", "INR");
    url.searchParams.set("to", "USDT");
    url.searchParams.set("amount", String(amount));
    url.searchParams.set("network", "TRON");
    url.searchParams.set("widget_id", widgetId);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Mercuryo ${res.status}`);
    const json = await res.json();
    const data = json?.data ?? json;
    const rate = parseFloat(data?.rate ?? 0);
    const fee = parseFloat(data?.fee ?? 0);
    const fiatAmount = parseFloat(data?.fiat_amount ?? amount);
    const cryptoAmount = parseFloat(data?.crypto_amount ?? 0);
    if (rate <= 0 && cryptoAmount <= 0) throw new Error("Invalid Mercuryo rate");
    const buyRateInrPerUsdt = rate > 0 ? rate : fiatAmount / cryptoAmount;
    const feePct = fiatAmount > 0 ? (fee / fiatAmount) * 100 : 0;
    return {
      providerId: "mercuryo",
      buyRateInrPerUsdt: Number(buyRateInrPerUsdt.toFixed(4)),
      platformFeePct: Number((feePct * 0.8).toFixed(2)),
      paymentFeePct: Number((feePct * 0.2).toFixed(2)),
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "live",
      isLive: true,
    };
  } catch (e) {
    return {
      providerId: "mercuryo",
      buyRateInrPerUsdt: 88.5,
      platformFeePct: 1.0,
      paymentFeePct: 0.25,
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
