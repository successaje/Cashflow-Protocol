"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Wallet2, TrendingUp, HandCoins, ExternalLink, ArrowRight, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useWriteContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";

// Minimal ABIs for the read/write calls we need
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
    },
    {
        "inputs": [], "name": "fundingRaised",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [], "name": "revenueSharePercentage",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
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
    id: number;
    poolAddress: string | null;
    tokenName: string;
    tokenSymbol: string;
    fundingTarget: number;
    revenueShare: number;
    durationDays: number;
    business: { name: string; description: string };
}

// Per-pool row component that reads live on-chain data
function InvestmentRow({ pool, investorAddress }: { pool: DbPool; investorAddress: string }) {
    const poolAddr = pool.poolAddress as `0x${string}` | undefined;

    const { data: cashflowTokenAddr } = useReadContract({
        address: poolAddr, abi: POOL_READ_ABI, functionName: "cashflowToken",
        query: { enabled: !!poolAddr }
    });

    const { data: tokenBalance } = useReadContract({
        address: cashflowTokenAddr as `0x${string}` | undefined,
        abi: ERC20_BALANCE_ABI, functionName: "balanceOf",
        args: [investorAddress as `0x${string}`],
        query: { enabled: !!cashflowTokenAddr }
    });

    const { data: accReward } = useReadContract({
        address: poolAddr, abi: POOL_READ_ABI, functionName: "accRewardPerShare",
        query: { enabled: !!poolAddr }
    });

    const { data: debt } = useReadContract({
        address: poolAddr, abi: POOL_READ_ABI, functionName: "rewardDebt",
        args: [investorAddress as `0x${string}`],
        query: { enabled: !!poolAddr }
    });

    const { writeContractAsync, isPending } = useWriteContract();

    const balance = tokenBalance ?? 0n;
    const pending = accReward && debt && balance > 0n
        ? (balance * accReward) / BigInt(1e12) - debt
        : 0n;

    if (balance === 0n) return null; // Only show pools the investor is in

    const invested = Number(formatUnits(balance, 18)).toFixed(2);
    const yieldEarned = Number(formatUnits(pending < 0n ? 0n : pending, 18)).toFixed(4);
    const estimatedApy = `${pool.revenueShare.toFixed(1)}%`;

    const handleClaim = async () => {
        if (!poolAddr || pending <= 0n) return;
        try {
            await writeContractAsync({
                address: poolAddr,
                abi: CLAIM_ABI,
                functionName: "claimYield",
                gas: 300_000n,
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
            <td className="p-4 font-mono">${invested}</td>
            <td className="p-4 font-mono text-emerald-500 font-medium">+${yieldEarned}</td>
            <td className="p-4 font-bold text-foreground">{estimatedApy}</td>
            <td className="p-4">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Active</span>
            </td>
            <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={handleClaim}
                        disabled={isPending || pending <= 0n}
                        className="text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1"
                    >
                        {isPending ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <HandCoins className="h-3 w-3" />}
                        {isPending ? "Claiming..." : Number(yieldEarned) > 0 ? `Claim $${yieldEarned}` : "Nothing to claim"}
                    </button>
                    <Link href={`/pool/${pool.id}`}>
                        <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                        </button>
                    </Link>
                </div>
            </td>
        </tr>
    );
}

function PortfolioAllocationChart({ pools, investorAddress }: { pools: DbPool[], investorAddress: string }) {
    // 1. Get all token addresses
    const { data: tokenAddresses } = useReadContracts({
        contracts: pools.map(p => ({
            address: p.poolAddress as `0x${string}`,
            abi: POOL_READ_ABI,
            functionName: 'cashflowToken'
        }))
    });

    // 2. Get balances for those token addresses
    const { data: balances } = useReadContracts({
        contracts: pools.map((p, i) => ({
            address: tokenAddresses?.[i]?.result as `0x${string}` | undefined,
            abi: ERC20_BALANCE_ABI,
            functionName: 'balanceOf',
            args: [investorAddress as `0x${string}`]
        })),
        query: { enabled: !!tokenAddresses && tokenAddresses.length > 0 }
    });

    // 3. Format data
    const chartData = pools.map((pool, i) => {
        const bal = balances?.[i]?.result as bigint | undefined;
        return {
            name: pool.tokenSymbol || pool.business.name,
            value: bal ? Number(formatUnits(bal, 18)) : 0
        };
    }).filter(d => d.value > 0);

    if (chartData.length === 0) {
        return <div className="text-sm text-slate-500 w-full h-full flex items-center justify-center">No active allocations found. Invest in a pool to see data.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--surface-border)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)", borderRadius: "8px" }} cursor={{ fill: 'var(--surface-border)', opacity: 0.4 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default function InvestorDashboard() {
    const [activeTab, setActiveTab] = useState('portfolio');
    const [pools, setPools] = useState<DbPool[]>([]);
    const [loading, setLoading] = useState(true);
    const { address, isConnected } = useAccount();

    useEffect(() => {
        fetch("http://localhost:3001/api/get-pool-data")
            .then(r => r.json())
            .then(d => setPools(d.pools || []))
            .catch(() => setPools([]))
            .finally(() => setLoading(false));
    }, []);

    // Placeholder yield history (grows as real events come in)
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
                    <p className="text-slate-500 mt-1">Your Cashflow Token holdings and live yield — read directly from BSC Testnet.</p>
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
                            <div className="text-sm font-medium text-slate-500">Portfolio</div>
                            <div className="font-display text-2xl font-bold text-foreground">Live On-chain</div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate">{address}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border border-surface-border bg-surface shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Active Pools</div>
                            <div className="font-display text-2xl font-bold text-foreground">{pools.filter(p => p.poolAddress).length}</div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500">Token balances read per pool below</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border border-surface-border bg-surface shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">Protocol</div>
                        <div className="font-display text-3xl font-bold text-foreground">BNB Testnet</div>
                        <div className="text-xs text-slate-500 mt-1">All transactions live on-chain</div>
                    </div>
                    <a href="https://testnet.bscscan.com" target="_blank" rel="noopener noreferrer"
                        className="w-full mt-4 py-2 border border-primary text-primary rounded-lg text-sm font-bold hover:bg-primary/5 transition-colors text-center flex items-center justify-center gap-2">
                        <ExternalLink className="h-4 w-4" /> View on BscScan
                    </a>
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
                        <div className="p-12 text-center text-slate-500 animate-pulse">Reading on-chain balances...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-background border-b border-surface-border text-xs uppercase tracking-wider text-slate-500">
                                        <th className="p-4 font-medium">Pool Asset</th>
                                        <th className="p-4 font-medium">Invested (USDT)</th>
                                        <th className="p-4 font-medium">Yield Pending</th>
                                        <th className="p-4 font-medium">Est. APY</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border text-sm">
                                    {pools.filter(p => p.poolAddress).map(pool => (
                                        <InvestmentRow
                                            key={pool.id}
                                            pool={pool}
                                            investorAddress={address!}
                                        />
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 text-xs text-center text-slate-500 border-t border-surface-border">
                                Only pools with a non-zero token balance are shown. Invest in a pool on the <Link href="/explore" className="text-primary hover:underline">Explore page</Link>.
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-1 gap-8">
                    <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-sm">
                        <h3 className="font-display font-medium text-foreground mb-2">Cumulative Yield History</h3>
                        <p className="text-xs text-slate-500 mb-6">Populates as revenue events are submitted and distributed on-chain.</p>
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
                        <h3 className="font-display font-medium text-foreground mb-2">Portfolio Allocation</h3>
                        <p className="text-xs text-slate-500 mb-6">Your token balances across active pools.</p>
                        <div className="h-64">
                            <PortfolioAllocationChart pools={pools.filter(p => p.poolAddress)} investorAddress={address!} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
