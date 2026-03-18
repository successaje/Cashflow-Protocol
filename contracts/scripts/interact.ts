import { ethers } from "hardhat";

const FACTORY_ADDRESS = "0x7D3165C15690C5d51C4CEF975d2836c99237B3E3";
const USDT_ADDRESS = "0xBdab08C6d27cb6C5aa751Bc512cbe998F9EB9fbE";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Interacting with contracts using account:", deployer.address);

    const factoryContext = await ethers.getContractAt("CashflowPoolFactory", FACTORY_ADDRESS);

    console.log("1. Calling createPool on the Factory...");
    // Arguments: tokenName, tokenSymbol, fundingTarget (wei), durationDays, revenueShare
    const tx = await factoryContext.createPool(
        "First Live Business Pool",
        "LBP",
        ethers.parseUnits("50000", 18),
        365,
        15
    );
    console.log("Transaction Hash:", tx.hash);

    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction Confirmed in Block:", receipt?.blockNumber);

    // Let's also get the contract of the Mock USDT to check its state
    const usdtContract = await ethers.getContractAt("CashflowToken", USDT_ADDRESS);
    const symbol = await usdtContract.symbol();
    const balance = await usdtContract.balanceOf(deployer.address);
    console.log(`\n2. Mock USDT Information:`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Deployer Balance: ${ethers.formatUnits(balance, 18)} ${symbol}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
