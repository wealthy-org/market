const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("==========================================");
  console.log("Deploying Launch Funding Protocol with account:", deployer.address);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(bal), "ETH");
  console.log("==========================================");

  // 1. Deploy MockPonsV2 (for local / testnet environment)
  console.log("\n1. Deploying MockPonsV2...");
  const MockPons = await ethers.getContractFactory("MockPonsV2");
  const mockPons = await MockPons.deploy();
  await mockPons.waitForDeployment();
  const ponsAddress = await mockPons.getAddress();
  console.log("✓ MockPonsV2 deployed at:", ponsAddress);

  // 2. Deploy MockEthUsdFeed ($2500 with 8 decimals)
  console.log("\n2. Deploying MockEthUsdFeed...");
  const Feed = await ethers.getContractFactory("MockEthUsdFeed");
  const feed = await Feed.deploy(250000000000n);
  await feed.waitForDeployment();
  const feedAddress = await feed.getAddress();
  console.log("✓ MockEthUsdFeed deployed at:", feedAddress);

  // 3. Deploy FundingPoolDeployer (Bytecode split)
  console.log("\n3. Deploying FundingPoolDeployer...");
  const Deployer = await ethers.getContractFactory("FundingPoolDeployer");
  const poolDeployer = await Deployer.deploy();
  await poolDeployer.waitForDeployment();
  const deployerAddress = await poolDeployer.getAddress();
  console.log("✓ FundingPoolDeployer deployed at:", deployerAddress);

  // 4. Deploy FundingPoolFactory
  const treasuryAddress = deployer.address;
  const operatorAddress = deployer.address;

  console.log("\n4. Deploying FundingPoolFactory...");
  const Factory = await ethers.getContractFactory("FundingPoolFactory");
  const factory = await Factory.deploy(ponsAddress, treasuryAddress, operatorAddress, deployerAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✓ FundingPoolFactory deployed at:", factoryAddress);

  // Link oracle feed to factory
  await factory.setEthUsdFeed(feedAddress);
  console.log("✓ Linked Oracle Feed to Factory");

  // 5. Attest eligibility and create Sample Initial FundingPool
  const sampleTokenAddress = "0x9178B573219C55586BbAf51Ecb24ACfb27BB7681";
  await mockPons.setInitialRecipient(sampleTokenAddress, deployer.address);

  console.log("\n5. Attesting Eligibility for Sample Token...");
  // 30m age, 45 traders, $35 creator fees, ETH-pair
  await factory.attestEligibility(sampleTokenAddress, 1800, 45, 3500, true);
  console.log("✓ Eligibility attested onchain");

  console.log("\n6. Creating Sample FundingPool via Factory (20m window)...");
  const tx = await factory.createPool(sampleTokenAddress, 1200);
  await tx.wait();

  const pools = await factory.getAllPools();
  const samplePoolAddress = pools[0];
  console.log("✓ Sample FundingPool created at:", samplePoolAddress);

  const FundingPool = await ethers.getContractFactory("FundingPool");
  const samplePool = FundingPool.attach(samplePoolAddress);
  const splitterAddress = await samplePool.splitter();
  console.log("✓ FinanceSplitter deployed at:", splitterAddress);

  // 6. Save Deployment JSON
  const deployments = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    ponsV2: ponsAddress,
    oracleFeed: feedAddress,
    poolDeployer: deployerAddress,
    factory: factoryAddress,
    samplePool: samplePoolAddress,
    splitter: splitterAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "../src/data/deployments.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployments, null, 2));
  console.log("\n✓ Deployment data saved to:", outputPath);
  console.log("==========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
