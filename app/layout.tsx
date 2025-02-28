import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Debt Cycles Dashboard | Ray Dalio's Principles",
  description: "Dashboard tracking metrics from Ray Dalio's Principles for Navigating Big Debt Crises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        
        {/* Script to fix hydration issues with dynamic content */}
        <Script id="hydration-fix" strategy="afterInteractive">
          {`
            (function() {
              // This script runs only on the client side
              if (typeof window === 'undefined') return;
              
              // Add a class to indicate client-side hydration is complete
              document.documentElement.classList.add('hydrated');
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
