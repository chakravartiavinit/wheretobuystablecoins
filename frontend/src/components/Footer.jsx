import React from 'react';
import { Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-social">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
          </div>
          
          <div className="footer-links">
            <a href="#about" className="footer-link">About</a>
            <a href="#features" className="footer-link">Features</a>
            <a href="#contact" className="footer-link">Contact</a>
          </div>
        </div>
        
        <div className="footer-divider"></div>
        
        <div className="footer-bottom">
          <p className="footer-text">
            © 2025 Where To Buy Stablecoins. All rights reserved.
          </p>
        </div>
      </div>
      
      <div className="footer-watermark">
        WHERE TO BUY STABLECOINS
      </div>
    </footer>
  );
};

export default Footer;