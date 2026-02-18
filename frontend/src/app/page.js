"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('🎉 Successfully joined the waitlist!');
        setEmail('');
      } else {
        toast.error(result.error || 'Failed to join the waitlist');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="waitlist-container" role="main">
      <AnimatedBackground />

      <section className="waitlist-content" aria-labelledby="waitlist-heading">
        <div className="launching-soon">
          <span className="launching-soon-line" />
          <span className="launching-soon-text">Launching Soon</span>
          <span className="launching-soon-line" />
        </div>

        <h1 id="waitlist-heading" className="waitlist-title">
          WHERE TO BUY STABLECOIN?
        </h1>

        <p className="waitlist-description">
          Find the cheapest, fastest way to buy stablecoins with your local currency.
        </p>

        <form onSubmit={handleSubmit} className="waitlist-form" aria-label="Join the waitlist">
          <div className="form-group">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="waitlist-input !w-auto" /* Force auto width so flex: 1 takes over */
              disabled={isLoading}
              aria-label="Email address"
              autoComplete="email"
            />
            <Button
              type="submit"
              className="waitlist-button"
              disabled={isLoading}
              aria-label="Join waitlist"
            >
              {isLoading ? 'Adding to Waitlist' : 'Get Notified'}
            </Button>
          </div>
          <p className="form-hint">No spam. One email when we launch.</p>
        </form>

        <div className="waitlist-features" role="list" aria-label="Key features">
          <div className="feature-item" role="listitem">
            <div className="feature-icon" aria-hidden="true">💰</div>
            <p className="feature-text">Compare Rates</p>
          </div>
          <div className="feature-item" role="listitem">
            <div className="feature-icon" aria-hidden="true">⚡</div>
            <p className="feature-text">Fastest Routes</p>
          </div>
          <div className="feature-item" role="listitem">
            <div className="feature-icon" aria-hidden="true">🌍</div>
            <p className="feature-text">Local Currency</p>
          </div>
        </div>
      </section>
      <Toaster position="top-center" />
    </main>
  );
}

