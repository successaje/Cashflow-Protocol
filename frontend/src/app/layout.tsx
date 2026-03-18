import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Configure fonts via next/font to match design spec exactly
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Cashflow Protocol | Real-World Yield on BNB Chain",
  description: "Institutional-grade tokenization of future revenue streams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/30 transition-colors duration-300">
        <Providers>
          <Navbar />
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
