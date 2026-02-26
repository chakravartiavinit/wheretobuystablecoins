"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const SORT_OPTIONS = [
  { value: "best_overall", label: "Best overall" },
  { value: "lowest_total_cost", label: "Lowest total cost" },
  { value: "fastest", label: "Fastest" },
  { value: "no_kyc_first", label: "No KYC first" },
];

const PAYMENT_OPTIONS = ["ALL", "UPI", "IMPS", "Bank Transfer", "Card"];
const STABLECOIN_OPTIONS = ["ALL", "USDT", "USDC"];

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("best_overall");
  const [paymentMethod, setPaymentMethod] = useState("ALL");
  const [stablecoin, setStablecoin] = useState("ALL");
  const [kycRequired, setKycRequired] = useState("ALL");
  const [amountInr, setAmountInr] = useState("");
  const [rankDeltaMap, setRankDeltaMap] = useState({});

  const cardRefs = useRef(new Map());
  const prevPositions = useRef(new Map());
  const prevRankMap = useRef(new Map());

  const setCardRef = (id) => (el) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  };

  const fetchProviders = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      try {
        const params = new URLSearchParams({ fiat: "INR", sortBy });

        if (paymentMethod !== "ALL") params.set("paymentMethod", paymentMethod);
        if (stablecoin !== "ALL") params.set("stablecoin", stablecoin);
        if (kycRequired !== "ALL") params.set("kycRequired", kycRequired);
        if (amountInr) params.set("amountInr", amountInr);

        params.set("live", "true");
        const response = await fetch(`/api/providers?${params.toString()}`);
        const json = await response.json();
        const nextProviders = json.data || [];

        const nextRankMap = new Map(nextProviders.map((provider, index) => [provider.id, index + 1]));
        const delta = {};
        nextRankMap.forEach((nextRank, id) => {
          const prevRank = prevRankMap.current.get(id);
          if (typeof prevRank === "number") {
            delta[id] = prevRank - nextRank;
          } else {
            delta[id] = 0;
          }
        });

        prevRankMap.current = nextRankMap;
        setRankDeltaMap(delta);
        setProviders(nextProviders);
      } catch {
        if (!silent) setProviders([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [sortBy, paymentMethod, stablecoin, kycRequired, amountInr]
  );

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchProviders({ silent: true });
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchProviders]);

  useLayoutEffect(() => {
    const newPositions = new Map();
    cardRefs.current.forEach((el, id) => {
      newPositions.set(id, el.getBoundingClientRect());
    });

    cardRefs.current.forEach((el, id) => {
      const prev = prevPositions.current.get(id);
      const next = newPositions.get(id);
      if (!prev || !next) return;

      const deltaY = prev.top - next.top;
      if (Math.abs(deltaY) < 1) return;

      el.style.transition = "none";
      el.style.transform = `translateY(${deltaY}px)`;
      el.style.zIndex = "2";

      requestAnimationFrame(() => {
        el.style.transition = "transform 550ms cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "translateY(0)";
      });

      const cleanup = () => {
        el.style.zIndex = "";
        el.removeEventListener("transitionend", cleanup);
      };
      el.addEventListener("transitionend", cleanup);
    });

    prevPositions.current = newPositions;
  }, [providers]);

  const estimatedBestPrice = useMemo(() => {
    if (!providers.length) return "--";
    return `₹${providers[0].effectivePrice.toFixed(2)}`;
  }, [providers]);

  return (
    <main className="comparison-container" role="main">
      <AnimatedBackground />

      <section className="comparison-content">
        <div className="launching-soon">
          <span className="launching-soon-line" />
          <span className="launching-soon-text">India v1 live</span>
          <span className="launching-soon-line" />
        </div>

        <h1 className="waitlist-title">WHERE TO BUY STABLECOINS?</h1>
        <p className="waitlist-description">
          Compare INR providers by effective price, KYC, payment rails, speed, and social trust.
        </p>

        <div className="snapshot-grid">
          <div className="snapshot-card">
            <div className="snapshot-label">Fiat</div>
            <div className="snapshot-value">INR</div>
          </div>
          <div className="snapshot-card">
            <div className="snapshot-label">Providers shown</div>
            <div className="snapshot-value">{loading ? "..." : providers.length}</div>
          </div>
          <div className="snapshot-card">
            <div className="snapshot-label">Best effective price</div>
            <div className="snapshot-value">{loading ? "..." : estimatedBestPrice}</div>
          </div>
        </div>

        <div className="filters-card">
          <div className="filters-grid">
            <label className="filter-field">
              <span>Sort by</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span>Payment method</span>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span>Stablecoin</span>
              <select value={stablecoin} onChange={(e) => setStablecoin(e.target.value)}>
                {STABLECOIN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span>KYC</span>
              <select value={kycRequired} onChange={(e) => setKycRequired(e.target.value)}>
                <option value="ALL">All</option>
                <option value="true">KYC required</option>
                <option value="false">No KYC</option>
              </select>
            </label>

            <label className="filter-field">
              <span>Amount (INR)</span>
              <div className="amount-row">
                <input
                  type="number"
                  value={amountInr}
                  onChange={(e) => setAmountInr(e.target.value)}
                  placeholder="e.g. 10000"
                />
                <button className="mini-btn" onClick={() => fetchProviders()}>
                  Apply
                </button>
              </div>
            </label>
          </div>
        </div>

        <div className="providers-list">
          {loading && <p className="empty-state">Loading providers...</p>}
          {!loading && providers.length === 0 && (
            <p className="empty-state">No providers match your filters right now.</p>
          )}

          {!loading &&
            providers.map((provider, index) => (
              <article key={provider.id} className="provider-card" ref={setCardRef(provider.id)}>
                <div className="provider-head">
                  <div>
                    <div className="rank-row">
                      <p className="rank-chip">#{index + 1}</p>
                      {rankDeltaMap[provider.id] > 0 && (
                        <span className="rank-delta up">↑{rankDeltaMap[provider.id]}</span>
                      )}
                      {rankDeltaMap[provider.id] < 0 && (
                        <span className="rank-delta down">↓{Math.abs(rankDeltaMap[provider.id])}</span>
                      )}
                    </div>
                    <div className="provider-title-row">
                      <h3>{provider.name}</h3>
                      <span className={`status-pill ${provider.isLive ? "live" : "offline"}`}>
                        {provider.isLive ? "Live" : "Offline"}
                      </span>
                    </div>
                    <p className="provider-notes">{provider.notes}</p>
                    <a className="provider-link" href={`/provider/${provider.id}`}>View details</a>
                  </div>
                  <div className="price-box">
                    <span>Effective</span>
                    <strong>₹{provider.effectivePrice.toFixed(2)}</strong>
                    <small>/ USDT</small>
                  </div>
                </div>

                <div className="provider-metrics">
                  <p><span>Payment</span>{provider.paymentMethods.join(", ")}</p>
                  <p><span>KYC</span>{provider.kycLevel}</p>
                  <p><span>Speed</span>{provider.settlementMins[0]}-{provider.settlementMins[1]} mins</p>
                  <p><span>Limits</span>₹{provider.limitsInr.min.toLocaleString()} - ₹{provider.limitsInr.max.toLocaleString()}</p>
                  <p><span>Reviews</span>{provider.review.rating}/5 ({provider.review.sampleSize} mentions)</p>
                  <p><span>Score</span>{provider.score.totalScore}</p>
                  <p><span>Why this rank</span>Price {provider.score.priceScore} • Speed {provider.score.speedScore} • Trust {provider.score.trustScore}</p>
                </div>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}
