<div align="center">
  <h1>Cashflow Protocol</h1>
  <p><strong>Institutional-grade decentralized finance (DeFi) for Real World Assets (RWAs).</strong> <br/> Tokenizing future revenue streams for real-world businesses on the BNB Chain.</p>
</div>

---

## 📖 Table of Contents
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [How It Works](#-how-it-works)
- [Live Deployments (BSC Testnet)](#-live-deployments-bsc-testnet)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Local Development Setup](#-local-development-setup)
- [Testing the Lifecycle](#-testing-the-full-lifecycle-end-to-end)
- [License](#-license)

---

## 🚨 The Problem
Traditional brick-and-mortar and recurring-revenue businesses (SaaS, logistics, retail) often struggle to access **affordable, upfront growth capital**. Traditional banking facilities are slow, require collateral that outpaces the loan size, and cut expanding businesses out from reaching their potential. 

However, many of these businesses have incredibly strong, provable, and consistent monthly recurring revenue (MRR) or point-of-sale foot traffic that remains untampered and untapped.

## 💡 The Solution
**Cashflow Protocol** bridges off-chain economic activity with on-chain financial infrastructure, prioritizing **trust-minimization** and **institutional-grade security**.

By utilizing the BNB Chain, verified real-world businesses can legally **tokenize a percentage of their future revenue** in exchange for instant stablecoin (USDT) liquidity. Unlike early DeFi protocols that rely on "trust-me-bro" reporting, Cashflow Protocol implements a **multi-layered security stack** (Staking, Verification, and Proofs) to protect investor capital from fraud and misreporting.

---

## ⚙️ How It Works

1. **Business Onboarding**: A business submits a funding request (e.g., $50k for 12 months) and provides social/web metadata for vetting.
2. **Mandatory Staking**: To prevent fraud, the business **must stake a 10% collateral (USDT)** upfront. This "Skin in the Game" is locked in the smart contract.
3. **Factory Deployment**: The Business signs a transaction deploying their immutable `CashflowPool`.
4. **Investor Funding**: Liquidity providers browse the marketplace, review the business's **verification status** and **collateral**, and deposit USDT.
5. **Oracle Distribution & Proofs**: As the business reports revenue, they **must provide evidence (POS logs/receipts)**. Our Oracle triggers the payout logic on-chain.
6. **Governance Safety**: If a business misbehaves, investors can trigger a dispute. If fraud is verified, the admin/DAO **slashes the business's collateral** to compensate investors.

---

## 🔐 Institutional-Grade Security (Phase 2)

We have evolved the protocol to meet the standards of institutional Web3 finance through four trust pillars:

### ✅ 1. Business Verification Layer
Every pool is vetting through a tiered verification process. Businesses must link their **Website and Twitter/X** identities, which are displayed as a "Verified" badge on the platform. This reduces the risk of anonymous "rug-pull" pools.

### 💰 2. Mandatory Collateral (Skin in the Game)
Scammers rarely risk their own money. We require every business to stake **10% of their target funding** as collateral. This stake is locked in the `CashflowPool` contract and serves as a first-loss buffer for investors.

### 🔍 3. Revenue Transparency & Proofs
Transparency isn't just a dashboard; it's evidence. Every revenue submission requires a **Proof URL** (e.g., bank statements, daily POS reports). Investors can audit these proofs directly from the pool's activity feed.

### ⚖️ 4. On-Chain Dispute & Slashing
The protocol includes a native dispute mechanism. Investors can flag a pool for potential fraud, triggering a manual review. If fraud is confirmed, the business's **staked collateral is slashed** and redistributed to investors, creating a mathematically enforced deterrent against dishonesty.

---

## 🌍 Live Deployments (BSC Testnet)

The Cashflow core infrastructure has been successfully deployed to the **Binance Smart Chain (BSC) Testnet**. You can view the fully functional contracts directly on the block explorer:

| Contract / Service | Description | Address / Explorer Link |
| :--- | :--- | :--- |
| **Backend API** | The central hub for pool metadata, revenue proofs, and Oracle automation. | [`https://homebaise-bot.onrender.com`](https://homebaise-bot.onrender.com) |
| **Mock USDT** | A standard ERC-20 simulated stablecoin used for pool funding liquidity. | [`0xBdab08C6d27cb6C5aa751Bc512cbe998F9EB9fbE`](https://testnet.bscscan.com/address/0xBdab08C6d27cb6C5aa751Bc512cbe998F9EB9fbE) |
| **CashflowPoolFactory V2 (Phase 2)** | *[NEW]* The upgraded factory featuring mandatory business staking and fraud reporting. | [`0xe2523BAAB0584EC44A4730526A6146620e692776`](https://testnet.bscscan.com/address/0xe2523BAAB0584EC44A4730526A6146620e692776) |
| **CashflowPoolFactory V1 (MVP)** | *[LEGACY]* The original factory, left active to demonstrate protocol progression. | [`0x7D3165C15690C5d51C4CEF975d2836c99237B3E3`](https://testnet.bscscan.com/address/0x7D3165C15690C5d51C4CEF975d2836c99237B3E3) |

> **Note**: Interacting via the frontend requires you to have Testnet BNB (`tBNB`) in your wallet for gas.

---

## 🏗 Architecture & Tech Stack

This project is structured as a full-stack monorepo featuring three distinct environments:

### 1. Smart Contracts (`/contracts`)
*   **Framework**: Hardhat
*   **Language**: Solidity (v0.8.20)
*   **Standards**: OpenZeppelin (ERC-20, Initializable, ReentrancyGuard)
*   **Network**: BNB Smart Chain (BSC) Testnet

### 2. Off-Chain API & Oracle (`/backend`)
*   **Framework**: Node.js, Express.js (TypeScript)
*   **Database**: SQLite via **Prisma ORM**
*   **Role**: Handles Business onboarding metadata, verifies simulated POS revenue tracking, and operates the `node-cron` Oracle mechanism that signs `ethers.js` transactions back to the blockchain.

### 3. Web3 Frontend (`/frontend`)
*   **Framework**: Next.js (App Router), React
*   **Styling**: Tailwind CSS v4, Framer Motion (premium institutional DeFi aesthetic inspired by Centrifuge & Maple Finance).
*   **Web3 Hooks**: Wagmi, Viem, RainbowKit (WalletConnect).
*   **Data Vis**: Recharts for historical revenue and yield analytics.

---

## 🚀 Local Development Setup

To run the full stack locally, you will need three terminal windows:

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/cashflow.git
cd cashflow
```

### 2. Start the Backend API & Oracle
```bash
cd backend
npm install
npx prisma db push  # Initializes the local SQLite dev.db
npm run dev
```
> Server runs on `http://localhost:3001`

### 3. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
> Application runs on `http://localhost:3000`

### 4. Smart Contracts
```bash
cd contracts
npm install
npx hardhat test    # Run full test coverage
npx hardhat run scripts/deploy.ts --network bscTestnet # Trigger deployment
```

---

## 🧪 Testing the Full Lifecycle (End-to-End)

To test the complete workflow from creation to yield claiming on the live BSC Testnet:

1. **Connect & Get Funds**: Open the frontend, connect your wallet to BSC Testnet. Go to the Explore page, select any pool, and click the **"Get 1,000 Mock USDT"** Faucet button.
2. **Create a Pool**: Navigate to the **Business Dashboard** and fill out the "Create New Pool" form. Confirm the transaction to deploy your pool via the Factory contract.
3. **Invest**: Go to the **Explore** page, find your newly created pool, and click "Invest Now". Enter an amount, approve the USDT, and confirm the deposit transaction.
4. **Submit Revenue**: Go back to the **Business Dashboard**. Find your pool under "Active Live Pools" and enter a revenue amount (e.g., 5000), then click **"Submit"**.
5. **Withdraw Capital**: Once funding progress moves, you can click **"Withdraw Raised Funds"** on the Business Dashboard to pull liquidity into your operations.
6. **Oracle Processing**: Wait up to 1 minute. The backend cron job (Oracle) will detect any revenue submissions, approve the stablecoin, and trigger `depositRevenue()` on your pool contract automatically.
7. **Claim Yield**: Navigate to the **Investor Dashboard**. You will see your token balance and the live "Claimable Yield". Click the **Claim** button to withdraw your stablecoins directly from the smart contract!

---

## 👥 Core Team

1. **Success Aje (Finisher)** – Founder & Full-Stack Blockchain Developer
   - Responsible for smart contract development, backend architecture, and frontend integration
   - Experienced in building decentralized applications and Web3 systems
   - Co-founder of Kawak and GameBloc
   - GitHub: [https://ajesuccess.com](https://ajesuccess.com)

2. **Emmanuel Precious (Nailer)** – Frontend Engineer & Product Designer
   - Focuses on UI/UX design, frontend development, and product experience
   - Also contributes to testing and user flow optimization
   - GitHub: [https://github.com/Nailer](https://github.com/Nailer)

3. **Emmanuel Tobi (BoyofMars)** – Growth & Research Lead
   - Handles market research, user testing, and growth strategy
   - Supports product validation and user feedback loops
   - GitHub: [https://github.com/BoyofMars](https://github.com/BoyofMars)

4. **Oluwaseun (CryptoLabs)** – Community & Ecosystem Lead
   - Responsible for community growth, engagement, and onboarding testers
   - Experienced in Web3 community building and ecosystem development
   - X (Twitter): [https://x.com/0xaje_](https://x.com/0xaje_)

---

## 📜 License
MIT License. See `LICENSE` for more information.
