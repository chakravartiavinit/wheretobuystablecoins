import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import AnimatedBackground from '../components/AnimatedBackground';
import { mockWaitlistSubmit } from '../mock/waitlistMock';

const WaitlistPage = () => {
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
      const result = await mockWaitlistSubmit(email);
      
      if (result.success) {
        toast.success('🎉 Successfully joined the waitlist!');
        setEmail('');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="waitlist-container">
      <AnimatedBackground />
      
      <div className="waitlist-content">
        <div className="status-badge">
          <span className="status-badge-text">Under Progress</span>
        </div>
        
        <h1 className="waitlist-title">Coming Soon</h1>
        
        <p className="waitlist-description">
          Find the cheapest, fastest way to buy USDT & USDC with your local currency.
        </p>

        <form onSubmit={handleSubmit} className="waitlist-form">
          <div className="form-group">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="waitlist-input"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="waitlist-button"
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </div>
        </form>

        <div className="waitlist-features">
          <div className="feature-item">
            <div className="feature-icon">💰</div>
            <p className="feature-text">Compare Rates</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <p className="feature-text">Fastest Routes</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🌍</div>
            <p className="feature-text">Local Currency</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
