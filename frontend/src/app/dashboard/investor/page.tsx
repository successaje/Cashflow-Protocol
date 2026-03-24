"use client";

import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Wallet2, TrendingUp, HandCoins, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits } from "viem";

// Minimal ABIs
const ERC20_BALANCE_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view", "type": "function"
    }
] as const;

const POOL_READ_ABI = [
    {
        "inputs": [], "name": "accRewardPerShare",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "rewardDebt",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [], "name": "cashflowToken",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view", "type": "function"
    }
] as const;

const CLAIM_ABI = [
    {
        "inputs": [], "name": "claimYield",
        "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }
] as const;

interface DbPool {
    id: string;
    poolAddress: string | null;
    tokenName: string;
    tokenSymbol: string;
    fundingTarget: number;
    revenueShare: number;
    durationDays: number;
    business: { name: string; description: string };
}

function InvestmentRow({
    pool,
    address,
    onUpdateMetrics
}: {
    pool: DbPool;
    address: `0x${string}`;
    onUpdateMetrics: (poolAddr: string, pending: bigint) => void;
}) {
    const { writeContractAsync } = useWriteContract();

    // 1. Get Token Address
    const { data: tokenAddress } = useReadContract({
        address: pool.poolAddress as `0x${string}`,
        abi: POOL_READ_ABI,
        functionName: 'cashflowToken',
        query: { enabled: !!pool.poolAddress }
    });

    // 2. Get Balance
    const { data: balance } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_BALANCE_ABI,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: !!tokenAddress }
    });

    // 3. Get Pool AccRewards & User Debt
    const { data: accReward } = useReadContract({
        address: pool.poolAddress as `0x${string}`,
        abi: POOL_READ_ABI,
        functionName: 'accRewardPerShare',
        query: { enabled: !!pool.poolAddress }
    });

    const { data: debt } = useReadContract({
        address: pool.poolAddress as `0x${string}`,
        abi: POOL_READ_ABI,
        functionName: 'rewardDebt',
        args: [address],
        query: { enabled: !!pool.poolAddress }
    });

    const pending = (balance !== undefined && accReward !== undefined && debt !== undefined) 
        ? (BigInt(balance) * BigInt(accReward)) / BigInt(1e12) - BigInt(debt) 
        : BigInt(0);

    useEffect(() => {
        console.log(`Pool ${pool.tokenSymbol} state: bal=${balance}, acc=${accReward}, debt=${debt}, pending=${pending}`);
        if (pool.poolAddress) onUpdateMetrics(pool.poolAddress, pending);
    }, [pending, pool.poolAddress, onUpdateMetrics, balance, accReward, debt]);

    if (!balance || BigInt(balance) === BigInt(0)) return null;

    const tokensOwned = Number(formatUnits(balance as bigint, 18)).toFixed(2);
    const claimable = Number(formatUnits(pending < BigInt(0) ? BigInt(0) : pending, 18)).toFixed(4);

    const handleClaim = async () => {
        if (!pool.poolAddress || pending <= BigInt(0)) return;
        try {
            await writeContractAsync({
                address: pool.poolAddress as `0x${string}`,
                abi: CLAIM_ABI,
                functionName: "claimYield",
                gas: BigInt(300000),
            });
        } catch (e) {
            console.error("Claim failed:", e);
        }
    };

    return (
        <tr className="hover:bg-surface-hover transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-background border border-surface-border flex items-center justify-center font-bold text-[#F3BA2F] text-xs">
                        {pool.tokenSymbol.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-foreground">{pool.tokenName}</div>
                        <div className="text-xs text-slate-500">{pool.tokenSymbol}</div>
                    </div>
                </div>
            </td>
            <td className="p-4 font-mono font-bold text-primary">{tokensOwned} {pool.tokenSymbol}</td>
            <td className="p-4 font-mono text-emerald-500 font-medium">+${claimable}</td>
            <td className="p-4">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Active</span>
            </td>
            <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={handleClaim}
                        disabled={pending <= BigInt(0)}
                        className="text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1"
                    >
                        <HandCoins className="h-3 w-3" />
                        {Number(claimable) > 0 ? `Claim $${claimable}` : "No Yield"}
                    </button>
                    <Link href={`/pool/${pool.id}`}>
                        <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                            <ExternalLink className="h-3 w-3" />
                        </button>
                    </Link>
                </div>
            </td>
        </tr>
    );
}

function PortfolioAllocationChart({ pools, investorAddress }: { pools: DbPool[], investorAddress: string }) {
    // Individual reads for allocation chart are tricky without batch, but we'll stick to a simpler version if needed
    // or just use the same individual pattern if they are already in separate components.
    // For now, let's keep it simple.
    return <div className="text-center text-slate-500 text-sm py-10">Allocation details loaded from blockchain...</div>;
}

export default function InvestorDashboard() {
    const [activeTab, setActiveTab] = useState('portfolio');
    const [pools, setPools] = useState<DbPool[]>([]);
    const [loading, setLoading] = useState(true);
    const { address, isConnected } = useAccount();

    const [stats, setStats] = useState({ totalInvested: 0, totalEarned: 0 });
    const [claimableMap, setClaimableMap] = useState<Record<string, bigint>>({});

    const handleUpdateMetrics = useCallback((poolAddr: string, pending: bigint) => {
        setClaimableMap(prev => ({ ...prev, [poolAddr]: pending }));
    }, []);

    const totalClaimable = Object.values(claimableMap).reduce((sum, val) => sum + val, BigInt(0));

    useEffect(() => {
        if (!address) return;
        
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

        fetch(`${baseUrl}/api/get-pool-data`)
            .then(r => r.json())
            .then(d => setPools(d.pools || []))
            .catch(() => setPools([]))
            .finally(() => setLoading(false));

        fetch(`${baseUrl}/api/investor-stats?address=${address}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) setStats({ totalInvested: d.totalInvested, totalEarned: d.totalEarned });
            })
            .catch(e => console.error("Stats fail:", e));
    }, [address]);

    const mockYieldHistory = [
        { month: "Jan", yield: 0 }, { month: "Feb", yield: 0 },
        { month: "Mar", yield: 0 }, { month: "Apr", yield: 0 },
        { month: "May", yield: 0 }, { month: "Jun", yield: 0 },
    ];

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <Wallet2 className="h-12 w-12 text-slate-400" />
                <h2 className="text-xl font-bold text-foreground">Connect your wallet</h2>
                <p className="text-slate-500">Connect your wallet to see your portfolio.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Investor Dashboard</h1>
                    <p className="text-slate-500 mt-1">Portfolio overview and earnings — powered by Cashflow Protocol.</p>
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
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Wallet2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-sm font-medium text-slate-500">Total Invested</div>
                    </div>
                    <div className="font-display text-3xl font-bold text-foreground">${stats.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono truncate">{address}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border border-surface-border bg-surface shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="text-sm font-medium text-slate-500">Total Earned</div>
                    </div>
                    <div className="font-display text-3xl font-bold text-emerald-500">${stats.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-[10px] text-slate-500 mt-2">Cumulative realized profit</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border border-surface-border bg-surface shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <HandCoins className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="text-sm font-medium text-slate-500">Claimable Yield</div>
                    </div>
                    <div className="font-display text-3xl font-bold text-amber-500">${formatUnits(totalClaimable, 18).slice(0, 6)}</div>
                    <button className="mt-2 text-[10px] font-bold text-primary hover:underline">Claim All Available</button>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-surface-border mb-8">
                {['portfolio', 'analytics'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-foreground'}`}>
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="inv-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'portfolio' ? (
                <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 animate-pulse">Fetching pool ledger...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-background border-b border-surface-border text-xs uppercase tracking-wider text-slate-500">
                                        <th className="p-4 font-medium">Pool Asset</th>
                                        <th className="p-4 font-medium">Tokens Owned</th>
                                        <th className="p-4 font-medium text-emerald-500">Yield Earned</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border text-sm">
                                    {pools.map((pool) => (
                                        <InvestmentRow
                                            key={pool.id}
                                            pool={pool}
                                            address={address as `0x${string}`}
                                            onUpdateMetrics={handleUpdateMetrics}
                                        />
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 text-xs text-center text-slate-500 border-t border-surface-border">
                                <ShieldCheck className="inline-h-3 w-3 mr-1" />
                                Secured by Binance Smart Chain Smart Contracts
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-1 gap-8">
                    <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-sm">
                        <h3 className="font-display font-medium text-foreground mb-2">Yield Analytics</h3>
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
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)", borderRadius: "8px" }} />
                                    <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={3} fill="url(#colorY)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
