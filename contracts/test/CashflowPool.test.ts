import { expect } from "chai";
import { ethers } from "hardhat";

describe("Cashflow Protocol", function () {
    let stablecoin: any;
    let factory: any;
    let pool: any;
    let owner: any;
    let business: any;
    let oracle: any;
    let investor1: any;
    let investor2: any;

    beforeEach(async function () {
        [owner, business, oracle, investor1, investor2] = await ethers.getSigners();

        // Deploy Mock ERC20 Stablecoin
        const ERC20Factory = await ethers.getContractFactory("CashflowToken"); // reuse token as mock stablecoin
        stablecoin = await ERC20Factory.deploy("Mock USDT", "USDT", owner.address);
        // Mint some stablecoin to investors
        await stablecoin.mint(investor1.address, ethers.parseEther("1000"));
        await stablecoin.mint(investor2.address, ethers.parseEther("1000"));
        await stablecoin.mint(oracle.address, ethers.parseEther("5000"));

        // Deploy Factory
        const Factory = await ethers.getContractFactory("CashflowPoolFactory");
        factory = await Factory.deploy(stablecoin.target, oracle.address);

        // Create a Pool
        const tx = await factory.connect(business).createPool(
            "Business XYZ Share",
            "BXYZ",
            ethers.parseEther("1000"), // target
            30, // days
            1000 // 10%
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find((e: any) => e.fragment?.name === 'PoolCreated');
        const poolAddress = event?.args[0];

        const Pool = await ethers.getContractFactory("CashflowPool");
        pool = Pool.attach(poolAddress);
    });

    it("Should allow investment up to the funding target", async function () {
        const investAmount = ethers.parseEther("600");
        await stablecoin.connect(investor1).approve(pool.target, investAmount);
        await pool.connect(investor1).invest(investAmount);

        expect(await pool.fundingRaised()).to.equal(investAmount);
        expect(await pool.isFunded()).to.be.false;

        // Investor 2 over-invests (target is 1000)
        const investAmount2 = ethers.parseEther("500");
        await stablecoin.connect(investor2).approve(pool.target, investAmount2);
        await pool.connect(investor2).invest(investAmount2); // Should only take 400

        expect(await pool.fundingRaised()).to.equal(ethers.parseEther("1000"));
        expect(await pool.isFunded()).to.be.true;

        // Investor 2 should have 600 USDT left (1000 - 400)
        expect(await stablecoin.balanceOf(investor2.address)).to.equal(ethers.parseEther("600"));
    });

    it("Should allow business to withdraw raised funds", async function () {
        const investAmount = ethers.parseEther("1000");
        await stablecoin.connect(investor1).approve(pool.target, investAmount);
        await pool.connect(investor1).invest(investAmount);

        await expect(pool.connect(business).withdrawRaisedFunds())
            .to.emit(pool, "FundsWithdrawnByBusiness")
            .withArgs(investAmount);

        expect(await stablecoin.balanceOf(business.address)).to.equal(investAmount);
    });

    it("Should allow oracle to deposit revenue and distribute it properly", async function () {
        const investAmount1 = ethers.parseEther("600");
        const investAmount2 = ethers.parseEther("400");

        await stablecoin.connect(investor1).approve(pool.target, investAmount1);
        await pool.connect(investor1).invest(investAmount1);

        await stablecoin.connect(investor2).approve(pool.target, investAmount2);
        await pool.connect(investor2).invest(investAmount2);

        // Business withdraws
        await pool.connect(business).withdrawRaisedFunds();

        // Oracle deposits 100 USDT as revenue
        const revenue = ethers.parseEther("100");
        await stablecoin.connect(oracle).approve(pool.target, revenue);
        await pool.connect(oracle).depositRevenue(revenue);

        // Claim yield
        await pool.connect(investor1).claimYield();
        await pool.connect(investor2).claimYield();

        // Investor1 60% of 100 = 60 USDT
        // Investor2 40% of 100 = 40 USDT
        // Initial balances were 1000. Investor1 invested 600 + 60 claim = 460
        expect(await stablecoin.balanceOf(investor1.address)).to.equal(ethers.parseEther("460"));
        // Initial: 1000. Invested 400 + 40 claim = 640
        expect(await stablecoin.balanceOf(investor2.address)).to.equal(ethers.parseEther("640"));
    });
});
