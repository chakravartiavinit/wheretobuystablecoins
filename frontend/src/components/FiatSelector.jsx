"use client";

import React from "react";
import { getSupportedFiats, getFiatConfig } from "@/lib/fiats";

/**
 * Future multi-fiat country/currency selector. V0: only INR is supported (single option or hidden).
 * When more fiats are added to FIAT_CONFIGS, wire onChange to update URL or app state.
 */
export default function FiatSelector({ value, onChange, className = "" }) {
  const fiats = getSupportedFiats();
  if (fiats.length <= 1) return null; // V0: single fiat, no selector needed

  return (
    <div className={className}>
      <label htmlFor="fiat-select" className="fiat-selector-label">
        Region
      </label>
      <select
        id="fiat-select"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="fiat-selector-select"
        aria-label="Select region / currency"
      >
        {fiats.map((code) => {
          const config = getFiatConfig(code);
          return (
            <option key={code} value={code}>
              {config?.flag} {config?.label ?? code}
            </option>
          );
        })}
      </select>
    </div>
  );
}
