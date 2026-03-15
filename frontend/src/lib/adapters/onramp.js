const ONRAMP_QUOTE_URL = "https://api.onramp.money/onramp/api/v2/whiteLabel/onramp/getQuote";

function signPayload(secret, payloadBase64) {
  const crypto = require("crypto");
  return crypto.createHmac("sha512", secret).update(payloadBase64).digest("base64");
}

export async function fetchOnrampQuote() {
  const apiKey = process.env.ONRAMP_API_KEY;
  const apiSecret = process.env.ONRAMP_API_SECRET;
  try {
    if (!apiKey || !apiSecret) throw new Error("Missing ONRAMP_API_KEY or ONRAMP_API_SECRET");
    const payload = {
      fromCurrency: "INR",
      toCurrency: "USDT",
      fromAmount: 10000,
      chain: "TRON",
      paymentMethodType: "UPI",
    };
    const payloadStr = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadStr).toString("base64");
    const signature = signPayload(apiSecret, payloadBase64);

    const res = await fetch(ONRAMP_QUOTE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ONRAMP-APIKEY": apiKey,
        "X-ONRAMP-SIGNATURE": signature,
        "X-ONRAMP-PAYLOAD": payloadBase64,
      },
      body: payloadStr,
    });
    if (!res.ok) throw new Error(`Onramp.money ${res.status}`);
    const data = await res.json();
    const rate = parseFloat(data?.rate ?? data?.data?.rate ?? 0);
    const toAmount = parseFloat(data?.toAmount ?? data?.data?.toAmount ?? 0);
    const fromAmount = parseFloat(data?.fromAmount ?? data?.data?.fromAmount ?? 10000);
    const onrampFee = parseFloat(data?.onrampFee ?? data?.data?.onrampFee ?? 0);
    const gasFee = parseFloat(data?.gasFee ?? data?.data?.gasFee ?? 0);
    const clientFee = parseFloat(data?.clientFee ?? data?.data?.clientFee ?? 0);
    if (rate <= 0 && toAmount <= 0) throw new Error("Invalid Onramp quote");
    const buyRateInrPerUsdt = rate > 0 ? rate : fromAmount / toAmount;
    const totalFee = onrampFee + gasFee + clientFee;
    const feePct = fromAmount > 0 ? (totalFee / fromAmount) * 100 : 1.3;
    return {
      providerId: "onramp-money",
      buyRateInrPerUsdt: Number(buyRateInrPerUsdt.toFixed(4)),
      platformFeePct: Number((feePct * 0.6).toFixed(2)),
      paymentFeePct: Number((feePct * 0.2).toFixed(2)),
      spreadPct: Number((feePct * 0.2).toFixed(2)),
      timestamp: new Date().toISOString(),
      source: "live",
      isLive: true,
    };
  } catch (e) {
    return {
      providerId: "onramp-money",
      buyRateInrPerUsdt: 88.35,
      platformFeePct: 0.6,
      paymentFeePct: 0.2,
      spreadPct: 0.5,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
