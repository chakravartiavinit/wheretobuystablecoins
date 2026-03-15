import providers from '@/data/providers-inr.json';
import { rankProviders, SORT_OPTIONS } from '@/lib/ranking';
import { fetchAllQuotes } from '@/lib/quotes';
import { DEFAULT_FIAT, getFiatConfig } from '@/lib/fiats';

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return null;
};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const liveQuotesCache = new Map(); // key: fiat, value: { quotes, health, cachedAt }

async function getLiveQuotes(fiat) {
  const key = fiat || DEFAULT_FIAT;
  const cached = liveQuotesCache.get(key);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { quotes: cached.quotes, health: cached.health };
  }
  const live = await fetchAllQuotes(key);
  liveQuotesCache.set(key, {
    quotes: live.quotes,
    health: live.health,
    cachedAt: Date.now(),
  });
  return { quotes: live.quotes, health: live.health };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const fiat = searchParams.get('fiat') || DEFAULT_FIAT;
  const paymentMethod = searchParams.get('paymentMethod');
  const kycRequired = parseBoolean(searchParams.get('kycRequired'));
  const stablecoin = searchParams.get('stablecoin');
  const amountInr = Number(searchParams.get('amountInr'));
  const sortBy = searchParams.get('sortBy') || SORT_OPTIONS.BEST_OVERALL;
  const liveQuotes = searchParams.get('live') === 'true';

  // V0: only INR is supported; normalize to supported fiat
  const fiatConfig = getFiatConfig(fiat);
  const resolvedFiat = fiatConfig?.code ?? DEFAULT_FIAT;

  let dataset = providers;
  let health = [];

  if (liveQuotes) {
    const { quotes, health: adapterHealth } = await getLiveQuotes(resolvedFiat);
    health = adapterHealth;
    const quoteMap = new Map(quotes.map((q) => [q.providerId, q]));

    dataset = providers.map((provider) => {
      const quote = quoteMap.get(provider.id);
      if (!quote) return { ...provider, source: "seed" };
      return {
        ...provider,
        buyRateInrPerUsdt: quote.buyRateInrPerUsdt,
        platformFeePct: quote.platformFeePct,
        paymentFeePct: quote.paymentFeePct,
        spreadPct: quote.spreadPct,
        effectivePrice: quote.effectivePrice,
        isLive: quote.isLive ?? provider.isLive,
        quoteTimestamp: quote.timestamp,
        source: quote.source ?? (quote.timestamp ? "live" : "seed"),
      };
    });
  }

  let filtered = dataset.filter((provider) => provider.fiat === resolvedFiat);

  if (paymentMethod && paymentMethod !== 'ALL') {
    filtered = filtered.filter((provider) =>
      provider.paymentMethods.some((method) => method.toLowerCase() === paymentMethod.toLowerCase())
    );
  }

  if (kycRequired !== null) {
    filtered = filtered.filter((provider) => provider.kycRequired === kycRequired);
  }

  if (stablecoin && stablecoin !== 'ALL') {
    filtered = filtered.filter((provider) => provider.stablecoins.includes(stablecoin));
  }

  if (!Number.isNaN(amountInr) && amountInr > 0) {
    filtered = filtered.filter(
      (provider) => amountInr >= provider.limitsInr.min && amountInr <= provider.limitsInr.max
    );
  }

  const ranked = rankProviders(filtered, sortBy, Number.isNaN(amountInr) ? null : amountInr);

  return Response.json({
    success: true,
    data: ranked,
    meta: {
      fiat: resolvedFiat,
      count: ranked.length,
      sortBy,
      updatedAt: new Date().toISOString(),
      weighting: {
        effectivePrice: 45,
        speed: 20,
        trustReviews: 20,
        liquidityAndLimits: 10,
        uxSupport: 5,
      },
      liveQuotes,
      adapterHealth: health,
    },
  });
}
