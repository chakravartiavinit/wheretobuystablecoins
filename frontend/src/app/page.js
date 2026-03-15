"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import BetaGate from "@/components/BetaGate";

const SORT_OPTIONS = [
  { value: "best_overall", label: "Best overall" },
  { value: "lowest_total_cost", label: "Lowest total cost" },
  { value: "fastest", label: "Fastest" },
  { value: "no_kyc_first", label: "No KYC first" },
];

const PAYMENT_OPTIONS = ["ALL", "UPI", "IMPS", "Bank Transfer", "Card"];
const STABLECOIN_OPTIONS = ["ALL", "USDT", "USDC"];

const PROVIDER_LOGOS = {
  "Onramp.money": "https://www.google.com/s2/favicons?domain=onramp.money&sz=64",
  Onmeta: "https://www.google.com/s2/favicons?domain=onmeta.in&sz=64",
  "Binance P2P": "https://www.google.com/s2/favicons?domain=binance.com&sz=64",
  "DollarPe (Binance P2P Merchant)": "https://www.google.com/s2/favicons?domain=dollarpe.io&sz=64",
  Transak: "https://www.google.com/s2/favicons?domain=transak.com&sz=64",
  MoonPay: "https://www.google.com/s2/favicons?domain=moonpay.com&sz=64",
  "Ramp Network": "https://www.google.com/s2/favicons?domain=ramp.network&sz=64",
  Banxa: "https://www.google.com/s2/favicons?domain=banxa.com&sz=64",
  Mercuryo: "https://www.google.com/s2/favicons?domain=mercuryo.io&sz=64",
  Guardarian: "https://www.google.com/s2/favicons?domain=guardarian.com&sz=64",
  AlchemyPay: "https://www.google.com/s2/favicons?domain=alchemypay.org&sz=64",
  "Coinbase Onramp": "https://www.google.com/s2/favicons?domain=coinbase.com&sz=64",
  TransFi: "https://www.google.com/s2/favicons?domain=transfi.com&sz=64",
  Topper: "https://www.google.com/s2/favicons?domain=topperpay.com&sz=64",
};

const AMOUNT_PRESETS = [
  { value: 1000, label: "₹1K" },
  { value: 5000, label: "₹5K" },
  { value: 10000, label: "₹10K" },
  { value: 50000, label: "₹50K" },
  { value: 100000, label: "₹1L" },
];

const getMedianPrice = (rows) => {
  if (!rows?.length) return null;
  const sorted = rows.map((p) => p.effectivePrice).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2))
    : Number(sorted[mid].toFixed(2));
};

const buildPath = (points, width, height, min, max) => {
  if (!points.length) return "";
  const span = Math.max(max - min, 0.0001);
  return points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * width;
      const y = height - ((p.value - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

const classifyType = (provider) => {
  if (provider.name.toLowerCase().includes("p2p") || provider.name.toLowerCase().includes("merchant")) return "P2P";
  if (provider.name.toLowerCase().includes("ramp") || provider.name.toLowerCase().includes("moonpay") || provider.name.toLowerCase().includes("transak")) return "DEX";
  return "CEX";
};

const getChain = (provider) => {
  if (provider.stablecoins.includes("USDC")) return "Ethereum";
  return "--";
};

const formatSigned = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(4)}`;

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medianHistory, setMedianHistory] = useState([]);

  const [sortBy, setSortBy] = useState("best_overall");
  const [paymentMethod, setPaymentMethod] = useState("ALL");
  const [stablecoin, setStablecoin] = useState("ALL");
  const [kycRequired, setKycRequired] = useState("ALL");
  const [amountInr, setAmountInr] = useState("");
  const [rankDeltaMap, setRankDeltaMap] = useState({});
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [refreshCountdown, setRefreshCountdown] = useState(10);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  const cardRefs = useRef(new Map());
  const prevPositions = useRef(new Map());
  const prevRankMap = useRef(new Map());
  const rankDeltaTimeoutRef = useRef(null);

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
        setLastUpdatedAt(Date.now());

        const median = getMedianPrice(nextProviders);
        if (median !== null) {
          setMedianHistory((prev) => {
            const next = [...prev, { ts: Date.now(), value: median }];
            return next.slice(-40);
          });
        }
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

  useEffect(() => {
    if (lastUpdatedAt == null) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - lastUpdatedAt) / 1000);
      setSecondsAgo(elapsed);
      setRefreshCountdown(Math.max(0, 10 - (elapsed % 10)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdatedAt]);

  useEffect(() => {
    const hasDeltas = Object.keys(rankDeltaMap).some((id) => rankDeltaMap[id] !== 0);
    if (!hasDeltas) return;
    if (rankDeltaTimeoutRef.current) clearTimeout(rankDeltaTimeoutRef.current);
    rankDeltaTimeoutRef.current = setTimeout(() => setRankDeltaMap({}), 4000);
    return () => {
      if (rankDeltaTimeoutRef.current) clearTimeout(rankDeltaTimeoutRef.current);
    };
  }, [rankDeltaMap]);

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
      el.style.zIndex = "10";

      if (deltaY > 10) el.classList.add("flash-up");
      else if (deltaY < -10) el.classList.add("flash-down");

      requestAnimationFrame(() => {
        el.style.transition = "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "translateY(0)";
      });

      const cleanup = () => {
        el.style.zIndex = "";
        el.classList.remove("flash-up", "flash-down");
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

  const medianNow = useMemo(() => getMedianPrice(providers), [providers]);

  const liveCount = useMemo(
    () => providers.filter((p) => p.source === "live").length,
    [providers]
  );
  const totalCount = providers.length;
  const savingsPer10k = useMemo(() => {
    if (providers.length < 2) return null;
    const best = providers[0].effectivePrice;
    const worst = Math.max(...providers.map((p) => p.effectivePrice));
    const perUnit = worst - best;
    return Number((perUnit * 10000).toFixed(2));
  }, [providers]);

  const chartData = useMemo(() => {
    const width = 100;
    const height = 36;
    if (!medianHistory.length) {
      return { path: "", min: 0, max: 0, width, height };
    }
    const values = medianHistory.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const path = buildPath(medianHistory, width, height, min, max);
    return { path, min, max, width, height };
  }, [medianHistory]);

  return (
    <BetaGate>
      <main className="comparison-container minimal" role="main">
        <AnimatedBackground />
      <section className="comparison-content">
        <div className="launching-soon">
          <span className="launching-soon-line" />
          <span className="launching-soon-text">We are Live</span>
          <span className="launching-soon-line" />
        </div>

        <h1 className="waitlist-title centered-title">WHERE TO BUY STABLECOINS?</h1>
        <p className="waitlist-description centered-desc">
          Find the cheapest, fastest way to buy stablecoins with INR
        </p>

        <div className="stats-ribbon">
          <span className="stats-ribbon-item stats-best">
            Best {estimatedBestPrice}
          </span>
          <span className="stats-ribbon-item">
            Median {medianNow != null ? `₹${medianNow.toFixed(2)}` : "—"}
          </span>
          <span className="stats-ribbon-item stats-live">
            <span className="status-dot live" aria-hidden />
            {liveCount}/{totalCount || "—"} Live
          </span>
          <span className="stats-ribbon-item">
            Updated {lastUpdatedAt != null ? `${secondsAgo}s ago` : "—"}
          </span>
        </div>
        {savingsPer10k != null && savingsPer10k > 0 && (
          <p className="savings-ribbon">
            Switch to best rate → save ₹{savingsPer10k.toFixed(2)} per 10,000 USDT
          </p>
        )}

        <div className="pill-filters">
          <div className="pill-row">
            <span className="pill-label">Sort</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`pill-btn ${sortBy === opt.value ? "active" : ""}`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="pill-row">
            <span className="pill-label">Payment</span>
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`pill-btn ${paymentMethod === opt ? "active" : ""}`}
                onClick={() => setPaymentMethod(opt)}
              >
                {opt === "ALL" ? "All" : opt}
              </button>
            ))}
          </div>
          <div className="pill-row">
            <span className="pill-label">Amount</span>
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`pill-btn ${Number(amountInr) === preset.value ? "active" : ""}`}
                onClick={() => setAmountInr(String(preset.value))}
              >
                {preset.label}
              </button>
            ))}
            <input
              type="number"
              placeholder="Custom"
              className="pill-input"
              value={amountInr}
              onChange={(e) => setAmountInr(e.target.value)}
              min={500}
              max={1000000}
            />
          </div>
        </div>

        <div className="refresh-progress-wrap">
          <div
            className="refresh-progress-bar"
            style={{ width: `${((10 - refreshCountdown) / 10) * 100}%` }}
          />
        </div>

        <div className="providers-list terminal-list">
          <div className="providers-head-row sticky-head terminal-head-row">
            <span>#</span>
            <span>Source</span>
            <span>Type</span>
            <span>Price</span>
            <span>Vs Median</span>
            <span>KYC</span>
            <span>Methods</span>
            <span>Rating</span>
            <span></span>
          </div>

          {loading && <p className="empty-state">Loading providers...</p>}
          {!loading && providers.length === 0 && (
            <p className="empty-state">No providers match your filters right now.</p>
          )}

          {!loading &&
            providers.map((provider, index) => {
              const rank = index + 1;
              const median = medianNow || provider.effectivePrice;
              const diff = provider.effectivePrice - median;
              const diffPct = median ? (diff / median) * 100 : 0;
              const delta = rankDeltaMap[provider.id];
              const isExpanded = expandedId === provider.id;
              const sourceLabel = provider.source === "live" ? "LIVE" : "SEED";
              const feeBreakdown = [
                `Buy rate: ₹${(provider.buyRateInrPerUsdt ?? 0).toFixed(2)}/USDT`,
                `Platform: ${(provider.platformFeePct ?? 0).toFixed(2)}%`,
                `Payment: ${(provider.paymentFeePct ?? 0).toFixed(2)}%`,
                `Spread: ${(provider.spreadPct ?? 0).toFixed(2)}%`,
              ].join(" · ");
              return (
                <article
                  key={provider.id}
                  className={`provider-card provider-row terminal-row ${isExpanded ? "expanded" : ""}`}
                  ref={setCardRef(provider.id)}
                  onClick={() => setExpandedId(isExpanded ? null : provider.id)}
                >
                  <div className="provider-col rank-col">
                    <span className={`rank-num ${rank === 1 ? "rank-one" : ""}`}>#{rank}</span>
                    {delta !== undefined && delta !== 0 && (
                      <span className={`rank-delta ${delta > 0 ? "up" : "down"}`}>
                        {delta > 0 ? "▲" : "▼"}
                        {Math.abs(delta)}
                      </span>
                    )}
                  </div>
                  <div className="provider-col provider-main terminal-source">
                    <img
                      className="provider-logo-img"
                      src={PROVIDER_LOGOS[provider.name] || "https://www.google.com/s2/favicons?domain=crypto.com&sz=64"}
                      alt=""
                      loading="lazy"
                    />
                    <div>
                      <h3>
                        {provider.name}
                        {rank === 1 && <span className="best-deal-badge">BEST DEAL</span>}
                        <span className={`source-badge ${provider.source === "live" ? "live" : "seed"}`}>{sourceLabel}</span>
                      </h3>
                    </div>
                  </div>
                  <div className="provider-col">
                    <span className={`type-pill ${classifyType(provider).toLowerCase()}`}>{classifyType(provider)}</span>
                  </div>
                  <div className="provider-col price-col" title={feeBreakdown}>
                    <strong>₹{provider.effectivePrice.toFixed(4)}</strong>
                    <span className="price-fee-tooltip" title={feeBreakdown}>i</span>
                  </div>
                  <div className={`provider-col ${diff <= 0 ? "pos" : "neg"}`}>
                    {formatSigned(diff)} ({formatSigned(diffPct)}%)
                  </div>
                  <div className="provider-col">
                    <span className="kyc-pill">{provider.kycRequired ? "KYC" : "No KYC"}</span>
                  </div>
                  <div className="provider-col payment-chips">
                    {(provider.paymentMethods || []).slice(0, 3).map((m) => (
                      <span key={m} className="payment-chip">{m}</span>
                    ))}
                  </div>
                  <div className="provider-col rating-col">
                    ★ {(provider.review?.rating ?? 0).toFixed(1)}
                  </div>
                  <div className="provider-col action-col">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(provider.name + " buy crypto")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="buy-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Buy →
                    </a>
                  </div>
                  {isExpanded && (
                    <div className="provider-row-drawer" onClick={(e) => e.stopPropagation()}>
                      <p><strong>Fee breakdown</strong>: {feeBreakdown}</p>
                      <p>Limits: ₹{(provider.limitsInr?.min ?? 0).toLocaleString()} – ₹{(provider.limitsInr?.max ?? 0).toLocaleString()}</p>
                      <p>KYC: {provider.kycLevel ?? (provider.kycRequired ? "Required" : "Not required")}</p>
                      <p>Review: ★ {(provider.review?.rating ?? 0).toFixed(1)} ({(provider.review?.sampleSize ?? 0)} reviews)</p>
                      <p className="route-col">{provider.notes}</p>
                    </div>
                  )}
                </article>
              );
            })}
        </div>
      </section>
    </main>
    </BetaGate>
  );
}
