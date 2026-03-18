import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy mock Stablecoin
    const ERC20Factory = await ethers.getContractFactory("CashflowToken");
    const stablecoin = await ERC20Factory.deploy("Mock USDT", "USDT", deployer.address);

    console.log("Mock USDT deployed to:", stablecoin.target);

    // Deploy Factory
    const Factory = await ethers.getContractFactory("CashflowPoolFactory");
    const oracleAddress = deployer.address; // For MVP testing, deployer is Oracle
    const factory = await Factory.deploy(stablecoin.target, oracleAddress);

    console.log("CashflowPoolFactory deployed to:", factory.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
