const TRANSFI_QUOTES_URL = "https://api.transfi.com/buy/quotes";

export async function fetchTransFiQuote() {
  const user = process.env.TRANSFI_USER;
  const pass = process.env.TRANSFI_PASS;
  const amount = 10000;
  try {
    if (!user || !pass) throw new Error("Missing TRANSFI_USER or TRANSFI_PASS");
    const url = new URL(TRANSFI_QUOTES_URL);
    url.searchParams.set("fiatTicker", "INR");
    url.searchParams.set("amount", String(amount));
    url.searchParams.set("cryptoTicker", "USDT");
    url.searchParams.set("paymentCode", "upi");

    const token = Buffer.from(`${user}:${pass}`).toString("base64");
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${token}` },
    });
    if (!res.ok) throw new Error(`TransFi ${res.status}`);
    const data = await res.json();
    const rate = parseFloat(data?.rate ?? data?.exchangeRate ?? 0);
    const fromAmount = parseFloat(data?.fromAmount ?? amount);
    const toAmount = parseFloat(data?.toAmount ?? data?.cryptoAmount ?? 0);
    if (rate <= 0 && toAmount <= 0) throw new Error("Invalid TransFi quote");
    const buyRateInrPerUsdt = rate > 0 ? rate : fromAmount / toAmount;
    const feePct = parseFloat(data?.feePercent ?? 0) || 0.85;
    return {
      providerId: "transfi",
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
      providerId: "transfi",
      buyRateInrPerUsdt: 88.4,
      platformFeePct: 0.85,
      paymentFeePct: 0.2,
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
