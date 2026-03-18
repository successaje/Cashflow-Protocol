import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { startOracle } from "./oracle";

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

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    startOracle();
});
