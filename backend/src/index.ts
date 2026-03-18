import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { startOracle } from "./oracle";
import { ethers } from "ethers";


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
            durationDays
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
                durationDays
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
        res.json({ success: true, pools });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pools" });
    }
});

// API: Receive revenue data from external systems (POS/USSD webhook)
// In a real app, this would be authenticated
app.post("/api/submit-revenue", async (req, res) => {
    try {
        const { poolAddress, amount } = req.body;

        const event = await prisma.revenueEvent.create({
            data: {
                poolAddress,
                amount
            }
        });

        res.json({ success: true, event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit revenue" });
    }
});

// API: Get revenue history for a specific pool
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

// FAUCET: Mint 1,000 Mock USDT to the requesting wallet (dev/testnet only)
const USDT_ADDRESS = "0xBdab08C6d27cb6C5aa751Bc512cbe998F9EB9fbE";
const MOCK_USDT_ABI = [
    "function mint(address to, uint256 amount) external"
];

app.post("/api/faucet", async (req: express.Request, res: express.Response) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress || !walletAddress.startsWith("0x")) {
            res.status(400).json({ error: "Invalid wallet address." });
            return;
        }

        const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
        const usdt = new ethers.Contract(USDT_ADDRESS, MOCK_USDT_ABI, signer);

        const amount = ethers.parseUnits("1000", 18);
        const tx = await usdt["mint"](walletAddress, amount) as ethers.TransactionResponse;
        const txHash = tx.hash ?? "pending";
        await tx.wait();

        res.json({ success: true, txHash, amount: "1000 Mock USDT" });
    } catch (error: any) {
        console.error("Faucet error:", error);
        res.status(500).json({ error: "Faucet failed: " + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    startOracle();
});
