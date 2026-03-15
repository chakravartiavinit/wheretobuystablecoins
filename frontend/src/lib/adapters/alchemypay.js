const ALCHEMYPAY_QUOTE_URL = "https://openapi.alchemypay.org/open/api/v4/merchant/order/quote";

function signHMAC(secret, payload) {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function fetchAlchemyPayQuote() {
  const appId = process.env.ALCHEMYPAY_APP_ID;
  const appSecret = process.env.ALCHEMYPAY_APP_SECRET;
  const amount = 10000;
  try {
    if (!appId || !appSecret) throw new Error("Missing ALCHEMYPAY_APP_ID or ALCHEMYPAY_APP_SECRET");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = {
      crypto: "USDT",
      network: "TRC20",
      fiat: "INR",
      amount: String(amount),
      payWayCode: "10001",
      side: "BUY",
    };
    const payload = JSON.stringify(body);
    const sign = signHMAC(appSecret, payload);

    const res = await fetch(ALCHEMYPAY_QUOTE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        appid: appId,
        timestamp,
        sign,
      },
      body: payload,
    });
    if (!res.ok) throw new Error(`AlchemyPay ${res.status}`);
    const data = await res.json();
    const rate = parseFloat(data?.data?.rate ?? data?.rate ?? 0);
    const rampFee = parseFloat(data?.data?.rampFee ?? data?.rampFee ?? 0);
    const networkFee = parseFloat(data?.data?.networkFee ?? data?.networkFee ?? 0);
    if (rate <= 0) throw new Error("Invalid AlchemyPay quote");
    const buyRateInrPerUsdt = rate;
    const totalFeePct = rampFee && amount ? (rampFee / amount) * 100 : 0.8;
    return {
      providerId: "alchemypay",
      buyRateInrPerUsdt: Number(buyRateInrPerUsdt.toFixed(4)),
      platformFeePct: Number((totalFeePct * 0.8).toFixed(2)),
      paymentFeePct: Number((totalFeePct * 0.2).toFixed(2)),
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "live",
      isLive: true,
    };
  } catch (e) {
    return {
      providerId: "alchemypay",
      buyRateInrPerUsdt: 88.2,
      platformFeePct: 0.8,
      paymentFeePct: 0.2,
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
