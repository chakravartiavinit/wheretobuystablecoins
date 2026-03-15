export async function fetchBanxaQuote() {
  const apiKey = process.env.BANXA_API_KEY;
  const partnerCode = process.env.BANXA_PARTNER_CODE || "metamask";
  const fiatAmount = 10000;
  try {
    if (!apiKey) throw new Error("Missing BANXA_API_KEY");
    const url = new URL(
      `https://api.banxa.com/${partnerCode}/v2/quotes/buy`
    );
    url.searchParams.set("paymentMethodId", "credit_debit_card");
    url.searchParams.set("crypto", "USDT");
    url.searchParams.set("blockchain", "TRC20");
    url.searchParams.set("fiat", "INR");
    url.searchParams.set("fiatAmount", String(fiatAmount));

    const res = await fetch(url.toString(), {
      headers: { "x-api-key": apiKey },
    });
    if (!res.ok) throw new Error(`Banxa ${res.status}`);
    const data = await res.json();
    const cryptoAmount = parseFloat(data?.cryptoAmount ?? 0);
    const fiatAmountResp = parseFloat(data?.fiatAmount ?? fiatAmount);
    const processingFee = parseFloat(data?.processingFee ?? 0);
    const networkFee = parseFloat(data?.networkFee ?? 0);
    if (cryptoAmount <= 0) throw new Error("Invalid Banxa quote");
    const buyRateInrPerUsdt = fiatAmountResp / cryptoAmount;
    const totalFee = processingFee + networkFee;
    const feePct = fiatAmountResp > 0 ? (totalFee / fiatAmountResp) * 100 : 0;
    return {
      providerId: "banxa",
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
      providerId: "banxa",
      buyRateInrPerUsdt: 88.75,
      platformFeePct: 1.1,
      paymentFeePct: 0.25,
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
