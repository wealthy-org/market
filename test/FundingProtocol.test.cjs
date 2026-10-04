const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Pons Creator Fee Funding Protocol", function () {
  let deployer, creator, lender1, lender2, protocolTreasury, operator;
  let mockPons;
  let pool;
  let splitter;
  let escrow;
  let tokenAddress;
  const targetEth = ethers.parseEther("0.12"); // ~$300 at $2500/ETH
  const minContribution = ethers.parseEther("0.004"); // ~$10
  const duration = 24 * 3600; // 24 hours
  const capBps = 12000; // 1.20x cap
  const lenderShareBps = 7000; // 70%
  const creatorShareBps = 2500; // 25%

  beforeEach(async function () {
    [deployer, creator, lender1, lender2, protocolTreasury, operator] = await ethers.getSigners();
    tokenAddress = ethers.Wallet.createRandom().address;

    // 1. Deploy Mock Pons V2
    const MockPons = await ethers.getContractFactory("MockPonsV2");
    mockPons = await MockPons.deploy();
    await mockPons.waitForDeployment();

    // Creator launched token on Pons
    await mockPons.setInitialRecipient(tokenAddress, creator.address);
    expect(await mockPons.getCreatorFeeRecipient(tokenAddress)).to.equal(creator.address);

    // 2. Deploy FundingPool
    const FundingPool = await ethers.getContractFactory("FundingPool");
    pool = await FundingPool.deploy(
      tokenAddress,
      creator.address,
      await mockPons.getAddress(),
      protocolTreasury.address,
      operator.address,
      targetEth,
      minContribution,
      duration,
      capBps,
      lenderShareBps,
      creatorShareBps
    );
    await pool.waitForDeployment();
  });

  describe("1. Pool Funding & All-or-Nothing", function () {
    it("Should accept contributions and update lender shares", async function () {
      const contrib1 = ethers.parseEther("0.04");
      await pool.connect(lender1).contribute({ value: contrib1 });

      expect(await pool.totalFunded()).to.equal(contrib1);
      expect(await pool.contributions(lender1.address)).to.equal(contrib1);
      expect(await pool.status()).to.equal(0); // OPEN
    });

    it("Should refund 100% of funds if target not reached and deadline expires", async function () {
      const contrib1 = ethers.parseEther("0.04");
      await pool.connect(lender1).contribute({ value: contrib1 });

      // Fast forward 25 hours past deadline
      await time.increase(25 * 3600);

      const balBefore = await ethers.provider.getBalance(lender1.address);
      const tx = await pool.connect(lender1).refund();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balAfter = await ethers.provider.getBalance(lender1.address);

      expect(balAfter + gasCost - balBefore).to.equal(contrib1);
      expect(await pool.contributions(lender1.address)).to.equal(0);
    });

    it("Should automatically finalize pool and deploy Splitter & Escrow when target is reached", async function () {
      const contrib1 = ethers.parseEther("0.04");
      const contrib2 = ethers.parseEther("0.08"); // 0.04 + 0.08 = 0.12 (Exact target!)

      await pool.connect(lender1).contribute({ value: contrib1 });
      await pool.connect(lender2).contribute({ value: contrib2 });

      expect(await pool.status()).to.equal(1); // FILLED
      expect(await pool.totalFunded()).to.equal(targetEth);

      const splitterAddress = await pool.splitter();
      const escrowAddress = await pool.escrow();

      expect(splitterAddress).to.not.equal(ethers.ZeroAddress);
      expect(escrowAddress).to.not.equal(ethers.ZeroAddress);

      // Verify Escrow received the full 0.12 ETH
      expect(await ethers.provider.getBalance(escrowAddress)).to.equal(targetEth);
    });

    it("Should refund excess payment if user contributes more than remaining target", async function () {
      const contrib1 = ethers.parseEther("0.10");
      await pool.connect(lender1).contribute({ value: contrib1 });

      // Only 0.02 ETH needed to hit 0.12. Lender2 sends 0.05 ETH
      const balBefore = await ethers.provider.getBalance(lender2.address);
      const tx = await pool.connect(lender2).contribute({ value: ethers.parseEther("0.05") });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balAfter = await ethers.provider.getBalance(lender2.address);

      // Lender2 should only have spent 0.02 ETH (plus gas)
      const spent = balBefore - balAfter - gasCost;
      expect(spent).to.equal(ethers.parseEther("0.02"));
      expect(await pool.totalFunded()).to.equal(targetEth);
      expect(await pool.status()).to.equal(1); // FILLED
    });
  });

  describe("2. FinanceSplitter Fee Routing & 1.20x Repayment Cap", function () {
    beforeEach(async function () {
      // Fully fund pool
      await pool.connect(lender1).contribute({ value: ethers.parseEther("0.04") }); // 33.3% share
      await pool.connect(lender2).contribute({ value: ethers.parseEther("0.08") }); // 66.7% share

      const splitterAddress = await pool.splitter();
      const FinanceSplitter = await ethers.getContractFactory("FinanceSplitter");
      splitter = FinanceSplitter.attach(splitterAddress);

      // Creator transfers Pons fee recipient to the FinanceSplitter contract
      await mockPons.connect(creator).transferCreatorFeeRecipient(tokenAddress, splitterAddress);
      expect(await mockPons.getCreatorFeeRecipient(tokenAddress)).to.equal(splitterAddress);
    });

    it("Should route incoming fees: 70% to lenders, 25% to creator, 5% to protocol", async function () {
      // 0.10 ETH creator fees generated on Pons
      const feeAmount = ethers.parseEther("0.10");
      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: feeAmount });

      // Anyone calls claimPonsFees()
      await splitter.claimPonsFees();

      // Check lender shares: 70% of 0.10 ETH = 0.07 ETH total lender repayment
      expect(await splitter.totalLenderRepaid()).to.equal(ethers.parseEther("0.07"));
      expect(await splitter.creatorAccruedShare()).to.equal(ethers.parseEther("0.025"));
      expect(await splitter.protocolAccruedShare()).to.equal(ethers.parseEther("0.005"));

      // Lender 1 (1/3 share) should have ~0.02333 ETH claimable
      const l1Pending = await splitter.pendingRepayment(lender1.address);
      const l2Pending = await splitter.pendingRepayment(lender2.address);

      // L1 + L2 = 0.07 ETH
      expect(l1Pending + l2Pending).to.be.closeTo(ethers.parseEther("0.07"), ethers.parseEther("0.0001"));
    });

    it("Should allow lenders and creator to claim their shares", async function () {
      const feeAmount = ethers.parseEther("0.10");
      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: feeAmount });
      await splitter.claimPonsFees();

      const l1BalBefore = await ethers.provider.getBalance(lender1.address);
      const tx = await splitter.connect(lender1).claimRepayment();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const l1BalAfter = await ethers.provider.getBalance(lender1.address);

      const payout = l1BalAfter + gasCost - l1BalBefore;
      expect(payout).to.be.closeTo(ethers.parseEther("0.023333"), ethers.parseEther("0.0001"));
      expect(await splitter.pendingRepayment(lender1.address)).to.equal(0);
    });

    it("Should enforce 1.20x repayment cap and automatically return creator fee rights", async function () {
      // Principal is 0.12 ETH. 1.20x Cap = 0.144 ETH max lender repayment
      // To reach 0.144 ETH lender repayment at 70% share:
      // Total fees needed = 0.144 / 0.70 ≈ 0.2057 ETH
      const largeFee = ethers.parseEther("0.25");
      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: largeFee });
      await splitter.claimPonsFees();

      // Verify cap was hit
      expect(await splitter.status()).to.equal(1); // REPAID
      expect(await splitter.totalLenderRepaid()).to.equal(ethers.parseEther("0.144")); // Exactly 1.20x of 0.12 ETH

      // AUTOMATIC RETURN: Fee recipient must be transferred back to original creator!
      const currentRecipient = await mockPons.getCreatorFeeRecipient(tokenAddress);
      expect(currentRecipient).to.equal(creator.address);

      // Any subsequent fees streamed will now go 100% to creator
      await mockPons.simulateTradingFees(await splitter.getAddress(), { value: ethers.parseEther("0.05") });
      await splitter.claimPonsFees();
      expect(await splitter.totalLenderRepaid()).to.equal(ethers.parseEther("0.144")); // unchanged
    });
  });

  describe("3. CampaignEscrow", function () {
    it("Should release campaign funds to operator for DEX Screener execution", async function () {
      await pool.connect(lender1).contribute({ value: ethers.parseEther("0.12") });
      const escrowAddress = await pool.escrow();
      const CampaignEscrow = await ethers.getContractFactory("CampaignEscrow");
      escrow = CampaignEscrow.attach(escrowAddress);

      const opBalBefore = await ethers.provider.getBalance(operator.address);
      const tx = await escrow.connect(operator).releaseToOperator();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const opBalAfter = await ethers.provider.getBalance(operator.address);

      expect(opBalAfter + gasCost - opBalBefore).to.equal(targetEth);
      expect(await escrow.isExecuted()).to.be.true;
    });
  });
});
