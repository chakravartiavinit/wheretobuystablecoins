"use client";

import React, { useCallback, useEffect, useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const STORAGE_KEY = "beta_unlocked";

export default function BetaGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY);
      setUnlocked(stored === "true");
    } catch {
      setUnlocked(false);
    }
  }, [mounted]);

  const submit = useCallback(
    async (e) => {
      e?.preventDefault();
      setError("");
      if (!password.trim()) {
        setError("Enter the beta access password.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/beta-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: password.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          try {
            sessionStorage.setItem(STORAGE_KEY, "true");
          } catch {}
          setUnlocked(true);
          setPassword("");
        } else {
          setError(data.error || "Invalid password. Try again.");
        }
      } catch {
        setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [password]
  );

  if (!mounted) {
    return (
      <div className="beta-gate-wrap">
        <AnimatedBackground />
        <div className="beta-gate-card">
          <p className="beta-gate-loading">Loading…</p>
        </div>
      </div>
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="beta-gate-wrap">
      <AnimatedBackground />
      <div className="beta-gate-card">
        <div className="beta-gate-badge">Beta Access</div>
        <h1 className="beta-gate-title">Where to Buy Stablecoins?</h1>
        <p className="beta-gate-desc">
          This product is in beta. Enter the access password to continue.
        </p>
        <form onSubmit={submit} className="beta-gate-form">
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            className="beta-gate-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            disabled={loading}
            aria-label="Beta access password"
          />
          <button type="submit" className="beta-gate-btn" disabled={loading}>
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
        {error && <p className="beta-gate-error" role="alert">{error}</p>}
      </div>
    </div>
  );
}
