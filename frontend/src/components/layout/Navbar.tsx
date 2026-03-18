"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from "next-themes";

export function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const links = [
        { href: "/explore", label: "Explore Pools" },
        { href: "/dashboard/investor", label: "Investor Dashboard" },
        { href: "/dashboard/business", label: "Business Tools" },
        { href: "/about", label: "About" },
        { href: "/faq", label: "FAQ" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="font-display text-xl font-bold tracking-tight text-foreground">
                                Cashflow<span className="text-primary">Protocol</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden lg:block">
                        <div className="ml-10 flex items-baseline justify-center space-x-6">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors hover:text-foreground ${pathname?.startsWith(link.href) ? "text-foreground" : "text-slate-500 dark:text-slate-400"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        {mounted && (
                            <button
                                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                className="rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-surface-border hover:text-foreground transition-colors"
                                aria-label="Toggle Theme"
                            >
                                {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        )}
                        <ConnectButton showBalance={false} chainStatus="icon" />
                    </div>

                    <div className="-mr-2 flex items-center gap-4 lg:hidden">
                        {mounted && (
                            <button
                                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                className="rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-surface-border hover:text-foreground transition-colors"
                            >
                                {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 dark:text-slate-400 hover:bg-surface-border hover:text-foreground focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t border-surface-border bg-surface"
                    >
                        <div className="space-y-1 px-2 pb-6 pt-2 sm:px-3">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block rounded-md px-3 py-2 text-base font-medium ${pathname === link.href ? "bg-primary/10 text-primary" : "text-slate-500 dark:text-slate-400 hover:bg-surface-border hover:text-foreground"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="px-3 py-4 mt-2 flex justify-center border-t border-surface-border">
                                <ConnectButton showBalance={false} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
