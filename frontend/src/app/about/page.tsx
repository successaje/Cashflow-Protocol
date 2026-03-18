"use client";

import { motion } from "framer-motion";
import { Link2, Building2, Coins, ArrowRight, ShieldCheck, Globe, LineChart } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="w-full">
            {/* Hero */}
            <section className="relative py-20 lg:py-32 overflow-hidden border-b border-surface-border">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(243,186,47,0.1),_transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(243,186,47,0.15),_transparent_50%)]" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
                    >
                        The Bridge Between <span className="text-[#F3BA2F]">Wall Street</span> and Main Street
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-500"
                    >
                        Cashflow Protocol tokenizes the predictable revenue streams of real-world businesses, unlocking global liquidity for SMEs and sustainable yield for DeFi investors.
                    </motion.p>
                </div>
            </section>

            {/* RWA Process Flow */}
            <section className="py-24 bg-surface/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl font-bold text-foreground mb-4">How Tokenization Works</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">We turn boring, traditional cashflow into highly liquid, programmable, and composable on-chain assets.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-surface-border via-[#F3BA2F]/50 to-emerald-500/50 -translate-y-1/2 z-0" />

                        {[
                            { icon: Building2, title: "1. Origination", desc: "Verifiable businesses pledge a percentage of future gross receipts." },
                            { icon: Link2, title: "2. Structuring", desc: "A smart contract is deployed on BNB Chain dictating the revenue split." },
                            { icon: Coins, title: "3. Tokenization", desc: "Investors fund the pool with USDT, minting yield-bearing ERC20 tokens." },
                            { icon: LineChart, title: "4. Distribution", desc: "Our Oracle reads PoS data, autonomously distributing stablecoin yield." },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="relative z-10 bg-surface border border-surface-border p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform"
                            >
                                <div className="h-12 w-12 bg-background border border-surface-border rounded-xl flex items-center justify-center mb-4">
                                    <step.icon className={`h-6 w-6 ${i === 3 ? 'text-emerald-500' : 'text-[#F3BA2F]'}`} />
                                </div>
                                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dual Benefits */}
            <section className="py-24 border-t border-surface-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16">

                    <div className="bg-[#F3BA2F]/5 border border-[#F3BA2F]/20 rounded-3xl p-8 md:p-12">
                        <div className="h-14 w-14 bg-[#F3BA2F]/20 rounded-2xl flex items-center justify-center mb-6">
                            <Globe className="h-7 w-7 text-[#F3BA2F]" />
                        </div>
                        <h2 className="font-display text-3xl font-bold text-foreground mb-4">For Investors</h2>
                        <ul className="space-y-4">
                            {[
                                "High-yield generation uncorrelated to crypto market volatility.",
                                "Transparent, verifiable cashflows backed by real-world activity.",
                                "Asset liquidity via standardized ERC20 CashflowTokens.",
                                "Direct access to emerging market SMB growth."
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-300">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/explore">
                            <button className="mt-8 flex items-center gap-2 text-[#F3BA2F] font-bold hover:text-[#e0ab2b] transition-colors">
                                Explore Opportunities <ArrowRight className="h-4 w-4" />
                            </button>
                        </Link>
                    </div>

                    <div className="bg-surface border border-surface-border rounded-3xl p-8 md:p-12 shadow-sm">
                        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                            <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <h2 className="font-display text-3xl font-bold text-foreground mb-4">For Businesses</h2>
                        <ul className="space-y-4">
                            {[
                                "Non-dilutive capital without traditional banking friction.",
                                "Global liquidity pools previously unavailable to local SMEs.",
                                "Flexible, revenue-based repayment models.",
                                "Automated administration via Smart Contracts."
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-300">
                                    <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/dashboard/business">
                            <button className="mt-8 flex items-center gap-2 text-primary font-bold hover:text-primary-hover transition-colors">
                                Apply for Funding <ArrowRight className="h-4 w-4" />
                            </button>
                        </Link>
                    </div>

                </div>
            </section>
        </div>
    );
}
