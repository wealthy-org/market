# market

> Decentralized Launch Funding Market for Web3 Token Launches & Creators on EVM.

A peer-to-pool pre-funding protocol that enables creators to raise launch liquidity and DEX deployment capital ($299 target in ETH) via all-or-nothing pools. Once funded, the protocol deploys a dedicated `FinanceSplitter` and `CampaignEscrow`, temporarily redirecting Pons V2 fee recipient rights to automate lender repayments (with a 1.20x fixed cap) and returning ownership back to the creator once satisfied.

---

## 🌟 Key Architecture & Mechanics

1. **All-or-Nothing Funding Pool (`FundingPool.sol`)**:
   - 24-hour target window to reach campaign goal ($299 in ETH).
   - Instant 100% refund for contributors if target is not met by the deadline.
   - Excess contribution protection with automatic immediate refunds.
   - Automatically deploys `FinanceSplitter` and `CampaignEscrow` upon pool completion.

2. **Pro-Rata Revenue Splitter (`FinanceSplitter.sol`)**:
   - **70%** stream to lenders until 1.20x cap is reached.
   - **25%** stream to creator.
   - **5%** protocol governance fee.
   - $O(1)$ gas accumulator distribution pattern (`accumulatedPerShare`) avoiding unbounded loop costs.
   - Automatically calls `transferCreatorFeeRecipient` on Pons V2 back to the creator as soon as the 1.20x cap is completed.

3. **Escrow Safeguard (`CampaignEscrow.sol`)**:
   - Holds campaign principal securely.
   - Governed release upon launch verification or automatic lender refund on failed launch.

4. **Web3 Frontend**:
   - Built with Next.js 15 (App Router) + TypeScript + Vanilla CSS styling.
   - Wagmi v2 + Viem integration with native support for Phantom EVM, MetaMask, Rabby, and Injected wallets.
   - Real-time balances, network switcher for Robinhood Chain (Testnet & Mainnet), pool investment forms, creator pool creation, and lender portfolio claim dashboards.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Web3 / Wallet:** Wagmi v2, Viem, TanStack Query
- **Smart Contracts:** Solidity `^0.8.24`, OpenZeppelin Contracts
- **Testing & Tooling:** Hardhat, Chai, Ethers

---

## 🚀 Getting Started

### 1. Installation

```bash
git clone https://github.com/wealthy-org/market.git
cd market
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure your RPCs / private keys if needed:

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Smart Contract Testing

Run the Hardhat test suite to verify pool mechanics, refunds, accumulator distribution, and Pons V2 handoff:

```bash
npx hardhat test
```

All 8 integration tests verify:
- All-or-nothing pool deadline and full refunds.
- Safe excess contribution refunds.
- Multi-lender $O(1)$ pro-rata fee distribution.
- 1.20x repayment cap enforcement.
- Automated Pons V2 creator fee recipient return upon cap completion.

---

## 📄 License

MIT
