const SEED = {
  buyRateInrPerUsdt: 88.15,
  platformFeePct: 0.7,
  paymentFeePct: 0.25,
  spreadPct: 0.55,
};

function addNoise(value, pct = 0.003) {
  const spread = value * pct;
  return value + (Math.random() * 2 - 1) * spread;
}

export async function fetchOnmetaQuote() {
  return {
    providerId: "onmeta",
    buyRateInrPerUsdt: Number(addNoise(SEED.buyRateInrPerUsdt).toFixed(4)),
    platformFeePct: SEED.platformFeePct,
    paymentFeePct: SEED.paymentFeePct,
    spreadPct: SEED.spreadPct,
    timestamp: new Date().toISOString(),
    source: "seed-adapter",
    isLive: false,
  };
}
