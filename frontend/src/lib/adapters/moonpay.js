const MOONPAY_BASE = "https://api.moonpay.com/v3";

export async function fetchMoonPayQuote() {
  const apiKey = process.env.MOONPAY_PK;
  const fiatAmount = 10000;
  try {
    if (!apiKey) throw new Error("Missing MOONPAY_PK");
    const url = new URL(`${MOONPAY_BASE}/currencies/usdt_trc20/buy_quote`);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("baseCurrencyCode", "inr");
    url.searchParams.set("baseCurrencyAmount", String(fiatAmount));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`MoonPay ${res.status}`);
    const data = await res.json();
    const quoteAmount = parseFloat(data?.quoteCurrencyAmount ?? 0);
    const baseAmount = parseFloat(data?.baseCurrencyAmount ?? fiatAmount);
    const feeAmount = parseFloat(data?.feeAmount ?? 0) + parseFloat(data?.extraFeeAmount ?? 0);
    if (quoteAmount <= 0) throw new Error("Invalid MoonPay quote");
    const buyRateInrPerUsdt = baseAmount / quoteAmount;
    const feePct = baseAmount > 0 ? (feeAmount / baseAmount) * 100 : 0;
    return {
      providerId: "moonpay",
      buyRateInrPerUsdt: Number(buyRateInrPerUsdt.toFixed(4)),
      platformFeePct: Number((feePct * 0.8).toFixed(2)),
      paymentFeePct: Number((feePct * 0.2).toFixed(2)),
      spreadPct: 0.45,
      timestamp: new Date().toISOString(),
      source: "live",
      isLive: true,
    };
  } catch (e) {
    return {
      providerId: "moonpay",
      buyRateInrPerUsdt: 88.8,
      platformFeePct: 1.2,
      paymentFeePct: 0.3,
      spreadPct: 0.45,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
