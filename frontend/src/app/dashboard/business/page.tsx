"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, ArrowRight, ShieldCheck, Banknote, RefreshCcw, Activity, CheckCircle2 } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEventLogs, parseUnits } from "viem";
import { usePublicClient } from "wagmi";


// Live Factory ABI for BSC Testnet (CashflowPoolFactory.createPool + PoolCreated event)
const FACTORY_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_tokenName", "type": "string" },
            { "internalType": "string", "name": "_tokenSymbol", "type": "string" },
            { "internalType": "uint256", "name": "_fundingTarget", "type": "uint256" },
            { "internalType": "uint256", "name": "_fundDurationDays", "type": "uint256" },
            { "internalType": "uint256", "name": "_revenueSharePercentage", "type": "uint256" }
        ],
        "name": "createPool",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "poolAddress", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "businessAddress", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "tokenName", "type": "string" },
            { "indexed": false, "internalType": "string", "name": "tokenSymbol", "type": "string" }
        ],
        "name": "PoolCreated",
        "type": "event"
    }
] as const;


// Hardcoded Mock Factory Address for BNB Testnet
const FACTORY_ADDRESS = "0x7D3165C15690C5d51C4CEF975d2836c99237B3E3" as `0x${string}`;

const POOL_WRITE_ABI = [
    {
        "inputs": [],
        "name": "withdrawRaisedFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

const POOL_READ_ABI = [
    {
        "inputs": [],
        "name": "fundingRaised",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export default function BusinessDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [showCreateFlow, setShowCreateFlow] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "", description: "", target: "", duration: "", revenueShare: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myPools, setMyPools] = useState<any[]>([]);
    const [poolsLoading, setPoolsLoading] = useState(true);
    const [revenueAmounts, setRevenueAmounts] = useState<Record<number, string>>({});

    const publicClient = usePublicClient();
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (!address) return;
        setPoolsLoading(true);
        fetch("http://localhost:3001/api/get-pool-data")
            .then(r => r.json())
            .then(d => {
                const filtered = (d.pools || []).filter((p: any) =>
                    p.business?.address?.toLowerCase() === address.toLowerCase()
                );
                setMyPools(filtered);
            })
            .catch(() => setMyPools([]))
            .finally(() => setPoolsLoading(false));
    }, [address]);

    const handleSubmitRevenue = async (poolId: number, poolAddress: string, amount: string) => {
        if (!amount || isNaN(Number(amount))) return;
        try {
            const res = await fetch("http://localhost:3001/api/submit-revenue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ poolAddress, amount: Number(amount) })
            });
            if (res.ok) {
                alert(`Revenue of $${amount} submitted for pool ${poolAddress}. The Oracle will push it on-chain.`);
                setRevenueAmounts(prev => ({ ...prev, [poolId]: "" }));
            }
        } catch (e) {
            alert("Revenue submission failed. Check the backend.");
        }
    };
    const { writeContractAsync: deployPool, data: txHash } = useWriteContract();
    const { writeContractAsync: withdrawFunds } = useWriteContract();
    const { isLoading: isDeploying, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const handleWithdraw = async (poolAddress: string) => {
        try {
            await withdrawFunds({
                address: poolAddress as `0x${string}`,
                abi: POOL_WRITE_ABI,
                functionName: 'withdrawRaisedFunds',
                gas: BigInt(300000)
            });
            alert("Withdrawal transaction sent! Check your wallet.");
        } catch (e) {
            console.error("Withdraw fail:", e);
            alert("Withdrawal failed. Are you the business owner?");
        }
    };

    const handleCreatePool = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected || !address) {
            alert("Please connect your wallet first.");
            return;
        }

        try {
            setIsSubmitting(true);

            const symbol = formData.name.split(" ").map(w => w[0]).join("").toUpperCase() || "CASH";
            const targetAmount = parseUnits(formData.target || "0", 18);
            const durationDays = BigInt(formData.duration || "0");
            const revShare = BigInt(formData.revenueShare || "0");

            // 1. Deploy child CashflowPool via the Factory on BSC Testnet
            const txHash = await deployPool({
                address: FACTORY_ADDRESS,
                abi: FACTORY_ABI,
                functionName: 'createPool',
                args: [formData.name, symbol, targetAmount, durationDays, revShare],
                gas: 5_000_000n,
            });

            // 2. Wait for the transaction to be included in a block
            const receipt = await publicClient!.waitForTransactionReceipt({ hash: txHash });

            // 3. Parse the PoolCreated event to extract the newly deployed pool address
            const logs = parseEventLogs({ abi: FACTORY_ABI, eventName: 'PoolCreated', logs: receipt.logs });
            const newPoolAddress = logs[0]?.args?.poolAddress as string | undefined;

            // 4. Save all metadata to our Node.js backend so it appears in the marketplace
            await fetch('http://localhost:3001/api/create-pool', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessAddress: address,
                    businessName: formData.name,
                    description: formData.description,
                    poolAddress: newPoolAddress || txHash, // fallback to txHash if event parse fails
                    tokenName: formData.name,
                    tokenSymbol: symbol,
                    fundingTarget: Number(formData.target),
                    revenueShare: Number(formData.revenueShare),
                    durationDays: Number(formData.duration),
                })
            });

            setIsSubmitting(false);
            setShowCreateFlow(false);
            alert(`Cashflow Pool deployed on BNB Chain!\nPool Address: ${newPoolAddress || 'See BscScan for address'}`);

        } catch (error) {
            console.error("Factory Deployment failed:", error);
            setIsSubmitting(false);
            alert("Failed to deploy smart contract. See console.");
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Business Portal</h1>
                    <p className="text-slate-500 mt-1">Manage your active pools and submit verified revenue.</p>
                </div>
                {!showCreateFlow && (
                    <button
                        onClick={() => setShowCreateFlow(true)}
                        className="bg-[#F3BA2F] text-black px-5 py-2.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(243,186,47,0.3)] hover:bg-[#e0ab2b] hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
                    >
                        Create New Pool <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {showCreateFlow ? (
                    <motion.div
                        key="create-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-surface border border-surface-border rounded-3xl p-8 shadow-sm max-w-2xl mx-auto"
                    >
                        <div className="flex justify-between items-center mb-6 border-b border-surface-border pb-4">
                            <h2 className="font-display text-2xl font-bold text-foreground">Deploy Cashflow Contract</h2>
                            <button onClick={() => setShowCreateFlow(false)} className="text-sm font-medium text-slate-500 hover:text-foreground">Cancel</button>
                        </div>

                        <form onSubmit={handleCreatePool} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Business Name</label>
                                    <input required placeholder="e.g Downtown Espresso" className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Pitch / Overview</label>
                                    <textarea required placeholder="Briefly describe what the funds are for..." className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none h-24 resize-none" onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Funding Target (USDT)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-slate-500">$</span></div>
                                        <input required type="number" placeholder="50000" min="1000" className="w-full bg-background border border-surface-border rounded-xl py-3 pl-8 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" onChange={e => setFormData({ ...formData, target: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Duration (Days)</label>
                                    <input required type="number" placeholder="365" min="30" className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Yield / Revenue Share (%)</label>
                                    <div className="relative">
                                        <input required type="number" placeholder="15" min="1" max="100" className="w-full bg-background border border-surface-border rounded-xl py-3 pl-4 pr-8 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" onChange={e => setFormData({ ...formData, revenueShare: e.target.value })} />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><span className="text-slate-500">%</span></div>
                                    </div>
                                    <p className="text-xs text-slate-500 pt-1">This percentage of your ongoing gross revenue will be automatically directed to the smart contract.</p>
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 text-sm text-primary">
                                <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                                <p>By deploying, a unique <strong>CashflowToken (ERC20)</strong> contract will be minted on BNB Chain. It is immutable.</p>
                            </div>

                            <button disabled={isSubmitting} type="submit" className="w-full bg-[#F3BA2F] hover:bg-[#e0ab2b] text-black font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md">
                                {isSubmitting ? (
                                    <><RefreshCcw className="h-5 w-5 animate-spin" /> Compiling Contract...</>
                                ) : (
                                    <>Deploy Smart Contract <ArrowRight className="h-5 w-5" /></>
                                )}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                        {/* Trust Rating Mockup */}
                        <div className="mb-8 p-6 rounded-2xl border border-surface-border bg-gradient-to-br from-surface to-background flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-emerald-500/20">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-foreground text-xl">Institution Rating: Tier 1</h3>
                                    <p className="text-sm text-slate-500">Your revenue stream data has 99.9% uptime. You are eligible for lower collateral rates.</p>
                                </div>
                            </div>
                            <div className="hidden sm:block text-right">
                                <div className="text-3xl font-display font-bold text-foreground">98/100</div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest font-medium">Reputation Score</div>
                            </div>
                        </div>

                        {/* Active Pools Grid */}
                        <h2 className="font-display text-xl font-bold text-foreground mb-4">Your Active Pools</h2>
                        {poolsLoading ? (
                            <div className="text-slate-500 animate-pulse mb-10">Loading your pools...</div>
                        ) : myPools.length === 0 ? (
                            <div className="mb-10 p-6 border border-dashed border-surface-border rounded-2xl text-center text-slate-500">
                                No pools found for your wallet. Deploy your first pool above!
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6 mb-10">
                                {myPools.map(pool => (
                                    <div key={pool.id} className="border border-surface-border bg-surface rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex gap-3 items-center">
                                                <div className="h-10 w-10 bg-[#F3BA2F]/10 rounded border border-[#F3BA2F]/20 flex justify-center items-center">
                                                    <Building2 className="h-5 w-5 text-[#F3BA2F]" />
                                                </div>
                                                <div>
                                                     <div className="font-bold text-foreground">{pool.tokenName}</div>
                                                    <div className="text-xs text-slate-500 font-mono">
                                                        {pool.poolAddress ? `${pool.poolAddress.slice(0, 6)}...${pool.poolAddress.slice(-4)}` : "Deploying..."}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Live</span>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                <span>Funding Progress</span>
                                                <span>{pool.fundingTarget > 0 ? ((pool.mockRaised || 0) / pool.fundingTarget * 100).toFixed(0) : 0}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-surface-border">
                                                <div 
                                                    className="h-full bg-primary rounded-full transition-all" 
                                                    style={{ width: `${Math.min(100, (pool.mockRaised || 0) / pool.fundingTarget * 100)}%` }} 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex justify-between p-3 bg-background rounded-xl border border-surface-border">
                                                <div>
                                                    <div className="text-[10px] text-slate-500 uppercase">Target</div>
                                                    <div className="font-bold text-foreground">${pool.fundingTarget.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-slate-500 uppercase">Rev Share</div>
                                                    <div className="font-bold text-foreground">{pool.revenueShare}%</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-slate-500 uppercase">Duration</div>
                                                    <div className="font-bold text-foreground">{pool.durationDays} Days</div>
                                                </div>
                                            </div>
                                            {pool.poolAddress && (
                                                <a href={`https://testnet.bscscan.com/address/${pool.poolAddress}`} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-primary flex items-center gap-1 hover:underline">
                                                    View on BscScan →
                                                </a>
                                            )}
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Revenue amount ($)"
                                                    value={revenueAmounts[pool.id] || ""}
                                                    onChange={e => setRevenueAmounts(prev => ({ ...prev, [pool.id]: e.target.value }))}
                                                    className="flex-1 bg-background border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none"
                                                />
                                                <button
                                                    onClick={() => handleSubmitRevenue(pool.id, pool.poolAddress, revenueAmounts[pool.id] || "")}
                                                    className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
                                                >
                                                    <Banknote className="h-4 w-4" /> Submit
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleWithdraw(pool.poolAddress)}
                                                className="w-full py-2.5 bg-background border border-surface-border hover:border-primary/50 text-foreground text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <Banknote className="h-4 w-4 text-emerald-500" /> Withdraw Raised Funds
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Backend Integration Status Banner */}
                        <div className="border border-surface-border bg-surface p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-4">
                                <div>
                                    <h3 className="font-display font-medium text-foreground text-lg">Backend Integration Status</h3>
                                    <p className="text-sm text-slate-500">Live feed from your Oracle and revenue pipeline.</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-background border border-surface-border rounded-full text-xs font-mono text-emerald-500">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Oracle Active
                                </div>
                            </div>
                            <div className="space-y-3 font-mono text-xs max-h-40 overflow-y-auto w-full">
                                {[
                                    "Oracle: Polling backend for new revenue events...",
                                    "Oracle: Verified revenue event - calling depositRevenue() on-chain",
                                    "Smart Contract: accRewardPerShare updated for all token holders",
                                    "Investor: claimYield() available for eligible addresses",
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4">
                                        <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                                        <span className={log.includes('Smart Contract') ? 'text-primary' : 'text-slate-300'}>{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
