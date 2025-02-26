'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-lg font-semibold mb-2">Debt Cycles Dashboard</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Tracking key economic metrics from Ray Dalio's Principles for Navigating Big Debt Crises,
              for both deflationary and inflationary debt dynamics.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 text-center md:text-right">
            <div className="text-sm text-muted-foreground">
              Data sources: Federal Reserve, BEA, BLS, IMF
            </div>
            <div className="text-xs text-muted-foreground">
              © {currentYear} Debt Cycles Dashboard. Educational purposes only.
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border flex justify-center md:justify-between flex-wrap gap-4">
          <div className="flex gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <a 
              href="https://www.principles.com/big-debt-crises/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Ray Dalio's Book
            </a>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Not affiliated with Bridgewater Associates or Ray Dalio.
          </div>
        </div>
      </div>
    </footer>
  );
} 