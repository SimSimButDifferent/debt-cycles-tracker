'use client';

import React from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About This Dashboard</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Project Purpose</h2>
              <p className="mb-4">
                This dashboard is designed to track and visualize key economic metrics identified in Ray Dalio's book, 
                <em> Principles for Navigating Big Debt Crises</em>. The goal is to provide an educational tool 
                for understanding the different phases of debt cycles and their impact on various economic indicators.
              </p>
              <p>
                By tracking metrics for both deflationary and inflationary debt dynamics, this dashboard helps users
                identify patterns and relationships between different economic variables during various phases of
                debt cycles throughout U.S. economic history from 1900 onward.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Understanding Debt Cycles</h2>
              <p className="mb-4">
                According to Ray Dalio, debt cycles are a fundamental aspect of economic systems. They occur as a natural 
                consequence of credit creation and the subsequent servicing of debt obligations.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-2">Deflationary Debt Cycles</h3>
              <p className="mb-4">
                Deflationary debt cycles typically occur in developed economies with established central banks and 
                stable currencies. Key characteristics include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Increasing debt burdens as a percentage of income</li>
                <li>Declining asset prices</li>
                <li>Falling interest rates as central banks respond</li>
                <li>Rising unemployment</li>
                <li>Credit contraction</li>
                <li>Deleveraging as debts are paid down or written off</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-2">Inflationary Debt Cycles</h3>
              <p className="mb-4">
                Inflationary debt cycles are more common in emerging economies or situations where debt is denominated
                in foreign currencies. Key characteristics include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Currency devaluation</li>
                <li>Capital flight</li>
                <li>Rising inflation</li>
                <li>Deteriorating current account balances</li>
                <li>Declining foreign exchange reserves</li>
                <li>Eroding real debt burdens through inflation</li>
              </ul>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">About Ray Dalio</h2>
              <p className="mb-4">
                Ray Dalio is the founder of Bridgewater Associates, one of the world's largest hedge funds. He is known for his 
                economic theories and principles outlined in several books, including <em>Principles</em> and 
                <em> Principles for Navigating Big Debt Crises</em>.
              </p>
              <p className="mb-4">
                His work on debt cycles has been influential in helping investors and policymakers understand the patterns 
                and mechanisms that drive economic expansions and contractions over time.
              </p>
              <p>
                <a 
                  href="https://www.principles.com/big-debt-crises/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn more about Ray Dalio's book on debt crises →
                </a>
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Sources</h2>
              <p className="mb-4">
                This dashboard integrates real economic data from the Federal Reserve Economic Data (FRED) API where available.
                For metrics where real-time data is not accessible, the dashboard displays simulated data that reflects historical patterns.
              </p>
              <p className="mb-4">
                Our primary data sources include:
              </p>
              <ul className="list-disc pl-6">
                <li>Federal Reserve Economic Data (FRED) - for real-time economic indicators</li>
                <li>Bureau of Economic Analysis (BEA)</li>
                <li>Bureau of Labor Statistics (BLS)</li>
                <li>International Monetary Fund (IMF)</li>
                <li>Bank for International Settlements (BIS)</li>
                <li>S&P Dow Jones Indices</li>
                <li>Case-Shiller Home Price Index</li>
              </ul>
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="text-lg font-medium mb-2">Real-Time Data Integration</h3>
                <p className="text-sm">
                  We've integrated the FRED API to provide up-to-date economic metrics directly from the source.
                  This ensures that the dashboard displays the most current available data for key economic indicators,
                  giving users insights based on official government and institutional sources.
                </p>
              </div>
            </section>
          </div>
          
          <div className="mt-10 pt-6 border-t border-border">
            <Link 
              href="/" 
              className="inline-flex items-center text-primary hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 