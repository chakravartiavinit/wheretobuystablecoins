export const SORT_OPTIONS = {
  BEST_OVERALL: "best_overall",
  LOWEST_TOTAL_COST: "lowest_total_cost",
  FASTEST: "fastest",
  NO_KYC_FIRST: "no_kyc_first",
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function normalizePrice(providers) {
  const prices = providers.map((p) => p.effectivePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = Math.max(max - min, 0.0001);
  return (price) => (1 - (price - min) / span) * 100;
}

function normalizeSpeed(provider) {
  const avgMins = (provider.settlementMins[0] + provider.settlementMins[1]) / 2;
  return clamp(100 - avgMins * 3, 0, 100);
}

function reviewFreshnessMultiplier(updatedAt) {
  if (!updatedAt) return 0.9;
  const now = Date.now();
  const ts = new Date(updatedAt).getTime();
  const days = Math.max((now - ts) / (1000 * 60 * 60 * 24), 0);
  return clamp(1 - days * 0.01, 0.7, 1);
}

function normalizeReview(provider) {
  const base = clamp((provider.review?.rating || 0) * 20, 0, 100);
  const freshness = reviewFreshnessMultiplier(provider.review?.updatedAt);
  return clamp(base * freshness, 0, 100);
}

function normalizeLimitsFit(provider, amount) {
  if (!amount || Number.isNaN(amount)) return provider.liquidityScore || 0;
  const min = provider.limitsInr?.min ?? 0;
  const max = provider.limitsInr?.max ?? Number.MAX_SAFE_INTEGER;
  if (amount < min || amount > max) return 0;
  return provider.liquidityScore || 0;
}

function normalizeUx(provider) {
  const paymentCount = provider.paymentMethods?.length || 0;
  return clamp(55 + paymentCount * 12, 0, 100);
}

export function calculateProviderScore(provider, allProviders, amountInr) {
  const priceScore = normalizePrice(allProviders)(provider.effectivePrice);
  const speedScore = normalizeSpeed(provider);
  const trustScore = normalizeReview(provider);
  const limitsFit = normalizeLimitsFit(provider, amountInr);
  const uxScore = normalizeUx(provider);

  const weighted =
    priceScore * 0.45 +
    speedScore * 0.2 +
    trustScore * 0.2 +
    limitsFit * 0.1 +
    uxScore * 0.05;

  return {
    priceScore: Number(priceScore.toFixed(2)),
    speedScore: Number(speedScore.toFixed(2)),
    trustScore: Number(trustScore.toFixed(2)),
    limitsFit: Number(limitsFit.toFixed(2)),
    uxScore: Number(uxScore.toFixed(2)),
    totalScore: Number(weighted.toFixed(2)),
  };
}

export function rankProviders(providers, sortBy, amountInr) {
  const withScores = providers.map((provider) => ({
    ...provider,
    score: calculateProviderScore(provider, providers, amountInr),
  }));

  switch (sortBy) {
    case SORT_OPTIONS.LOWEST_TOTAL_COST:
      return withScores.sort((a, b) => a.effectivePrice - b.effectivePrice);
    case SORT_OPTIONS.FASTEST:
      return withScores.sort(
        (a, b) =>
          (a.settlementMins[0] + a.settlementMins[1]) / 2 -
          (b.settlementMins[0] + b.settlementMins[1]) / 2
      );
    case SORT_OPTIONS.NO_KYC_FIRST:
      return withScores.sort((a, b) => {
        if (a.kycRequired === b.kycRequired) return b.score.totalScore - a.score.totalScore;
        return Number(a.kycRequired) - Number(b.kycRequired);
      });
    case SORT_OPTIONS.BEST_OVERALL:
    default:
      return withScores.sort((a, b) => b.score.totalScore - a.score.totalScore);
  }
}
