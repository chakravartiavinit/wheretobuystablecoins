const TRANSAK_BASE = "https://api.transak.com/api/v1";

export async function fetchTransakQuote() {
  const apiKey = process.env.TRANSAK_API_KEY;
  const fiatAmount = 10000;
  try {
    if (!apiKey) throw new Error("Missing TRANSAK_API_KEY");
    const url = new URL(`${TRANSAK_BASE}/pricing/public/quotes`);
    url.searchParams.set("partnerApiKey", apiKey);
    url.searchParams.set("fiatCurrency", "INR");
    url.searchParams.set("cryptoCurrency", "USDT");
    url.searchParams.set("isBuyOrSell", "BUY");
    url.searchParams.set("network", "tron");
    url.searchParams.set("paymentMethod", "upi_instant");
    url.searchParams.set("fiatAmount", String(fiatAmount));
    url.searchParams.set("quoteCountryCode", "IN");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Transak ${res.status}`);
    const json = await res.json();
    const r = json?.response;
    if (!r?.cryptoAmount || !r?.fiatAmount) throw new Error("Invalid Transak response");
    const cryptoAmount = parseFloat(r.cryptoAmount);
    const fiatAmountResp = parseFloat(r.fiatAmount);
    const totalFee = parseFloat(r.totalFee ?? 0) || 0;
    const buyRateInrPerUsdt = cryptoAmount > 0 ? fiatAmountResp / cryptoAmount : 0;
    const feePct = fiatAmountResp > 0 ? (totalFee / fiatAmountResp) * 100 : 0;
    return {
      providerId: "transak",
      buyRateInrPerUsdt: Number(buyRateInrPerUsdt.toFixed(4)),
      platformFeePct: Number((feePct * 0.7).toFixed(2)),
      paymentFeePct: Number((feePct * 0.3).toFixed(2)),
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "live",
      isLive: true,
    };
  } catch (e) {
    return {
      providerId: "transak",
      buyRateInrPerUsdt: 88.6,
      platformFeePct: 0.99,
      paymentFeePct: 0.25,
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
