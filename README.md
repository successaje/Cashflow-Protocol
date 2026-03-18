<div align="center">
  <img src="./frontend/public/images/logo-icon-color.svg" alt="Cashflow Protocol Logo" width="120" />
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
- [License](#-license)

---

## 🚨 The Problem
Traditional brick-and-mortar and recurring-revenue businesses (SaaS, logistics, retail) often struggle to access **affordable, upfront growth capital**. Traditional banking facilities are slow, require collateral that outpaces the loan size, and cut expanding businesses out from reaching their potential. 

However, many of these businesses have incredibly strong, provable, and consistent monthly recurring revenue (MRR) or point-of-sale foot traffic that remains untampered and untapped.

## 💡 The Solution
**Cashflow Protocol** bridges off-chain economic activity with on-chain financial infrastructure. 

By utilizing the BNB Chain, verified real-world businesses can legally **tokenize a percentage of their future, on-chain verified revenue** in exchange for an instant injection of stablecoin (USDT) liquidity from Web3 lenders. Investors gain a sustainable, non-crypto-correlated yield directly tied to the success of tangible businesses.

---

## ⚙️ How It Works

1. **Business Onboarding**: A verified business requests funding (e.g., $50,000 for 3 new coffee shop locations) and offers 15% of gross revenue for the next 12 months.
2. **Factory Deployment**: The Business signs a Web3 transaction deploying an immutable `CashflowPool` isolated to their campaign via our Factory smart contract.
3. **Investor Funding**: Global liquidity providers browse the marketplace, review the business data, and deposit stablecoins (USDT) into the Smart Contract. Investors receive `CashflowToken`s representing their share of the pool.
4. **Oracle Distribution**: As the business operates in the real world, its integrated Point of Sale (POS) system pings our isolated Oracle. The Oracle automatically triggers the Smart Contract, bridging Fiat/Stablecoins into the pool, where logic algorithms split the yield mathematically amongst the `CashflowToken` holders. Investors claim their yield freely.

---

## 🌍 Live Deployments (BSC Testnet)

The Cashflow core infrastructure has been successfully deployed to the **Binance Smart Chain (BSC) Testnet**. You can view the fully functional contracts directly on the block explorer:

| Contract | Description | Address / Explorer Link |
| :--- | :--- | :--- |
| **Mock USDT** | A standard ERC-20 simulated stablecoin used for pool funding liquidity. | [`0xBdab08C6d27cb6C5aa751Bc512cbe998F9EB9fbE`](https://testnet.bscscan.com/address/0xBdab08C6d27cb6C5aa751Bc512cbe998F9EB9fbE) |
| **CashflowPoolFactory** | The immutable factory that deploys individual revenue pools for businesses. | [`0x7D3165C15690C5d51C4CEF975d2836c99237B3E3`](https://testnet.bscscan.com/address/0x7D3165C15690C5d51C4CEF975d2836c99237B3E3) |

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

## 📜 License
MIT License. See `LICENSE` for more information.
