import { fetchOnrampQuote } from "@/lib/adapters/onramp";
import { fetchOnmetaQuote } from "@/lib/adapters/onmeta";
import { fetchBinanceP2pQuote } from "@/lib/adapters/binanceP2p";
import { fetchDollarPeQuote } from "@/lib/adapters/dollarpe";

function computeEffectivePrice(quote) {
  const extraPct = quote.platformFeePct + quote.paymentFeePct + quote.spreadPct;
  return Number((quote.buyRateInrPerUsdt * (1 + extraPct / 100)).toFixed(2));
}

export async function fetchAllQuotes() {
  const quoteResults = await Promise.allSettled([
    fetchOnrampQuote(),
    fetchOnmetaQuote(),
    fetchBinanceP2pQuote(),
    fetchDollarPeQuote(),
  ]);

  const quotes = quoteResults
    .filter((r) => r.status === "fulfilled")
    .map((r) => ({ ...r.value, effectivePrice: computeEffectivePrice(r.value) }));

  return {
    quotes,
    health: quoteResults.map((r, index) => ({
      adapter: ["onramp", "onmeta", "binance-p2p", "dollarpe"][index],
      ok: r.status === "fulfilled",
      error: r.status === "rejected" ? String(r.reason) : null,
    })),
  };
}
