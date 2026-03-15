import { fetchOnrampQuote } from "@/lib/adapters/onramp";
import { fetchOnmetaQuote } from "@/lib/adapters/onmeta";
import { fetchBinanceP2pQuote } from "@/lib/adapters/binanceP2p";
import { fetchDollarPeQuote } from "@/lib/adapters/dollarpe";
import { fetchTransakQuote } from "@/lib/adapters/transak";
import { fetchMoonPayQuote } from "@/lib/adapters/moonpay";
import { fetchMercuryoQuote } from "@/lib/adapters/mercuryo";
import { fetchRampQuote } from "@/lib/adapters/ramp";
import { fetchCoinbaseQuote } from "@/lib/adapters/coinbase";
import { fetchAlchemyPayQuote } from "@/lib/adapters/alchemypay";
import { fetchTransFiQuote } from "@/lib/adapters/transfi";
import { fetchBanxaQuote } from "@/lib/adapters/banxa";
import { fetchGuardarianQuote } from "@/lib/adapters/guardarian";
import { fetchTopperQuote } from "@/lib/adapters/topper";

function computeEffectivePrice(quote) {
  const extraPct = quote.platformFeePct + quote.paymentFeePct + quote.spreadPct;
  return Number((quote.buyRateInrPerUsdt * (1 + extraPct / 100)).toFixed(2));
}

const ADAPTERS = [
  { fn: fetchBinanceP2pQuote, id: "binance-p2p" },
  { fn: fetchDollarPeQuote, id: "dollarpe-binance-merchant" },
  { fn: fetchTransakQuote, id: "transak" },
  { fn: fetchMoonPayQuote, id: "moonpay" },
  { fn: fetchMercuryoQuote, id: "mercuryo" },
  { fn: fetchRampQuote, id: "ramp-network" },
  { fn: fetchCoinbaseQuote, id: "coinbase-onramp" },
  { fn: fetchAlchemyPayQuote, id: "alchemypay" },
  { fn: fetchOnrampQuote, id: "onramp-money" },
  { fn: fetchTransFiQuote, id: "transfi" },
  { fn: fetchBanxaQuote, id: "banxa" },
  { fn: fetchGuardarianQuote, id: "guardarian" },
  { fn: fetchOnmetaQuote, id: "onmeta" },
  { fn: fetchTopperQuote, id: "topper" },
];

export async function fetchAllQuotes(fiat) {
  const _fiat = fiat || "INR";
  const quoteResults = await Promise.allSettled(ADAPTERS.map((a) => a.fn()));

  const quotes = quoteResults
    .filter((r) => r.status === "fulfilled")
    .map((r) => ({ ...r.value, effectivePrice: computeEffectivePrice(r.value) }));

  const health = quoteResults.map((r, index) => ({
    adapter: ADAPTERS[index].id,
    ok: r.status === "fulfilled",
    error: r.status === "rejected" ? String(r.reason) : null,
  }));

  return {
    quotes,
    health,
  };
}
