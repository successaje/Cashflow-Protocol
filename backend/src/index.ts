import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { startOracle } from "./oracle.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API: Onboard a new business & save pool metadata
app.post("/api/create-pool", async (req, res) => {
    try {
        const {
            businessAddress,
            businessName,
            description,
            poolAddress,
            tokenName,
            tokenSymbol,
            fundingTarget,
            revenueShare,
            durationDays,
            website,
            twitter,
            stakedAmount
        } = req.body;

        let business = await prisma.business.findUnique({
            where: { address: businessAddress }
        });

        if (!business) {
            business = await prisma.business.create({
                data: {
                    address: businessAddress,
                    name: businessName,
                    description: description,
                }
            });
        }

        const newPool = await prisma.pool.create({
            data: {
                poolAddress,
                businessId: business.id,
                tokenName,
                tokenSymbol,
                fundingTarget,
                revenueShare,
                durationDays,
                website,
                twitter,
                stakedAmount: Number(stakedAmount || 0),
                verificationStatus: "PENDING"
            }
        });

        res.json({ success: true, pool: newPool });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create pool" });
    }
});

// API: List all pools for the frontend marketplace
app.get("/api/get-pool-data", async (req, res) => {
    try {
        const pools = await prisma.pool.findMany({
            include: { business: true }
        });

        const poolsWithRisk = await Promise.all(pools.map(async (pool: any) => {
            if (!pool.poolAddress) return { ...pool, riskScore: "Unrated (Pending)" };
            
            const events = await prisma.revenueEvent.findMany({
                where: { poolAddress: pool.poolAddress }
            });
            
            let riskScore = "B (Medium Risk)";
            if (events.length === 0) {
                riskScore = "C (New / Unproven)";
            } else if (events.length >= 5) {
                riskScore = "A+ (Excellent)";
            } else if (events.length >= 2) {
                riskScore = "A (Low Risk)";
            }
            
            return { ...pool, riskScore };
        }));

        res.json({ success: true, pools: poolsWithRisk });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch pools" });
    }
});
app.post("/api/submit-revenue", async (req, res) => {
    try {
        const { poolAddress, amount, proofUrl } = req.body;
        const event = await prisma.revenueEvent.create({
            data: {
                poolAddress,
                amount,
                proofUrl
            }
        });
        res.json({ success: true, event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit revenue" });
    }
});

// ADMIN: Verify a pool (Mock admin for now)
app.post("/api/verify-pool", async (req, res) => {
    try {
        const { poolAddress, status } = req.body;
        const updatedPool = await prisma.pool.update({
            where: { poolAddress },
            data: { verificationStatus: status }
        });
        res.json({ success: true, pool: updatedPool });
    } catch (error) {
        res.status(500).json({ error: "Failed to update verification status" });
    }
});

app.get("/api/revenue-history", async (req, res) => {
    try {
        const { poolAddress } = req.query;
        const events = await prisma.revenueEvent.findMany({
            where: poolAddress ? { poolAddress: String(poolAddress) } : {},
            orderBy: { createdAt: "asc" }
        });
        res.json({ success: true, events });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch revenue history" });
    }
});

app.post("/api/record-investment", async (req, res) => {
    try {
        const { poolAddress, investor, amount } = req.body;
        const investment = await prisma.investment.create({
            data: {
                poolAddress,
                investor,
                amount: Number(amount)
            }
        });
        res.json({ success: true, investment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to record investment" });
    }
});

// API: Get investor statistics (Total Invested, Total Earned) - BACK TO DB-ONLY AS PER USER REQUEST
app.get("/api/investor-stats", async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ error: "address required" });

        const investorAddress = String(address);

        // 1. Get all investments from DB
        const investments = await prisma.investment.findMany({
            where: { investor: investorAddress }
        });

        const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);

        // 2. Calculate historical earned yield based on revenue events for invested pools
        let totalEarned = 0;
        const investedPoolAddrs = [...new Set(investments.map(i => i.poolAddress))];
        
        const pools = await prisma.pool.findMany({
            where: { poolAddress: { in: investedPoolAddrs } }
        });

        for (const pool of pools) {
            const poolEvents = await prisma.revenueEvent.findMany({
                where: { poolAddress: pool.poolAddress!, processed: true }
            });
            const userPrincipal = investments
                .filter(i => i.poolAddress === pool.poolAddress)
                .reduce((sum, i) => sum + i.amount, 0);
            
            const shareRatio = userPrincipal / pool.fundingTarget;
            const poolYield = poolEvents.reduce((sum, e) => sum + (e.amount * (pool.revenueShare / 100)), 0);
            
            totalEarned += poolYield * shareRatio;
        }

        res.json({
            success: true,
            totalInvested,
            totalEarned,
            poolCount: investedPoolAddrs.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch investor stats" });
    }
});

app.get("/api/pool-activity", async (req, res) => {
    try {
        const { poolAddress } = req.query;
        const investments = await prisma.investment.findMany({
            where: { poolAddress: String(poolAddress) },
            orderBy: { createdAt: "desc" },
            take: 10
        });
        const revenue = await prisma.revenueEvent.findMany({
            where: { poolAddress: String(poolAddress), processed: true },
            orderBy: { createdAt: "desc" },
            take: 10
        });

        const activity = [
            ...investments.map(i => ({
                id: i.id,
                type: 'investment',
                user: i.investor.slice(0, 6) + '...' + i.investor.slice(-4),
                amount: i.amount,
                timestamp: i.createdAt
            })),
            ...revenue.map(r => ({
                id: r.id,
                type: 'yield',
                user: 'Oracle Dispatch',
                amount: r.amount,
                timestamp: r.createdAt
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        res.json({ success: true, activity });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pool activity" });
    }
});

// Faucet for Test USDT
app.post("/api/faucet", async (req, res) => {
    try {
        const { address, walletAddress } = req.body;
        const targetAddress = address || walletAddress;
        
        if (!targetAddress) {
            return res.status(400).json({ error: "Address is required" });
        }

        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
        const usdtAbi = ["function mint(address to, uint256 amount) external"];
        const usdt = new ethers.Contract(process.env.STABLECOIN_ADDRESS!, usdtAbi, wallet);
        
        console.log(`Faucet: Minting 1000 Mock USDT to ${targetAddress} on BSC Testnet...`);
        const tx = await (usdt as any).mint(targetAddress, ethers.parseUnits("1000", 18));
        console.log(`Faucet: TX Submitted -> ${tx.hash}`);
        await tx.wait();
        console.log(`Faucet: Mined!`);
        res.json({ success: true, txHash: tx.hash });
    } catch (error: any) {
        console.error("\n=== FAUCET ERROR ====");
        console.error("Reason:", error.reason || "Unknown Revert Reason");
        console.error("Code:", error.code);
        console.error("Action:", error.action);
        console.error(error.message);
        console.error("=====================\n");
        res.status(500).json({ error: "Faucet failed. Check terminal logs." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    startOracle();
});
