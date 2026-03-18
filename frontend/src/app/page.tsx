"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, ShieldCheck, Globe, Building2, Coins, LineChart, Wallet2, ChevronRight, Activity, Flame, TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Number Counter Animation Component
const AnimatedNumber = ({ value, label, prefix = "", suffix = "" }: { value: number, label: string, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const incrementTime = 30;
      const steps = Math.ceil(duration / incrementTime);
      const increment = end / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);
      return () => clearInterval(timer);
    }
  }, [inView, value]);

  // Format helper for MK values
  const formatValue = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toFixed(1);
  };

  return (
    <div ref={ref} className="flex flex-col">
      <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
        {prefix}{value > 100 ? formatValue(count) : count.toFixed(1)}{suffix}
      </div>
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
};

export default function Home() {
  const stats = [
    { label: "Total Value Locked", value: 12400000, prefix: "$", suffix: "+" },
    { label: "Businesses Funded", value: 145, prefix: "", suffix: "+" },
    { label: "Yield Generated", value: 2100000, prefix: "$", suffix: "+" },
    { label: "Avg. Historical APY", value: 12.5, prefix: "", suffix: "%" },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 
        Hero Section - Full Height Split View
      */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row items-center overflow-hidden border-b border-surface-border">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#F3BA2F]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 py-12">

          {/* Left: Text & CTA */}
          <div className="flex flex-col justify-center text-center lg:text-left pt-10 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F3BA2F]/30 bg-[#F3BA2F]/10 px-4 py-1.5 text-sm font-medium text-[#F3BA2F] backdrop-blur-sm mb-8 mx-auto lg:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F3BA2F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F3BA2F]"></span>
                </span>
                Institutional-Grade on BNB Chain
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                Turn Real-World Revenue <br className="hidden md:block" /> Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3BA2F] to-amber-500">On-Chain Yield</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Invest in verified business cashflow. Transparent, real-time, and global. Connect your wallet to access sustainable stablecoin yields grounded in the real economy.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/explore" className="w-full sm:w-auto">
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F3BA2F] px-8 py-4 text-base font-bold text-black shadow-[0_4px_20px_rgba(243,186,47,0.3)] transition-all hover:bg-[#e0ab2b] hover:-translate-y-1">
                    Start Investing <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link href="/dashboard/business" className="w-full sm:w-auto">
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-surface-hover hover:-translate-y-1">
                    Raise Capital
                  </button>
                </Link>
              </div>

              {/* Stats within Hero Left */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-surface-border">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1), duration: 0.5 }}
                  >
                    <AnimatedNumber value={stat.value} label={stat.label} prefix={stat.prefix} suffix={stat.suffix} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Flow Animation Illustration */}
          <div className="flex items-center justify-center lg:justify-end relative h-[400px] lg:h-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-md aspect-square"
            >
              {/* Central connecting lines SVG */}
              <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none" viewBox="0 0 400 400" fill="none">
                <motion.path
                  d="M 120 100 Q 200 100 200 200 T 280 300"
                  stroke="url(#gradient1)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
                />
                <motion.path
                  d="M 280 100 Q 200 100 200 200 T 120 300"
                  stroke="url(#gradient2)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
                />
                <defs>
                  <linearGradient id="gradient1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F3BA2F" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Node 1: Business */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 left-4 sm:top-8 sm:left-8 bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl w-40 sm:w-48 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#F3BA2F]/10 flex items-center justify-center border border-[#F3BA2F]/20 group-hover:bg-[#F3BA2F]/20 transition-colors">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#F3BA2F]" />
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> POS
                  </div>
                </div>
                <div className="font-semibold text-foreground text-sm sm:text-base">Real World Biz</div>
                <div className="text-xs text-slate-500 mt-1">Generating Cashflow</div>

                {/* Micro interaction popup */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-10 left-0 bg-background border border-surface-border px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2"
                >
                  <Activity className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-mono font-medium text-emerald-500">+$124.50/hr</span>
                </motion.div>
              </motion.div>

              {/* Node 2: Investor */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl w-40 sm:w-48 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Wallet2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
                <div className="font-semibold text-foreground text-sm sm:text-base">Global Investor</div>
                <div className="text-xs text-slate-500 mt-1">Stablecoin Liquidity</div>
              </motion.div>

              {/* Node 3: The Protocol (Center/Bottom) */}
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface border border-[#F3BA2F]/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(243,186,47,0.15)] backdrop-blur-xl w-56 sm:w-64 z-20"
              >
                <div className="flex items-center gap-3 border-b border-surface-border pb-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-background border border-surface-border flex items-center justify-center p-1.5 overflow-hidden">
                    <Image src="/images/bnb-bnb-logo.png" alt="BNB" width={32} height={32} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-foreground">Cashflow Pool</div>
                    <div className="text-xs text-[#F3BA2F] font-mono">Smart Contract</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Liquidity Provided</span>
                    <span className="font-medium text-foreground">50,000 USDT</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Yield Distributed</span>
                    <span className="font-medium text-emerald-500">4,250 USDT</span>
                  </div>
                </div>

                {/* Animated Particles flowing out */}
                <motion.div
                  animate={{ y: [-20, -50], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                  className="absolute -top-6 right-10 flex items-center gap-1 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30"
                >
                  <Coins className="h-3 w-3" /> + Yield
                </motion.div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </section>

      {/* Partners / Ecosystem */}
      <section className="py-12 border-b border-surface-border bg-surface/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 opacity-70 hover:opacity-100 transition-opacity duration-500">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest hidden sm:block">Built On</p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            <Image src="/images/bnb-bnb-logo.png" alt="BNB Chain" width={140} height={40} className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all cursor-pointer" />
            <Image src="/images/chainlink.png" alt="Chainlink" width={140} height={40} className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all cursor-pointer" />
            <Image src="/images/polygon-matic-logo.png" alt="Polygon" width={140} height={40} className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all cursor-pointer" />
            <Image src="/images/arbitrum-arb-logo.png" alt="Arbitrum" width={140} height={40} className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all cursor-pointer" />
          </div>
        </div>
      </section>

      {/* Additional sections (How it Works, Features) can remain largely similar, updated with BNB accents if needed */}
      <section className="py-24 bg-background relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">How Cashflow Protocol Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">A transparent, three-step engine connecting institutional liquidity to granular real-world revenue streams.</p>
          </div>
          {/* We keep the rest of the layout simple and matching the new branding */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "1. Tokenize Revenue",
                description: "SMEs create a Cashflow Pool, defining their funding target and revenue share.",
                icon: <Building2 className="h-6 w-6 text-[#F3BA2F]" />,
              },
              {
                title: "2. Provide Liquidity",
                description: "Global investors fund the pool using USDT, instantly receiving yield-bearing tokens.",
                icon: <Coins className="h-6 w-6 text-primary" />,
              },
              {
                title: "3. Earn Real Yield",
                description: "Verifiable off-chain revenue is pushed on-chain autonomously by Oracles.",
                icon: <LineChart className="h-6 w-6 text-emerald-500" />,
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="relative rounded-3xl border border-surface-border bg-surface hover:bg-surface-hover p-8 transition-all duration-300"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-surface-border shadow-sm">
                  {step.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pools Section */}
      <section className="py-24 border-t border-surface-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Live Opportunities</h2>
              <p className="text-slate-500 max-w-2xl">Access double-digit stablecoin yields backed by verifiable business cashflows.</p>
            </div>
            <Link href="/explore">
              <button className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover transition-colors bg-primary/10 px-5 py-2.5 rounded-full">
                View All Pools <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mock Pool Card 1 */}
            <div className="group flex flex-col justify-between rounded-3xl border border-surface-border bg-background transition-all hover:-translate-y-1 hover:border-[#F3BA2F]/50 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-lg bg-[#F3BA2F]/10 flex items-center justify-center border border-[#F3BA2F]/20">
                      <Building2 className="h-5 w-5 text-[#F3BA2F]" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground leading-tight">Downtown Espresso</h3>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Retail</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-2 py-1 rounded border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" /> Low Risk
                  </span>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-500">Target: <span className="font-medium text-foreground">$50,000</span></span>
                    <span className="text-[#F3BA2F] font-bold">77%</span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#F3BA2F] to-amber-500 w-[77%]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface rounded-xl p-3 border border-surface-border">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><TrendingUp className="h-3 w-3" /> APY</div>
                    <div className="font-display font-bold text-foreground">15.0%</div>
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-surface-border">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><Clock className="h-3 w-3" /> Duration</div>
                    <div className="font-display font-bold text-foreground">365D</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-surface-border bg-surface/50">
                <button className="w-full flex justify-center items-center gap-2 text-sm font-bold text-[#F3BA2F] group-hover:text-[#e0ab2b] transition-colors">
                  Invest Now <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mock Pool Card 2 */}
            <div className="group flex flex-col justify-between rounded-3xl border border-surface-border bg-background transition-all hover:-translate-y-1 hover:border-[#F3BA2F]/50 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-lg bg-[#F3BA2F]/10 flex items-center justify-center border border-[#F3BA2F]/20">
                      <Building2 className="h-5 w-5 text-[#F3BA2F]" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground leading-tight">CloudSync Inc</h3>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">SaaS</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold px-2 py-1 rounded border border-amber-500/20">
                    <Flame className="h-3 w-3" /> High Risk
                  </span>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-500">Target: <span className="font-medium text-foreground">$100,000</span></span>
                    <span className="text-[#F3BA2F] font-bold">24%</span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#F3BA2F] to-amber-500 w-[24%]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface rounded-xl p-3 border border-surface-border">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><TrendingUp className="h-3 w-3" /> APY</div>
                    <div className="font-display font-bold text-foreground">18.5%</div>
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-surface-border">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><Clock className="h-3 w-3" /> Duration</div>
                    <div className="font-display font-bold text-foreground">180D</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-surface-border bg-surface/50">
                <button className="w-full flex justify-center items-center gap-2 text-sm font-bold text-[#F3BA2F] group-hover:text-[#e0ab2b] transition-colors">
                  Invest Now <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mock Pool Card 3 (Fully Funded) */}
            <div className="group flex flex-col justify-between rounded-3xl border border-surface-border bg-background transition-all hover:-translate-y-1 shadow-sm overflow-hidden relative">
              <div className="absolute -right-12 top-6 bg-emerald-500 text-white text-[10px] font-bold py-1 w-40 text-center rotate-45 shadow-lg z-10">FUNDED</div>
              <div className="p-6 opacity-80">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Building2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground leading-tight">Green Harvest</h3>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Agriculture</span>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-500">Target: <span className="font-medium text-foreground">$500,000</span></span>
                    <span className="text-emerald-500 font-bold">100%</span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface rounded-xl p-3 border border-surface-border">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><TrendingUp className="h-3 w-3" /> APY</div>
                    <div className="font-display font-bold text-foreground">12.0%</div>
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-surface-border">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1"><Clock className="h-3 w-3" /> Duration</div>
                    <div className="font-display font-bold text-foreground">730D</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-surface-border bg-emerald-500/5">
                <button className="w-full flex justify-center items-center gap-2 text-sm font-bold text-emerald-500 transition-colors">
                  View Performance <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Comparison Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute left-0 top-1/2 w-[40%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Why Cashflow Protocol?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Providing a fundamentally superior yield model compared to traditional Web3 lending and TradFi banking.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="p-8 rounded-3xl border border-surface-border bg-surface hover:border-emerald-500/30 transition-colors">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Non-Correlated Yield</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Returns are driven by real-world consumer spending, completely insulated from crypto market volatility and token price crashes.</p>
            </div>
            <div className="p-8 rounded-3xl border border-surface-border bg-surface hover:border-[#F3BA2F]/30 transition-colors">
              <div className="h-12 w-12 bg-[#F3BA2F]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0">
                <Activity className="h-6 w-6 text-[#F3BA2F]" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Verifiable Cashflows</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Our decentralized Oracle network directly queries Point-of-Sale APIs. No self-reporting, no manipulated balance sheets.</p>
            </div>
            <div className="p-8 rounded-3xl border border-surface-border bg-surface hover:border-primary/30 transition-colors">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Permissionless Access</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Small businesses in emerging markets bypass bureaucratic bank loans while global investors access high-tier private credit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 relative overflow-hidden bg-surface border-t border-surface-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(243,186,47,0.1),_transparent_50%)] dark:bg-[radial-gradient(circle_at_center,_rgba(243,186,47,0.15),_transparent_50%)]" />
        <div className="mx-auto max-w-4xl px-4 relative z-10 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to Re-wire Private Credit?</h2>
          <p className="text-lg text-slate-500 mb-10">Join the next evolution of decentralized finance. Provide liquidity to growing businesses or tokenize your own revenue stream today.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/explore">
              <button className="w-full sm:w-auto bg-[#F3BA2F] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e0ab2b] hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(243,186,47,0.3)]">
                Explore Pools
              </button>
            </Link>
            <Link href="/dashboard/business">
              <button className="w-full sm:w-auto bg-background text-foreground border border-surface-border px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-hover hover:-translate-y-0.5 transition-all">
                Apply for Funding
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
