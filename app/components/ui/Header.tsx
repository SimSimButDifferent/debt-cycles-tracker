'use client';

import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-border bg-card py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <ChartBarIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Debt Cycles Dashboard</h1>
            <p className="text-xs text-muted-foreground">Based on Ray Dalio's Principles</p>
          </div>
        </Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                href="/" 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/about" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <a 
                href="https://www.principles.com/big-debt-crises/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Ray Dalio's Book
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 