"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ShieldCheck, Calendar, Coins, ArrowUpRight, Clock, Building2, ExternalLink, ShieldAlert, History, Key, Users, TrendingUp, Wallet2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

const mockHistoryData = [
    { month: "Jan", revenue: 12000, yield: 1800 },
    { month: "Feb", revenue: 15500, yield: 2325 },
    { month: "Mar", revenue: 14800, yield: 2220 },
    { month: "Apr", revenue: 18900, yield: 2835 },
    { month: "May", revenue: 22000, yield: 3300 },
    { month: "Jun", revenue: 26500, yield: 3975 },
];

// No longer using mockActivityFeed, fetching real data now.

// Mock ABIs for MVP Integration
const ERC20_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "account", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

const POOL_ABI = [
    {
        "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
        "name": "invest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fundingRaised",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "name": "InvestmentMade",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "reportFraud",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// Hardcoded Mock USDT Address for BNB Testnet
const USDT_ADDRESS = "0xBdab08C6d27cb6C5aa751Bc512cbe998F9EB9fbE" as `0x${string}`;

export default function PoolDetail() {
    const { id } = useParams();
    const [investAmount, setInvestAmount] = useState("");
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState('overview');
    const [txStatus, setTxStatus] = useState<"idle" | "approving" | "depositing" | "success" | "error">("idle");
    const [pool, setPool] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [faucetStatus, setFaucetStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
    const [activityFeed, setActivityFeed] = useState<any[]>([]);

    const { writeContractAsync: writeApprove } = useWriteContract();
    const { writeContractAsync: writeDeposit } = useWriteContract();

    // The pool's smart contract address (from DB after deploy)
    const poolContractAddress = (pool?.poolAddress || ("0x" + "1".repeat(40))) as `0x${string}`;

    const { data: fundingRaisedData } = useReadContract({
        address: poolContractAddress,
        abi: POOL_ABI,
        functionName: 'fundingRaised',
        query: { enabled: poolContractAddress !== "0x" + "1".repeat(40) }
    });


    const handleFaucet = async () => {
        if (!address || faucetStatus === "loading") return;
        setFaucetStatus("loading");
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
            const res = await fetch(`${baseUrl}/api/faucet`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: address }),
            });
            if (res.ok) setFaucetStatus("done");
            else setFaucetStatus("error");
        } catch {
            setFaucetStatus("error");
        } finally {
            setTimeout(() => setFaucetStatus("idle"), 5000);
        }
    };

    // Fetch pool data from backend using the URL id param
    useEffect(() => {
        const fetchPool = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
                const res = await fetch(`${baseUrl}/api/get-pool-data`);
                if (res.ok) {
                    const data = await res.json();
                    const found = (data.pools || []).find((p: any) => String(p.id) === String(id));
                    if (found) {
                        setPool({
                            id: found.id,
                            business: {
                                name: found.tokenName || found.business?.name,
                                industry: found.business?.industry || "Real World Asset",
                                location: found.business?.location || "On-chain",
                                founded: found.business?.founded || "2024",
                                description: found.business?.description || "A verified revenue-generating business tokenizing their future cash flows.",
                            },
                            fundingTarget: found.fundingTarget,
                            raised: found.mockRaised ?? found.fundingTarget * 0.35,
                            revenueShare: found.revenueShare,
                            durationDays: found.durationDays,
                            tokenSymbol: found.tokenSymbol,
                            rating: found.riskScore || "B (Medium Risk)",
                            contractAddress: found.poolAddress || "Pending",
                            poolAddress: found.poolAddress,
                            verificationStatus: found.verificationStatus,
                            website: found.website,
                            twitter: found.twitter,
                            stakedAmount: found.stakedAmount
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to fetch pool data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPool();
    }, [id]);

    // Fetch real revenue events for the financials chart once pool loads
    useEffect(() => {
        if (!pool?.poolAddress || pool.poolAddress === "Pending") return;

        const fetchActivity = async () => {
            try {
                // 1. Fetch Consolidated Activity from Backend
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
                const res = await fetch(`${baseUrl}/api/pool-activity?poolAddress=${pool.poolAddress}`);
                const data = await res.json();
                
                if (data.success) {
                    const formattedActivity = data.activity.map((a: any) => ({
                        ...a,
                        time: new Date(a.timestamp).toLocaleDateString() + ' ' + new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }));
                    setActivityFeed(formattedActivity);

                    // 2. Fetch Historical Revenue for Charts
                    const revEvents = data.activity.filter((a: any) => a.type === 'yield').reverse();
                    if (revEvents.length > 0) {
                        const chartData = revEvents.map((e: any, i: number) => ({
                            month: `Rev ${i + 1}`,
                            revenue: e.amount / (pool.revenueShare / 100),
                            yield: e.amount,
                        }));
                        setRevenueHistory(chartData);
                    }
                }
            } catch (error) {
                console.error("Activity fetch failed:", error);
            }
        };

        fetchActivity();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchActivity, 30000);
        return () => clearInterval(interval);
    }, [pool]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-500 animate-pulse">Loading pool data...</div>
            </div>
        );
    }

    if (!pool) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-2">
                <div className="text-lg font-bold text-foreground">Pool not found.</div>
                <div className="text-slate-500 text-sm">It may have been removed or the ID is incorrect.</div>
            </div>
        );
    }

    const raised = fundingRaisedData ? Number(formatUnits(fundingRaisedData as bigint, 18)) : pool.raised;
    const progress = (raised / pool.fundingTarget) * 100;
    const isFullyFunded = progress >= 100;

    const handleInvest = async () => {
        if (!investAmount || isNaN(Number(investAmount)) || Number(investAmount) <= 0) return;

        try {
            setTxStatus("approving");
            const amountInWei = parseUnits(investAmount, 18); // Assuming 18 decimals for mock USDT

            // 1. Approve USDT
            await writeApprove({
                address: USDT_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [poolContractAddress, amountInWei],
                gas: BigInt(300000),
            });

            // 2. Wait for wallet confirmation before depositing
            setTxStatus("depositing");

            // 3. Invest into Pool (calls the `invest` function on CashflowPool)
            await writeDeposit({
                address: poolContractAddress,
                abi: POOL_ABI,
                functionName: 'invest',
                args: [amountInWei],
                gas: BigInt(500000),
            });

            // 4. Record investment in backend for the Activity Feed
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
                await fetch(`${baseUrl}/api/record-investment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        poolAddress: poolContractAddress,
                        investor: address,
                        amount: Number(investAmount)
                    })
                });
            } catch (e) {
                console.warn("Failed to record investment in backend:", e);
            }

            setTxStatus("success");
            setTimeout(() => setTxStatus("idle"), 5000);
            setInvestAmount(""); // Reset

        } catch (error) {
            console.error("Investment failed:", error);
            setTxStatus("error");
            setTimeout(() => setTxStatus("idle"), 5000);
        }
    };

    const handleReportFraud = async () => {
        if (!confirm("Are you sure you want to report this pool for fraud? This will trigger a protocol-level dispute.")) return;
        try {
            await writeDeposit({ // reusing writeDeposit hook for reportFraud
                address: poolContractAddress,
                abi: POOL_ABI,
                functionName: 'reportFraud',
                gas: BigInt(200000),
            });
            alert("Fraud report submitted to the blockchain. The protocol admin will review the evidence.");
        } catch (e) {
            console.error("Report fraud fail:", e);
            alert("Failed to report fraud. Check your wallet connection.");
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 font-medium">
                <a href="/explore" className="hover:text-foreground transition-colors">Explore Pools</a>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">{pool.business.name}</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* Left Column: Details & Charts */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Header Card */}
                    <div className="bg-surface border border-surface-border rounded-3xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-6 mb-8">
                            <div className="flex-shrink-0 h-24 w-24 bg-[#F3BA2F]/10 border border-[#F3BA2F]/20 rounded-2xl flex items-center justify-center">
                                <Building2 className="h-10 w-10 text-[#F3BA2F]" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                                    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                                        {pool.business.name}
                                    </h1>
                                    <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                        <ShieldCheck className="h-4 w-4" /> {pool.rating}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                                    <span className="uppercase tracking-wider">{pool.business.industry}</span>
                                    {pool.website && (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-surface-border" />
                                            <a href={pool.website} target="_blank" className="text-primary hover:underline">{pool.website.replace('https://', '')}</a>
                                        </>
                                    )}
                                    {pool.twitter && (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-surface-border" />
                                            <a href={`https://x.com/${pool.twitter}`} target="_blank" className="text-primary hover:underline">@{pool.twitter}</a>
                                        </>
                                    )}
                                    <span className="w-1.5 h-1.5 rounded-full bg-surface-border" />
                                    <span>{pool.business.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-background rounded-2xl p-4 border border-surface-border">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Coins className="h-3.5 w-3.5" /> Target</div>
                                <div className="font-display text-xl font-bold text-foreground">${pool.fundingTarget.toLocaleString()}</div>
                            </div>
                            <div className="bg-background rounded-2xl p-4 border border-surface-border">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><ArrowUpRight className="h-3.5 w-3.5" /> Est. APY</div>
                                <div className="font-display text-xl font-bold text-[#F3BA2F]">{pool.revenueShare}%</div>
                            </div>
                             <div className="bg-background rounded-2xl p-4 border border-surface-border relative overflow-hidden">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Stake</div>
                                <div className="font-display text-xl font-bold text-foreground">${(pool.stakedAmount || 0).toLocaleString()}</div>
                                <div className="absolute -right-1 -bottom-1 opacity-10"><Building2 className="h-12 w-12" /></div>
                            </div>
                            <div className="bg-background rounded-2xl p-4 border border-surface-border">
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Status</div>
                                <div className={`font-display text-sm font-bold uppercase tracking-widest ${pool.verificationStatus === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {pool.verificationStatus || 'Pending'}
                                </div>
                            </div>
                        </div>

                        {/* Smart Contract Interaction Metabar */}
                        <div className="flex items-center justify-between p-4 bg-background border border-surface-border rounded-xl">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-mono">
                                <Key className="h-4 w-4 text-slate-500" />
                                Contract: <span className="text-foreground">{pool.contractAddress}</span>
                            </div>
                            <a
                                href={pool.contractAddress && pool.contractAddress !== 'Pending' ? `https://testnet.bscscan.com/address/${pool.contractAddress}` : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                            >
                                View on BscScan <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-surface-border">
                        {['overview', 'financials', 'activity'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-foreground'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-surface border border-surface-border rounded-3xl p-8 shadow-sm"
                            >
                                <h3 className="font-display text-xl font-bold text-foreground mb-4">Business Overview</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                                    {pool.business.description}
                                </p>

                                <h3 className="font-display text-xl font-bold text-foreground mb-4">Risk Mitigation</h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-4">
                                        <ShieldCheck className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-foreground mb-1">Verifiable On-Chain Revenue</div>
                                            <div className="text-sm text-slate-500">All POS transactions are securely written to the blockchain via our Oracle network, preventing data tampering.</div>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <ShieldAlert className="h-6 w-6 text-[#F3BA2F] flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-foreground mb-1">Business Collateral Stake</div>
                                            <div className="text-sm text-slate-500">The business has staked <strong>${(pool.stakedAmount || 0).toLocaleString()} USDT</strong> as collateral. This can be slashed by governance in case of verified fraud.</div>
                                        </div>
                                    </li>
                                </ul>

                                <div className="mt-10 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <ShieldAlert className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Investor Protection</h4>
                                            <p className="text-xs text-slate-500 mt-1 mb-4">If you have evidence that this business is misreporting revenue or engaging in fraudulent activity, you can trigger a dispute.</p>
                                            <button 
                                                onClick={handleReportFraud}
                                                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/5"
                                            >
                                                Report Potential Fraud
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'financials' && (
                            <motion.div
                                key="financials"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-surface border border-surface-border rounded-3xl p-8 shadow-sm"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-display text-xl font-bold text-foreground">Historical Revenue & Yield</h3>
                                    <div className="flex items-center gap-4 text-xs font-medium">
                                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Gross Revenue</div>
                                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Distributed Yield</div>
                                    </div>
                                </div>

                                <div className="h-80 w-full mt-4">
                                    {revenueHistory.length === 0 && (
                                        <p className="text-xs text-slate-400 mb-2">No revenue events yet — submit revenue from the Business Dashboard to populate this chart.</p>
                                    )}
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueHistory.length > 0 ? revenueHistory : mockHistoryData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} dx={-10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)", borderRadius: "12px", color: "var(--foreground)", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                                itemStyle={{ fontWeight: "600" }}
                                            />
                                            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                            <Area yAxisId="left" type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'activity' && (
                            <motion.div
                                key="activity"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-surface border border-surface-border rounded-3xl p-8 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-display text-xl font-bold text-foreground">Recent Activity</h3>
                                    <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><Users className="h-4 w-4" /> 84 Investors</span>
                                </div>

                                <div className="space-y-4">
                                    {activityFeed.length === 0 ? (
                                        <div className="text-center py-10 text-slate-500 text-sm">No activity recorded yet for this pool.</div>
                                    ) : activityFeed.map((event) => (
                                        <div key={event.id} className="flex items-center justify-between p-4 bg-background border border-surface-border rounded-2xl hover:border-primary/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${event.type === 'yield' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                                    {event.type === 'yield' ? <TrendingUp className="h-5 w-5" /> : <Wallet2 className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{event.type === 'yield' ? 'Yield Distribution' : 'New Investment'}</div>
                                                    <div className="text-[10px] font-mono text-slate-500">{event.user}</div>
                                                    {event.proofUrl && (
                                                        <a href={event.proofUrl} target="_blank" className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-1">
                                                            <ExternalLink className="h-2 w-2" /> View Revenue Proof
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-display font-bold ${event.type === 'yield' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                    {event.type === 'yield' ? '+' : ''}${event.amount.toLocaleString()}
                                                </div>
                                                <div className="text-[10px] text-slate-500">{event.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Investment Panel */}
                <div className="relative">
                    <div className="sticky top-24 bg-surface border border-surface-border rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
                        <h3 className="font-display text-lg font-bold text-foreground mb-4">Funding Progress</h3>

                        {/* Assuming `useReadContract` is defined earlier in the component, e.g., `const { data: fundingRaised } = useReadContract(...)` */}
                        {/* And `raised` is derived from `fundingRaised` and formatted, e.g., `const raised = fundingRaised ? Number(formatUnits(fundingRaised, 6)) : 0;` */}
                        <div className="mb-6">
                            <div className="flex justify-between items-end">
                                <span className="font-display font-medium text-xl text-foreground">${raised.toLocaleString()}</span>
                                <span className="text-slate-500 text-sm font-medium mb-1">of ${pool.fundingTarget.toLocaleString()}</span>
                            </div>
                            <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-surface-border">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                                />
                            </div>
                            <div className="mt-3 flex justify-between items-center text-xs font-bold">
                                <span className="text-primary">{progress.toFixed(1)}% Funded</span>
                                <span className="text-slate-500 bg-background px-2 py-1 rounded border border-surface-border">{pool.fundingTarget - pool.raised} USDT Remaining</span>
                            </div>
                        </div>

                        <div className="border-t border-surface-border pt-6 mt-6">
                            <h4 className="font-medium text-foreground mb-4">Invest in {pool.business.name}</h4>

                            {!isConnected ? (
                                <div className="text-center py-6 bg-background border border-surface-border rounded-2xl mb-4">
                                    <Wallet2 className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-slate-500 mb-4 px-4">Connect your wallet to participate in this cashflow pool.</p>
                                    <div className="flex justify-center">
                                        <ConnectButton />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="relative mb-4">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-slate-500 font-medium">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={investAmount}
                                            onChange={(e) => setInvestAmount(e.target.value)}
                                            disabled={isFullyFunded}
                                            className="w-full bg-background border border-surface-border rounded-xl py-3 pl-8 pr-16 text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                                            <Image src="/images/tether-usdt-logo.png" alt="USDT" width={16} height={16} className="h-4 w-4 object-contain" />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-surface border border-surface-border px-2 py-1 rounded">USDT</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm md:text-xs lg:text-sm mb-6 px-1">
                                        <span className="text-slate-500">You will receive:</span>
                                        <span className="text-foreground font-bold font-mono bg-background p-1.5 rounded border border-surface-border">
                                            {investAmount || "0"} <span className="text-primary">{pool.tokenSymbol}</span>
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleFaucet}
                                        disabled={faucetStatus === "loading"}
                                        className="w-full mb-3 rounded-xl py-2.5 text-sm font-bold border border-[#F3BA2F]/50 text-[#F3BA2F] hover:bg-[#F3BA2F]/10 transition-colors disabled:opacity-50"
                                    >
                                        {faucetStatus === "loading" ? "Minting..." : faucetStatus === "done" ? "✓ 1,000 USDT Sent!" : faucetStatus === "error" ? "Faucet Error" : "Get 1,000 Test USDT"}
                                    </button>

                                    <button
                                        disabled={isFullyFunded || !investAmount || txStatus !== "idle"}
                                        onClick={handleInvest}
                                        className={`w-full rounded-xl py-4 text-base font-bold shadow-lg transition-all duration-200 ease-linear ${isFullyFunded
                                            ? 'bg-surface-border text-slate-400 cursor-not-allowed shadow-none'
                                            : txStatus === "approving" || txStatus === "depositing"
                                                ? 'bg-[#F3BA2F] text-black shadow-none animate-pulse'
                                                : txStatus === "success"
                                                    ? 'bg-emerald-500 text-white shadow-none'
                                                    : txStatus === "error"
                                                        ? 'bg-red-500 text-white shadow-none'
                                                        : 'bg-primary text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:bg-primary-hover hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {isFullyFunded ? 'Pool Fully Funded'
                                            : txStatus === "approving" ? 'Approving USDT...'
                                                : txStatus === "depositing" ? 'Confirming Deposit...'
                                                    : txStatus === "success" ? 'Investment Successful!'
                                                        : txStatus === "error" ? 'Transaction Failed'
                                                            : 'Approve & Invest'
                                        }
                                    </button>
                                </>
                            )}

                            <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-semibold">
                                <ShieldCheck className="h-3 w-3" /> Smart Contract Secured
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

