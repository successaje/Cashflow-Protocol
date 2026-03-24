import cron from "node-cron";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// In a real application, you'd store the ABI securely or import it from the contracts package.
const poolAbi = [
    "function depositRevenue(uint256 amount) external"
];
const stablecoinAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)"
];

const STABLECOIN_ADDRESS = process.env.STABLECOIN_ADDRESS || "0xBdab08C6d27cb6C5aa751Bc512cbe998F9EB9fbE";

export const startOracle = () => {
    // Run every minute for MVP demonstration purposes
    cron.schedule("* * * * *", async () => {
        console.log("Oracle Cron Job running... Checking for unprocessed revenue events.");

        try {
            if (!process.env.PRIVATE_KEY || !process.env.RPC_URL) {
                console.warn("Oracle skipped: Private Key or RPC URL not found.");
                return;
            }

            const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

            // Find unprocessed events
            const unprocessedEvents = await prisma.revenueEvent.findMany({
                where: { processed: false },
            });

            if (unprocessedEvents.length === 0) {
                return;
            }

            // Group events by pool manually to minimize transactions
            const poolTotals: { [poolAddress: string]: number } = {};
            const processedIds: string[] = [];

            unprocessedEvents.forEach((event: any) => {
                poolTotals[event.poolAddress] = (poolTotals[event.poolAddress] || 0) + event.amount;
                processedIds.push(event.id);
            });

            const stablecoin = new ethers.Contract(STABLECOIN_ADDRESS, stablecoinAbi, wallet);

            for (const [poolAddress, total] of Object.entries(poolTotals)) {
                console.log(`Pushing ${total} revenue to pool ${poolAddress}`);
                const amountWei = ethers.parseEther(total.toString());

                // Oracle must approve the pool to spend its stablecoin
                const approveTx = await stablecoin.approve(poolAddress, amountWei);
                await approveTx.wait();

                const poolContract = new ethers.Contract(poolAddress, poolAbi, wallet);
                const tx = await poolContract.depositRevenue(amountWei);
                await tx.wait();

                console.log(`Success! Transaction Hash: ${tx.hash}`);
            }

            // Mark all as processed
            await prisma.revenueEvent.updateMany({
                where: { id: { in: processedIds } },
                data: { processed: true },
            });

        } catch (error) {
            console.error("Oracle Error:", error);
        }
    });

    console.log("Oracle scheduler started.");
};
