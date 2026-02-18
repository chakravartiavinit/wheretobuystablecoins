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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const domains = [
    'gmail.com', 'yahoo.com', 'icloud.com', 'outlook.com', 'hotmail.com',
    'proton.me', 'protonmail.com'
  ];

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (!value || value.includes('@') && value.split('@')[1].includes('.')) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (value.includes('@')) {
      const [prefix, domainPart] = value.split('@');
      const filteredDomains = domains
        .filter(d => d.startsWith(domainPart))
        .map(d => `${prefix}@${d}`);
      setSuggestions(filteredDomains);
      setShowSuggestions(filteredDomains.length > 0);
    } else if (value.length > 0) {
      const newSuggestions = domains.map(d => `${value}@${d}`);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setEmail(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowSuggestions(false);

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
          WHERE TO BUY STABLECOINS?
        </h1>

        <p className="waitlist-description">
          Find the cheapest, fastest way to buy stablecoins with your local currency
        </p>

        <form onSubmit={handleSubmit} className="waitlist-form" aria-label="Join the waitlist">
          <div className="form-group">
            <div className="input-wrapper relative flex-1 flex items-center">
              <Input
                type="text"
                placeholder="Your email address"
                value={email}
                onChange={handleEmailChange}
                className="waitlist-input !w-full"
                disabled={isLoading}
                aria-label="Email address"
                autoComplete="off"
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />

              {showSuggestions && (
                <ul className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="suggestion-item"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              type="submit"
              className="waitlist-button"
              disabled={isLoading}
              aria-label="Join waitlist"
            >
              {isLoading ? 'Adding to Waitlist' : 'Get Notified'}
            </Button>
          </div>
          <p className="form-hint">No spam. One email when we launch</p>
        </form>

        <div className={`banner ${showSuggestions ? 'opacity-0 pointer-events-none' : ''}`} role="list" aria-label="Key features">
          {/* Compare Rates */}
          <div className="feature money" role="listitem">
            <div className="emoji-wrap">
              <span className="emoji">💰</span>
            </div>
            <div className="label">Compare Rates</div>
          </div>

          {/* Fastest Routes */}
          <div className="feature bolt" role="listitem">
            <div className="emoji-wrap">
              <div className="lines"></div>
              <span className="emoji">⚡</span>
            </div>
            <div className="label">Instant Settlement</div>
          </div>

          {/* Local Currency */}
          <div className="feature globe" role="listitem">
            <div className="emoji-wrap">
              <span className="globe-center">🌍</span>
            </div>
            <div className="label">Local Currency</div>
          </div>
        </div>
      </section>
      <Toaster position="top-center" />
    </main>
  );
}

