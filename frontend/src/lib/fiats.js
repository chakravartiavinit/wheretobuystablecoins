/**
 * Fiat currency config registry. V0 supports India (INR) only; structure is ready for multi-fiat.
 */
export const FIAT_CONFIGS = {
  INR: {
    code: "INR",
    symbol: "₹",
    country: "India",
    flag: "🇮🇳",
    label: "India (INR)",
    limitsKey: "limitsInr",
  },
  // Future: USD, EUR, GBP, BRL, NGN, ...
};

export const DEFAULT_FIAT = "INR";

export function getFiatConfig(fiatCode) {
  return FIAT_CONFIGS[fiatCode] ?? FIAT_CONFIGS[DEFAULT_FIAT];
}

export function getSupportedFiats() {
  return Object.keys(FIAT_CONFIGS);
}
