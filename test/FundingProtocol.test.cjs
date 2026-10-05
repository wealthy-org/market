const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// PoolStatus enum
const S = {
  DRAFT: 0,
  AWAITING_FEE_TRANSFER: 1,
  OPEN: 2,
  FILLED: 3,
  CAMPAIGN_PENDING: 4,
  ACTIVE_REPAYMENT: 5,
  REPAID: 6,
  EXPIRED: 7,
  CANCELLED: 8,
  REFUNDABLE: 9,
};
// FinanceSplitter.Health enum
const H = { PENDING: 0, ACTIVE: 1, STALLED: 2, PARTIAL: 3, UNRECOVERED: 4, REPAID: 5 };

describe("Pons Creator Fee Funding Protocol", function () {
  let deployer, creator, lender1, lender2, lender3, protocolTreasury, operator, stranger;
  let mockPons, pool, splitter, escrow, tokenAddress;

  const targetEth = ethers.parseEther("0.12"); // ~$300 at $2500/ETH
  const minContribution = ethers.parseEther("0.004"); // ~$10
  const maxContribution = ethers.parseEther("0.04"); // ~$100
  const window = 20 * 60; // 20 minutes
  const capBps = 12000; // 1.20x cap
  const lenderShareBps = 7500; // 75%
  const creatorShareBps = 2300; // 23% (protocol 2%)

  async function deployPool() {
    const FundingPool = await ethers.getContractFactory("FundingPool");
    const p = await FundingPool.deploy(
      tokenAddress,
      creator.address,
      await mockPons.getAddress(),
      protocolTreasury.address,
      operator.address,
      targetEth,
      minContribution,
      maxContribution,
      window,
      capBps,
      lenderShareBps,
      creatorShareBps
    );
    await p.waitForDeployment();
    return p;
  }

  async function openPool(p) {
    const sp = await p.splitter();
    await mockPons.connect(creator).transferCreatorFeeRecipient(tokenAddress, sp);
    await p.verifyFeeTransfer();
  }

  async function fillPool(p) {
    await p.connect(lender1).contribute({ value: ethers.parseEther("0.04") });
    await p.connect(lender2).contribute({ value: ethers.parseEther("0.04") });
    await p.connect(lender3).contribute({ value: ethers.parseEther("0.04") });
  }

  beforeEach(async function () {
    [deployer, creator, lender1, lender2, lender3, protocolTreasury, operator, stranger] =
      await ethers.getSigners();
    tokenAddress = ethers.Wallet.createRandom().address;

    const MockPons = await ethers.getContractFactory("MockPonsV2");
    mockPons = await MockPons.deploy();
    await mockPons.waitForDeployment();
    await mockPons.setInitialRecipient(tokenAddress, creator.address);

    pool = await deployPool();
  });

  describe("1. Lifecycle & fee-transfer gate", function () {
    it("Starts in AWAITING_FEE_TRANSFER and refuses contributions", async function () {
      expect(await pool.status()).to.equal(S.AWAITING_FEE_TRANSFER);
      await expect(
        pool.connect(lender1).contribute({ value: minContribution })
      ).to.be.revertedWith("Pool not open");
    });

    it("Cannot OPEN until the creator transferred fee rights to the splitter", async function () {
      await expect(pool.verifyFeeTransfer()).to.be.revertedWith("Fee recipient not splitter");
      await openPool(pool);
      expect(await pool.status()).to.equal(S.OPEN);
      expect(await pool.feeTransferVerified()).to.equal(true);
    });

    it("Rejects funding windows outside 10-30 minutes", async function () {
      const FundingPool = await ethers.getContractFactory("FundingPool");
      const args = (w) => [
        tokenAddress, creator.address, mockPons.target, protocolTreasury.address, operator.address,
        targetEth, minContribution, maxContribution, w, capBps, lenderShareBps, creatorShareBps,
      ];
      await expect(FundingPool.deploy(...args(5 * 60))).to.be.revertedWith(
        "Funding window must be 10-30 minutes"
      );
      await expect(FundingPool.deploy(...args(60 * 60))).to.be.revertedWith(
        "Funding window must be 10-30 minutes"
      );
    });

    it("Creator can cancel an unopened draft; strangers only after the fee window", async function () {
      await expect(pool.connect(stranger).cancel()).to.be.revertedWith(
        "Only creator until fee window ends"
      );
      await time.increase(61 * 60);
      await pool.connect(stranger).cancel();
      expect(await pool.status()).to.equal(S.CANCELLED);
    });

    it("Walks the full path to REPAID", async function () {
      await openPool(pool);
      await fillPool(pool);
      expect(await pool.status()).to.equal(S.CAMPAIGN_PENDING);

      const CampaignEscrow = await ethers.getContractFactory("CampaignEscrow");
      escrow = CampaignEscrow.attach(await pool.escrow());
      await escrow.connect(operator).releaseToOperator();
      expect(await pool.status()).to.equal(S.ACTIVE_REPAYMENT);

      const FinanceSplitter = await ethers.getContractFactory("FinanceSplitter");
      splitter = FinanceSplitter.attach(await pool.splitter());
      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: ethers.parseEther("0.25") });
      await splitter.claimPonsFees();

      await pool.syncRepaid();
      expect(await pool.status()).to.equal(S.REPAID);
    });
  });

  describe("2. Pool funding, bounds & all-or-nothing", function () {
    beforeEach(async function () {
      await openPool(pool);
    });

    it("Accepts contributions and tracks lender shares", async function () {
      await pool.connect(lender1).contribute({ value: ethers.parseEther("0.03") });
      expect(await pool.totalFunded()).to.equal(ethers.parseEther("0.03"));
      expect(await pool.contributions(lender1.address)).to.equal(ethers.parseEther("0.03"));
      expect(await pool.status()).to.equal(S.OPEN);
    });

    it("Rejects below-minimum contributions", async function () {
      await expect(
        pool.connect(lender1).contribute({ value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Below min contribution");
    });

    it("Caps each wallet at the maximum and refunds the excess", async function () {
      const balBefore = await ethers.provider.getBalance(lender1.address);
      const tx = await pool.connect(lender1).contribute({ value: ethers.parseEther("0.10") });
      const r = await tx.wait();
      const gas = r.gasUsed * r.gasPrice;
      const balAfter = await ethers.provider.getBalance(lender1.address);
      expect(balBefore - balAfter - gas).to.equal(maxContribution);
      expect(await pool.contributions(lender1.address)).to.equal(maxContribution);
      await expect(
        pool.connect(lender1).contribute({ value: minContribution })
      ).to.be.revertedWith("Wallet max reached");
    });

    it("Refunds 100% of funds (EXPIRED) if the target is missed", async function () {
      const c = ethers.parseEther("0.04");
      await pool.connect(lender1).contribute({ value: c });
      await time.increase(window + 60);

      const balBefore = await ethers.provider.getBalance(lender1.address);
      const tx = await pool.connect(lender1).refund();
      const r = await tx.wait();
      const gas = r.gasUsed * r.gasPrice;
      const balAfter = await ethers.provider.getBalance(lender1.address);

      expect(balAfter + gas - balBefore).to.equal(c);
      expect(await pool.status()).to.equal(S.EXPIRED);
    });

    it("Auto-finalizes when the target is reached: escrow funded, splitter activated", async function () {
      await fillPool(pool);
      expect(await pool.status()).to.equal(S.CAMPAIGN_PENDING);
      expect(await pool.totalFunded()).to.equal(targetEth);
      const escrowAddr = await pool.escrow();
      expect(await ethers.provider.getBalance(escrowAddr)).to.equal(targetEth);

      const FinanceSplitter = await ethers.getContractFactory("FinanceSplitter");
      const sp = FinanceSplitter.attach(await pool.splitter());
      expect(await sp.activated()).to.equal(true);
      expect(await sp.totalPoolShares()).to.equal(targetEth);
    });

    it("Creator cannot cancel once money is in the pool", async function () {
      await pool.connect(lender1).contribute({ value: ethers.parseEther("0.04") });
      await expect(pool.connect(creator).cancel()).to.be.revertedWith("Pool already funded");
    });
  });

  describe("3. FinanceSplitter routing (75/23/2) & 1.20x cap", function () {
    beforeEach(async function () {
      await openPool(pool);
      await fillPool(pool); // three equal 1/3 lenders
      const FinanceSplitter = await ethers.getContractFactory("FinanceSplitter");
      splitter = FinanceSplitter.attach(await pool.splitter());
    });

    it("Routes fees: 75% lenders, 23% creator, 2% protocol", async function () {
      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: ethers.parseEther("0.10") });
      await splitter.claimPonsFees();

      expect(await splitter.totalLenderRepaid()).to.equal(ethers.parseEther("0.075"));
      expect(await splitter.creatorAccruedShare()).to.equal(ethers.parseEther("0.023"));
      expect(await splitter.protocolAccruedShare()).to.equal(ethers.parseEther("0.002"));

      const p1 = await splitter.pendingRepayment(lender1.address);
      const p2 = await splitter.pendingRepayment(lender2.address);
      const p3 = await splitter.pendingRepayment(lender3.address);
      expect(p1 + p2 + p3).to.be.closeTo(ethers.parseEther("0.075"), ethers.parseEther("0.0001"));
    });

    it("Lets lenders claim their pro-rata share", async function () {
      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: ethers.parseEther("0.10") });
      await splitter.claimPonsFees();

      const before = await ethers.provider.getBalance(lender1.address);
      const tx = await splitter.connect(lender1).claimRepayment();
      const r = await tx.wait();
      const gas = r.gasUsed * r.gasPrice;
      const after = await ethers.provider.getBalance(lender1.address);
      expect(after + gas - before).to.be.closeTo(ethers.parseEther("0.025"), ethers.parseEther("0.0001"));
      expect(await splitter.pendingRepayment(lender1.address)).to.equal(0);
    });

    it("Enforces the 1.20x cap and returns fee rights to the creator", async function () {
      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: ethers.parseEther("0.25") });
      await splitter.claimPonsFees();

      expect(await splitter.status()).to.equal(1); // REPAID
      expect(await splitter.totalLenderRepaid()).to.equal(ethers.parseEther("0.144"));
      expect(await mockPons.getCreatorFeeRecipient(tokenAddress)).to.equal(creator.address);
      expect(await splitter.health()).to.equal(H.REPAID);
    });
  });

  describe("4. Fees before fill belong to the creator", function () {
    it("Credits pre-activation fees 100% to the creator, no lender accounting", async function () {
      await openPool(pool);
      const FinanceSplitter = await ethers.getContractFactory("FinanceSplitter");
      splitter = FinanceSplitter.attach(await pool.splitter());

      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: ethers.parseEther("0.05") });
      await splitter.claimPonsFees();

      expect(await splitter.creatorAccruedShare()).to.equal(ethers.parseEther("0.05"));
      expect(await splitter.totalLenderRepaid()).to.equal(0);
      expect(await splitter.health()).to.equal(H.PENDING);
    });
  });

  describe("5. CampaignEscrow (live-recipient release, proof, vendor refund)", function () {
    beforeEach(async function () {
      await openPool(pool);
      await fillPool(pool);
      const CampaignEscrow = await ethers.getContractFactory("CampaignEscrow");
      escrow = CampaignEscrow.attach(await pool.escrow());
      const FinanceSplitter = await ethers.getContractFactory("FinanceSplitter");
      splitter = FinanceSplitter.attach(await pool.splitter());
    });

    it("Releases campaign funds to the operator and moves pool to ACTIVE_REPAYMENT", async function () {
      const before = await ethers.provider.getBalance(operator.address);
      const tx = await escrow.connect(operator).releaseToOperator();
      const r = await tx.wait();
      const gas = r.gasUsed * r.gasPrice;
      const after = await ethers.provider.getBalance(operator.address);
      expect(after + gas - before).to.equal(targetEth);
      expect(await escrow.isExecuted()).to.equal(true);
      expect(await pool.status()).to.equal(S.ACTIVE_REPAYMENT);
    });

    it("Operator must publish campaign proof exactly once, only after release", async function () {
      const proof = ethers.keccak256(ethers.toUtf8Bytes("dexscreener-receipt"));
      await expect(
        escrow.connect(operator).submitCampaignProof(proof, "ipfs://receipt")
      ).to.be.revertedWith("Not executed");
      await escrow.connect(operator).releaseToOperator();
      await escrow.connect(operator).submitCampaignProof(proof, "ipfs://receipt");
      expect(await escrow.proofHash()).to.equal(proof);
      await expect(
        escrow.connect(operator).submitCampaignProof(proof, "ipfs://receipt")
      ).to.be.revertedWith("Proof already submitted");
    });

    it("Routes a vendor refund pro-rata to lenders through the splitter", async function () {
      await escrow.connect(operator).releaseToOperator();
      const refund = ethers.parseEther("0.03");
      await escrow.connect(operator).forwardVendorRefund({ value: refund });

      expect(await splitter.totalLenderRepaid()).to.equal(refund);
      const p1 = await splitter.pendingRepayment(lender1.address);
      expect(p1).to.be.closeTo(refund / 3n, ethers.parseEther("0.0001"));
    });

    it("Blocks release if fee rights are pulled away from the splitter", async function () {
      // simulate Pons-level recipient change away from the splitter
      await mockPons.forceRecipient(tokenAddress, stranger.address);
      await expect(escrow.connect(operator).releaseToOperator()).to.be.revertedWith(
        "Fee transfer not verified"
      );
      await pool.reportRecipientChange();
      expect(await pool.status()).to.equal(S.REFUNDABLE);

      const before = await ethers.provider.getBalance(lender1.address);
      const tx = await pool.connect(lender1).refund();
      const r = await tx.wait();
      const gas = r.gasUsed * r.gasPrice;
      const after = await ethers.provider.getBalance(lender1.address);
      expect(after + gas - before).to.equal(ethers.parseEther("0.04"));
    });

    it("Allows permissionless refund to the pool after the execution deadline", async function () {
      await time.increase(8 * 24 * 3600);
      await expect(escrow.connect(operator).releaseToOperator()).to.be.revertedWith(
        "Execution window expired"
      );
      await escrow.connect(lender1).refundAfterDeadline();
      expect(await escrow.isRefunded()).to.equal(true);
      expect(await pool.status()).to.equal(S.REFUNDABLE);
    });
  });

  describe("6. Default / health states", function () {
    it("Moves ACTIVE -> STALLED -> UNRECOVERED when fees stop, PARTIAL if some repaid", async function () {
      await openPool(pool);
      await fillPool(pool);
      const FinanceSplitter = await ethers.getContractFactory("FinanceSplitter");
      splitter = FinanceSplitter.attach(await pool.splitter());

      expect(await splitter.health()).to.equal(H.ACTIVE);
      await time.increase(4 * 24 * 3600);
      expect(await splitter.health()).to.equal(H.STALLED);
      await time.increase(6 * 24 * 3600);
      expect(await splitter.health()).to.equal(H.UNRECOVERED);

      // some fees arrive, then activity dies -> PARTIAL
      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: ethers.parseEther("0.02") });
      await splitter.claimPonsFees();
      expect(await splitter.health()).to.equal(H.ACTIVE);
      await time.increase(10 * 24 * 3600);
      expect(await splitter.health()).to.equal(H.PARTIAL);
    });
  });

  describe("7. FundingPoolFactory (eligibility + oracle sizing)", function () {
    let factory;

    beforeEach(async function () {
      const Deployer = await ethers.getContractFactory("FundingPoolDeployer");
      const deployerC = await Deployer.deploy();
      await deployerC.waitForDeployment();
      const Factory = await ethers.getContractFactory("FundingPoolFactory");
      factory = await Factory.deploy(
        await mockPons.getAddress(),
        protocolTreasury.address,
        operator.address,
        await deployerC.getAddress()
      );
      await factory.waitForDeployment();
    });

    const attest = (token, age = 20 * 60, traders = 30, fees = 2500, eth = true) =>
      factory.connect(operator).attestEligibility(token, age, traders, fees, eth);

    it("Rejects pool creation for tokens without an attestation", async function () {
      await expect(factory.connect(creator).createPool(tokenAddress, 0)).to.be.revertedWith(
        "Token not eligible"
      );
    });

    it("Enforces each eligibility threshold onchain", async function () {
      await expect(attest(tokenAddress, 10 * 60)).to.be.revertedWith("Token too new");
      await expect(attest(tokenAddress, 20 * 60, 5)).to.be.revertedWith("Not enough unique traders");
      await expect(attest(tokenAddress, 20 * 60, 30, 500)).to.be.revertedWith("Creator fees too low");
      await expect(attest(tokenAddress, 20 * 60, 30, 2500, false)).to.be.revertedWith(
        "ETH-paired tokens only"
      );
    });

    it("Only the operator can attest", async function () {
      await expect(
        factory.connect(stranger).attestEligibility(tokenAddress, 1200, 30, 2500, true)
      ).to.be.revertedWith("Only operator");
    });

    it("Creates a standardized pool for an eligible token (75/23/2, 20 min window)", async function () {
      await attest(tokenAddress);
      await factory.connect(creator).createPool(tokenAddress, 0);

      expect(await factory.totalPools()).to.equal(1);
      const [addr] = await factory.getAllPools();
      const FundingPool = await ethers.getContractFactory("FundingPool");
      const p = FundingPool.attach(addr);
      expect(await p.creator()).to.equal(creator.address);
      expect(await p.lenderShareBps()).to.equal(7500);
      expect(await p.creatorShareBps()).to.equal(2300);
      expect(await p.fundingWindow()).to.equal(20 * 60);
      expect(await p.status()).to.equal(S.AWAITING_FEE_TRANSFER);
    });

    it("Rejects callers who are not the Pons fee recipient", async function () {
      await attest(tokenAddress);
      await expect(factory.connect(stranger).createPool(tokenAddress, 0)).to.be.revertedWith(
        "Caller is not creator fee recipient"
      );
    });

    it("Expires attestations after the TTL", async function () {
      await attest(tokenAddress);
      await time.increase(61 * 60);
      await expect(factory.connect(creator).createPool(tokenAddress, 0)).to.be.revertedWith(
        "Token not eligible"
      );
    });

    it("Prices the target and contribution bounds from the ETH/USD feed", async function () {
      const Feed = await ethers.getContractFactory("MockEthUsdFeed");
      const feed = await Feed.deploy(250000000000n); // $2,500 with 8 decimals
      await factory.connect(operator).setEthUsdFeed(await feed.getAddress());

      // $299 / $2500 = 0.1196 ETH
      expect(await factory.quoteTargetEth()).to.equal(ethers.parseEther("0.1196"));

      await attest(tokenAddress);
      await factory.connect(creator).createPool(tokenAddress, 0);
      const [addr] = await factory.getAllPools();
      const FundingPool = await ethers.getContractFactory("FundingPool");
      const p = FundingPool.attach(addr);
      expect(await p.campaignTargetEth()).to.equal(ethers.parseEther("0.1196"));
      expect(await p.minContribution()).to.equal(ethers.parseEther("0.004")); // $10
      expect(await p.maxContribution()).to.equal(ethers.parseEther("0.04")); // $100
    });

    it("Refuses stale oracle prices", async function () {
      const Feed = await ethers.getContractFactory("MockEthUsdFeed");
      const feed = await Feed.deploy(250000000000n);
      await factory.connect(operator).setEthUsdFeed(await feed.getAddress());
      await time.increase(2 * 3600);
      await expect(factory.quoteTargetEth()).to.be.revertedWith("Stale oracle price");
    });
  });
});
