const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("==========================================");
  console.log("Deploying Launch Funding Protocol with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  console.log("==========================================");

  // 1. Deploy MockPonsV2 (for local / testnet environment)
  console.log("\n1. Deploying MockPonsV2...");
  const MockPons = await ethers.getContractFactory("MockPonsV2");
  const mockPons = await MockPons.deploy();
  await mockPons.waitForDeployment();
  const ponsAddress = await mockPons.getAddress();
  console.log("✓ MockPonsV2 deployed at:", ponsAddress);

  // 2. Deploy FundingPoolFactory
  const treasuryAddress = deployer.address;
  const operatorAddress = deployer.address;

  console.log("\n2. Deploying FundingPoolFactory...");
  const Factory = await ethers.getContractFactory("FundingPoolFactory");
  const factory = await Factory.deploy(ponsAddress, treasuryAddress, operatorAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✓ FundingPoolFactory deployed at:", factoryAddress);

  // 3. Create Sample Initial FundingPool for $PEPE_PONS
  const sampleTokenAddress = "0x9178B573219C55586BbAf51Ecb24ACfb27BB7681";
  await mockPons.setInitialRecipient(sampleTokenAddress, deployer.address);

  console.log("\n3. Creating Sample FundingPool via Factory...");
  const targetEth = ethers.parseEther("0.12"); // ~$300
  const duration = 24 * 3600; // 24 hours

  const tx = await factory.createPool(sampleTokenAddress, targetEth, duration);
  const receipt = await tx.wait();

  const pools = await factory.getAllPools();
  const samplePoolAddress = pools[0];
  console.log("✓ Sample FundingPool created at:", samplePoolAddress);

  // 4. Save Deployment JSON
  const deployments = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    ponsV2: ponsAddress,
    factory: factoryAddress,
    samplePool: samplePoolAddress,
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
