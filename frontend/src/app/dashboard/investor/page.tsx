"use client";

import { useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Wallet2, TrendingUp, HandCoins, ExternalLink, ArrowRight, ArrowDownRight, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const mockYieldHistory = [
    { month: "Jan", yield: 120 },
    { month: "Feb", yield: 250 },
    { month: "Mar", yield: 380 },
    { month: "Apr", yield: 540 },
    { month: "May", yield: 820 },
    { month: "Jun", yield: 1150 },
];

const mockAllocation = [
    { name: "Downtown Espresso", value: 5000 },
    { name: "CloudSync Inc", value: 3500 },
    { name: "Green Harvest", value: 8000 },
];

const mockInvestments = [
    { id: 1, name: "Downtown Espresso", symbol: "ESPR", invested: 5000, yieldEarned: 450, apy: "15%", status: "Active", nextDistro: "2 Days" },
    { id: 2, name: "CloudSync Inc", symbol: "CSUB", invested: 3500, yieldEarned: 210, apy: "12%", status: "Active", nextDistro: "12 Days" },
    { id: 3, name: "Green Harvest", symbol: "AGRI", invested: 8000, yieldEarned: 0, apy: "18%", status: "Pending", nextDistro: "1 Month" },
];

export default function InvestorDashboard() {
    const [activeTab, setActiveTab] = useState('portfolio');

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Investor Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage your Cashflow Tokens and track real-world yield.</p>
                </div>
                <Link href="/explore">
                    <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:bg-primary-hover transition-colors flex items-center gap-2 text-sm">
                        Find Pools <ArrowRight className="h-4 w-4" />
                    </button>
                </Link>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-surface-border bg-surface shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Wallet2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Total Invested</div>
                            <div className="font-display text-2xl font-bold text-foreground">$16,500.00</div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">Across <strong className="text-foreground">3</strong> active pools</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border border-surface-border bg-surface shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Total Yield Earned</div>
                            <div className="font-display text-2xl font-bold text-emerald-500">+$660.00</div>
                        </div>
                    </div>
                    <div className="text-xs text-emerald-500 font-medium flex items-center gap-1 bg-emerald-500/10 w-fit px-2 py-0.5 rounded">
                        +12% this month
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border border-surface-border bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">Estimated Portfolio APY</div>
                        <div className="font-display text-3xl font-bold text-foreground">14.2%</div>
                        <div className="text-xs text-slate-500 mt-1">Weighted average across tokens</div>
                    </div>
                    <button className="w-full mt-4 py-2 border border-primary text-primary rounded-lg text-sm font-bold hover:bg-primary/5 transition-colors">
                        Claim Available Yield
                    </button>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-surface-border mb-8">
                {['portfolio', 'analytics'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-foreground'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="inv-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'portfolio' ? (
                <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-background border-b border-surface-border text-xs uppercase tracking-wider text-slate-500">
                                    <th className="p-4 font-medium">Asset</th>
                                    <th className="p-4 font-medium">Invested (USDT)</th>
                                    <th className="p-4 font-medium">Yield Earned</th>
                                    <th className="p-4 font-medium">APY</th>
                                    <th className="p-4 font-medium">Status / Next Distro</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border text-sm">
                                {mockInvestments.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-surface-hover transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-background border border-surface-border flex items-center justify-center font-bold text-[#F3BA2F] text-xs">
                                                    {inv.symbol.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground">{inv.name}</div>
                                                    <div className="text-xs text-slate-500">{inv.symbol}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono">${inv.invested.toLocaleString()}</td>
                                        <td className="p-4 font-mono text-emerald-500 font-medium">+${inv.yieldEarned.toLocaleString()}</td>
                                        <td className="p-4 font-bold text-foreground">{inv.apy}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded w-fit ${inv.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {inv.status}
                                                </span>
                                                <span className="text-xs text-slate-500">{inv.nextDistro}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/pool/${inv.id}`}>
                                                <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center justify-end w-full gap-1">
                                                    Details <ExternalLink className="h-3 w-3" />
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-sm">
                        <h3 className="font-display font-medium text-foreground mb-6">Cumulative Yield History</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockYieldHistory}>
                                    <defs>
                                        <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)", borderRadius: "8px" }} />
                                    <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={3} fill="url(#colorY)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-sm">
                        <h3 className="font-display font-medium text-foreground mb-6">Portfolio Allocation</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockAllocation} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--surface-border)" />
                                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                    <Tooltip cursor={{ fill: 'var(--surface-hover)' }} contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)", borderRadius: "8px" }} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
