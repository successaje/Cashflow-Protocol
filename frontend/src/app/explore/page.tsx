"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ShieldCheck, Flame, ChevronRight, Building2, TrendingUp, Clock, SortDesc } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";

const POOL_ABI = [{
    "inputs": [],
    "name": "fundingRaised",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
}] as const;

interface Pool {
    id: string;
    poolAddress: string | null;
    tokenName: string;
    tokenSymbol: string;
    fundingTarget: number;
    revenueShare: number;
    durationDays: number;
    business: {
        name: string;
        description: string;
    };
    riskScore?: string;
    mockIndustry?: string;
    mockRaised?: number;
    createdAt?: Date;
}

export default function ExplorePage() {
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtering & Sorting State
    const [industryFilter, setIndustryFilter] = useState("All");
    const [riskFilter, setRiskFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest"); // newest, highest-yield, funded
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        const fetchPools = async () => {
            try {
                const res = await fetch("http://localhost:3001/api/get-pool-data");
                if (res.ok) {
                    const data = await res.json();
                    const fetchedPools = (data.pools || []).map((p: any, i: number) => ({
                        ...p,
                        riskScore: p.riskScore || "B (Medium Risk)",
                        mockIndustry: i % 3 === 0 ? "Retail" : i % 3 === 1 ? "SaaS" : "Logistics",
                        mockRaised: p.fundingTarget * (Math.random() * 0.8 + 0.1), // Mock fallback
                        createdAt: new Date(Date.now() - i * 86400000) // Mock different days
                    }));
                    setPools(fetchedPools);
                } else {
                    setPools(getMockPools());
                }
            } catch (e) {
                setPools(getMockPools());
            } finally {
                setLoading(false);
            }
        };
        fetchPools();
    }, []);

    const getMockPools = () => [
        {
            id: "1", poolAddress: "0x123", tokenName: "Espresso Rev", tokenSymbol: "ESPR",
            fundingTarget: 25000, revenueShare: 15, durationDays: 365, mockRaised: 8500,
            business: { name: "Downtown Espresso", description: "Funding for 3 new locations." },
            mockRisk: "Low Risk", mockIndustry: "Retail", createdAt: new Date()
        },
        {
            id: "2", poolAddress: "0x456", tokenName: "Cloud Sub", tokenSymbol: "CSUB",
            fundingTarget: 100000, revenueShare: 8, durationDays: 180, mockRaised: 95000,
            business: { name: "CloudSync Inc", description: "B2B SaaS expanding marketing operations." },
            mockRisk: "High Risk", mockIndustry: "SaaS", createdAt: new Date(Date.now() - 86400000)
        },
        {
            id: "3", poolAddress: "0x789", tokenName: "Agri Chain", tokenSymbol: "AGRI",
            fundingTarget: 500000, revenueShare: 12, durationDays: 730, mockRaised: 120000,
            business: { name: "Green Harvest", description: "Scaling sustainable supply chain operations." },
            riskScore: "B (Medium Risk)", mockIndustry: "Agriculture", createdAt: new Date(Date.now() - 172800000)
        }
    ];

    // Apply Search, Filters, and Sort
    const processedPools = pools
        .filter(p => industryFilter === "All" || p.mockIndustry === industryFilter)
        .filter(p => {
            if (riskFilter === "All") return true;
            if (riskFilter === "Low Risk") return p.riskScore?.includes("Low") || p.riskScore?.includes("Excellent");
            if (riskFilter === "High Risk") return p.riskScore?.includes("Medium") || p.riskScore?.includes("New");
            return true;
        })
        .filter(p => !searchQuery || p.business.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "newest") return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
            if (sortBy === "highest-yield") return b.revenueShare - a.revenueShare;
            if (sortBy === "funded") return ((b.mockRaised || 0) / b.fundingTarget) - ((a.mockRaised || 0) / a.fundingTarget);
            return 0;
        });

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8 md:flex justify-between items-end">
                <div>
                    <h1 className="font-display text-4xl font-bold text-foreground mb-4">Explore Pools</h1>
                    <p className="text-slate-500 max-w-2xl">
                        Discover high-yield opportunities backed by verifiable businesses. Complete your due diligence and provide stablecoin liquidity.
                    </p>
                </div>
            </div>

            {/* Advanced Filter Bar Wrapper */}
            <div className="bg-surface border border-surface-border rounded-2xl p-4 mb-8 sticky top-20 z-30 shadow-sm">

                {/* Desktop Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* Search */}
                    <div className="flex w-full md:w-auto items-center gap-2 bg-background border border-surface-border rounded-xl px-3 py-2 flex-grow max-w-md">
                        <Search className="h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by business name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-slate-500"
                        />
                    </div>

                    <div className="hidden md:flex gap-3 items-center">
                        {/* Industry Filter */}
                        <select
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                            className="bg-background border border-surface-border rounded-xl px-4 py-2 text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-primary"
                        >
                            <option value="All">All Industries</option>
                            <option value="Retail">Retail</option>
                            <option value="SaaS">SaaS</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Logistics">Logistics</option>
                        </select>

                        {/* Risk Filter */}
                        <select
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                            className="bg-background border border-surface-border rounded-xl px-4 py-2 text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-primary"
                        >
                            <option value="All">All Risk Levels</option>
                            <option value="Low Risk">A - Low Risk</option>
                            <option value="High Risk">B - High Risk</option>
                        </select>

                        <div className="w-px h-6 bg-surface-border mx-2" />

                        {/* Sort Toggle */}
                        <div className="flex bg-background border border-surface-border rounded-xl p-1">
                            {[
                                { id: "newest", label: "Newest" },
                                { id: "highest-yield", label: "Highest Yield" },
                                { id: "funded", label: "% Funded" }
                            ].map(sort => (
                                <button
                                    key={sort.id}
                                    onClick={() => setSortBy(sort.id)}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${sortBy === sort.id
                                            ? "bg-surface shadow-sm text-foreground"
                                            : "text-slate-500 hover:text-foreground"
                                        }`}
                                >
                                    {sort.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="md:hidden w-full flex justify-center items-center gap-2 py-2 border border-surface-border rounded-xl bg-background text-sm font-medium"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                        <Filter className="h-4 w-4" /> Filters & Sort
                    </button>
                </div>

                {/* Mobile Filters Expansion */}
                <AnimatePresence>
                    {showMobileFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden flex flex-col gap-4 mt-4 pt-4 border-t border-surface-border overflow-hidden"
                        >
                            {/* Similar selects but mapped for mobile stack */}
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}
                                    className="bg-background border border-surface-border rounded-xl px-3 py-2 text-sm text-foreground w-full"
                                >
                                    <option value="All">All Industries</option>
                                    <option value="Retail">Retail</option>
                                    <option value="SaaS">SaaS</option>
                                </select>
                                <select
                                    value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}
                                    className="bg-background border border-surface-border rounded-xl px-3 py-2 text-sm text-foreground w-full"
                                >
                                    <option value="All">All Risks</option>
                                    <option value="Low Risk">A - Low</option>
                                    <option value="High Risk">B - High</option>
                                </select>
                            </div>
                            <div className="flex overflow-x-auto gap-2 pb-2">
                                {[
                                    { id: "newest", label: "Newest" },
                                    { id: "highest-yield", label: "Highest Yield" },
                                    { id: "funded", label: "% Funded" }
                                ].map(sort => (
                                    <button
                                        key={sort.id}
                                        onClick={() => setSortBy(sort.id)}
                                        className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap border transition-all ${sortBy === sort.id
                                                ? "bg-primary border-primary text-white"
                                                : "bg-background border-surface-border text-slate-500"
                                            }`}
                                    >
                                        {sort.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pools Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-96 bg-surface/30 border border-surface-border rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : processedPools.length === 0 ? (
                <div className="text-center py-20 border border-surface-border border-dashed rounded-3xl bg-surface/30">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-surface-border mb-4">
                        <Search className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-display font-medium text-foreground">No pools found</h3>
                    <p className="text-slate-500 mt-2">Adjust your search or filter criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {processedPools.map((pool, i) => (
                        <PoolCard key={pool.id} pool={pool} i={i} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PoolCard({ pool, i }: { pool: Pool, i: number }) {
    const { data: fundingRaisedData } = useReadContract({
        address: (pool.poolAddress as `0x${string}`) || "0x" + "1".repeat(40),
        abi: POOL_ABI,
        functionName: 'fundingRaised',
        query: { enabled: !!pool.poolAddress }
    });

    const raised = fundingRaisedData ? Number(formatUnits(fundingRaisedData as bigint, 18)) : (pool.mockRaised || 0);
    const progress = (raised / pool.fundingTarget) * 100;
    const isFullyFunded = progress >= 100;

    return (
        <Link href={`/pool/${pool.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.1, 0.5), duration: 0.4 }}
                className="group flex flex-col justify-between h-full rounded-3xl border border-surface-border bg-surface transition-all hover:-translate-y-1 hover:border-[#F3BA2F]/50 hover:shadow-[0_12px_40px_rgba(243,186,47,0.08)] cursor-pointer overflow-hidden p-[1px]"
            >
                <div className="bg-background/80 h-full rounded-[23px] flex flex-col p-6 relative">
                    {isFullyFunded && (
                        <div className="absolute -right-12 top-6 bg-emerald-500 text-white text-xs font-bold py-1 w-40 text-center rotate-45 shadow-lg z-10">
                            FUNDED!
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center border border-surface-border transition-colors group-hover:bg-[#F3BA2F]/10 group-hover:border-[#F3BA2F]/20">
                                <Building2 className={`h-5 w-5 ${isFullyFunded ? 'text-emerald-500' : 'text-[#F3BA2F]'}`} />
                            </div>
                            <div>
                                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-[#F3BA2F] transition-colors leading-tight">
                                    {pool.tokenName}
                                </h3>
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{pool.mockIndustry}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">
                        {pool.business.description}
                    </p>

                    <div className="mb-6 bg-surface rounded-xl p-4 border border-surface-border">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-500">Target: <span className="font-medium text-foreground">${pool.fundingTarget.toLocaleString()}</span></span>
                            <span className={`${isFullyFunded ? 'text-emerald-500 font-bold' : 'text-[#F3BA2F] font-bold'}`}>
                                {progress.toFixed(0)}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-surface-border">
                            <div
                                className={`h-full rounded-full ${isFullyFunded ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#F3BA2F] to-amber-500'}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <div className="text-[10px] mt-2 text-slate-500 text-right">
                            ${Math.floor(raised).toLocaleString()} Raised
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase">Exp. APY</div>
                                <div className="font-display font-bold text-foreground">{pool.revenueShare}%</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center">
                                <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase">Duration</div>
                                <div className="font-display font-bold text-foreground">{pool.durationDays}D</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-surface-border flex justify-between items-center">
                        {pool.riskScore?.includes("Low") || pool.riskScore?.includes("Excellent") ? (
                            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
                                <ShieldCheck className="h-3.5 w-3.5" /> {pool.riskScore}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/20">
                                <Flame className="h-3.5 w-3.5" /> {pool.riskScore || "Medium Risk"}
                            </span>
                        )}

                        <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${isFullyFunded ? 'text-emerald-500' : 'text-[#F3BA2F] group-hover:text-[#e0ab2b]'}`}>
                            {isFullyFunded ? 'View Details' : 'Invest Now'} <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

