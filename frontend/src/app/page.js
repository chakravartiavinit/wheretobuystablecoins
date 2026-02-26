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
};

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

  const medianNow = useMemo(() => getMedianPrice(providers), [providers]);

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
          Find the cheapest, fastest way to buy stablecoins with your local currency
        </p>

        <div className="providers-list terminal-list">
          <div className="timeline-strip">
            {["22:00", "23:30", "01:01", "02:30", "04:01", "05:30", "07:00", "08:30", "10:01", "11:30", "12:00"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>

          <div className="providers-head-row sticky-head terminal-head-row">
            <span>Source</span>
            <span>Type</span>
            <span>Chain</span>
            <span>Quote</span>
            <span>Price</span>
            <span>Vs Median</span>
            <span>Impact</span>
            <span>Route</span>
            <span></span>
          </div>

          {loading && <p className="empty-state">Loading providers...</p>}
          {!loading && providers.length === 0 && (
            <p className="empty-state">No providers match your filters right now.</p>
          )}

          {!loading &&
            providers.map((provider, index) => {
              const median = medianNow || provider.effectivePrice;
              const diff = provider.effectivePrice - median;
              const diffPct = median ? (diff / median) * 100 : 0;
              const impact = diff * 1000;
              return (
                <article key={provider.id} className="provider-card provider-row terminal-row" ref={setCardRef(provider.id)}>
                  <div className="provider-col provider-main terminal-source">
                    <img
                      className="provider-logo-img"
                      src={PROVIDER_LOGOS[provider.name] || "https://www.google.com/s2/favicons?domain=crypto.com&sz=64"}
                      alt={`${provider.name} logo`}
                      loading="lazy"
                    />
                    <div>
                      <h3>{provider.name}</h3>
                    </div>
                  </div>

                  <div className="provider-col"><span className={`type-pill ${classifyType(provider).toLowerCase()}`}>{classifyType(provider)}</span></div>
                  <div className="provider-col chain-col">{getChain(provider)}</div>
                  <div className="provider-col quote-col">{provider.stablecoins[0] || "USDT"}</div>
                  <div className="provider-col price-col"><strong>₹{provider.effectivePrice.toFixed(4)}</strong></div>
                  <div className={`provider-col ${diff <= 0 ? "pos" : "neg"}`}>{formatSigned(diff)} ({formatSigned(diffPct)}%)</div>
                  <div className={`provider-col ${impact <= 0 ? "pos" : "neg"}`}>{formatSigned(impact)}</div>
                  <div className="provider-col route-col">{provider.notes}</div>
                  <div className="provider-col status-dot-wrap">
                    <span className={`status-dot ${provider.isLive ? "live" : "offline"}`}></span>
                  </div>
                </article>
              );
            })}
        </div>
      </section>
    </main>
  );
}
