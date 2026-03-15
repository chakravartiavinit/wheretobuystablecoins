const RAMP_ASSETS_URL = "https://api.rampnetwork.com/api/host-api/v2/assets";

export async function fetchRampQuote() {
  const apiKey = process.env.RAMP_HOST_API_KEY;
  try {
    const url = new URL(RAMP_ASSETS_URL);
    if (apiKey) url.searchParams.set("hostApiKey", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Ramp ${res.status}`);
    const data = await res.json();
    const assets = data?.assets ?? data ?? [];
    const usdt = Array.isArray(assets)
      ? assets.find(
          (a) =>
            (a.symbol ?? a.code ?? "").toUpperCase() === "USDT" ||
            (a.name ?? "").toLowerCase().includes("usdt")
        )
      : null;
    const priceInr = usdt?.price?.["INR"] ?? usdt?.price?.inr ?? usdt?.price?.INR;
    if (priceInr == null || Number(priceInr) <= 0) throw new Error("No INR price");
    const buyRateInrPerUsdt = Number(parseFloat(priceInr).toFixed(4));
    return {
      providerId: "ramp-network",
      buyRateInrPerUsdt,
      platformFeePct: 0.9,
      paymentFeePct: 0.2,
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "live",
      isLive: true,
    };
  } catch (e) {
    return {
      providerId: "ramp-network",
      buyRateInrPerUsdt: 88.4,
      platformFeePct: 0.9,
      paymentFeePct: 0.2,
      spreadPct: 0.4,
      timestamp: new Date().toISOString(),
      source: "seed-fallback",
      isLive: false,
    };
  }
}
