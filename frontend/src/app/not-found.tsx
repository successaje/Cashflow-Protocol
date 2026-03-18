"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <h1 className="font-display text-[8rem] md:text-[12rem] font-bold text-surface-border leading-none select-none">
                    404
                </h1>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="bg-background/50 backdrop-blur-md px-6 py-2 rounded-2xl border border-surface-border mb-4 inline-flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        <span className="font-bold text-foreground">Block Not Found</span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-md"
            >
                <p className="text-slate-500 mb-8 text-lg">
                    The smart contract, pool, or page you are looking for does not exist on this chain.
                </p>
                <Link href="/">
                    <button className="flex items-center justify-center gap-2 mx-auto bg-[#F3BA2F] text-black px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-[#e0ab2b] hover:-translate-y-1 transition-all">
                        <ArrowLeft className="h-5 w-5" /> Return to Genesis Block
                    </button>
                </Link>
            </motion.div>
        </div>
    );
}
