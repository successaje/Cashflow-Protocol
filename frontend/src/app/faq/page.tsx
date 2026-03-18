"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQPage() {
    const faqs = [
        {
            question: "What is Cashflow Protocol?",
            answer: "Cashflow Protocol is an institutional-grade decentralized platform that bridges real-world business revenue with on-chain DeFi liquidity. It allows SMEs to tokenize parts of their future cashflow into tradable assets, providing non-dilutive capital to businesses and stable, non-crypto-correlated yield to investors."
        },
        {
            question: "How do I invest?",
            answer: "Navigate to the 'Explore Pools' page, find a business whose risk profile and APY match your goals, connect your web3 wallet via our Navbar, and deposit USDT. You will immediately receive CashflowTokens (ERC20) representing your fractional claim on that business's revenue."
        },
        {
            question: "How do businesses submit their revenue?",
            answer: "We use a decentralized Oracle network integrated directly with the business's Point of Sale (PoS) system or payment gateway. Revenue data is pushed automatically on-chain in real-time, removing manual reporting errors and protecting investors."
        },
        {
            question: "What are the risks involved?",
            answer: "While Cashflow Protocol provides strong technological guarantees through audited smart contracts, there is inherent default risk (the business failing to generate expected revenue). Pools are rated by risk. High-rated pools are often overcollateralized by physical assets to mitigate these risks."
        },
        {
            question: "What happens if a business defaults?",
            answer: "If a business consistently misses localized revenue quotas, the smart contract triggers a structured liquidation/insurance payout depending on the pool's specific terms. Collateralized assets (pledged off-chain via legal SPVs) may be liquidated to reimburse standard stablecoin principal to token holders."
        }
    ];

    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 min-h-[calc(100vh-4rem)]">
            <div className="text-center mb-16">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
                <p className="text-lg text-slate-500">Everything you need to know about the product and billing.</p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
            </div>

            <div className="mt-16 text-center p-8 bg-surface border border-surface-border rounded-3xl shadow-sm">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">Still have questions?</h3>
                <p className="text-slate-500 mb-6">Our team is available to assist institutional investors and business operators.</p>
                <button className="bg-[#F3BA2F] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#e0ab2b] transition-colors shadow-sm">
                    Contact Support
                </button>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-surface-border bg-surface rounded-2xl overflow-hidden shadow-sm">
            <button
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3BA2F] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-foreground pr-4">{question}</span>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#F3BA2F]' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="px-6 pb-6 text-slate-500 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
