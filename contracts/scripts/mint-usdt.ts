import { ethers } from "hardhat";

const USDT_ADDRESS = "0xBdab08C6d27cb6C5aa751Bc512cbe998F9EB9fbE";

// Change this to the wallet you want to fund with test USDT
const RECIPIENT = process.env.RECIPIENT || "";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Minting Mock USDT via owner account:", deployer.address);

    if (!RECIPIENT) {
        console.error("ERROR: Set RECIPIENT env variable to the wallet address you want to fund.");
        process.exit(1);
    }

    const usdt = await ethers.getContractAt("CashflowToken", USDT_ADDRESS);

    // Mint 10,000 USDT to the recipient
    const mintAmount = ethers.parseUnits("10000", 18);
    const tx = await usdt.mint(RECIPIENT, mintAmount);
    console.log("Mint tx submitted:", tx.hash);
    await tx.wait();

    const balance = await usdt.balanceOf(RECIPIENT);
    console.log(`Done! ${RECIPIENT} now has ${ethers.formatUnits(balance, 18)} Mock USDT`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
