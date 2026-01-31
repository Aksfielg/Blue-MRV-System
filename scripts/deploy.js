const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BlueMRV Smart Contracts to Polygon Mumbai...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy PlotRegistry
  console.log("\n📋 Deploying PlotRegistry...");
  const PlotRegistry = await ethers.getContractFactory("PlotRegistry");
  const plotRegistry = await PlotRegistry.deploy();
  await plotRegistry.deployed();
  console.log("✅ PlotRegistry deployed to:", plotRegistry.address);

  // Deploy CarbonToken
  console.log("\n🪙 Deploying CarbonToken...");
  const CarbonToken = await ethers.getContractFactory("CarbonToken");
  const carbonToken = await CarbonToken.deploy();
  await carbonToken.deployed();
  console.log("✅ CarbonToken deployed to:", carbonToken.address);

  // Deploy VoucherNFT
  console.log("\n🎫 Deploying VoucherNFT...");
  const VoucherNFT = await ethers.getContractFactory("VoucherNFT");
  const voucherNFT = await VoucherNFT.deploy();
  await voucherNFT.deployed();
  console.log("✅ VoucherNFT deployed to:", voucherNFT.address);

  // Deploy Marketplace
  console.log("\n🏪 Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(carbonToken.address, voucherNFT.address);
  await marketplace.deployed();
  console.log("✅ Marketplace deployed to:", marketplace.address);

  // Setup contract permissions
  console.log("\n🔧 Setting up contract permissions...");
  
  // Set marketplace as minter for CarbonToken
  await carbonToken.transferOwnership(marketplace.address);
  console.log("✅ CarbonToken ownership transferred to Marketplace");

  // Set marketplace contract in VoucherNFT
  await voucherNFT.setMarketplaceContract(marketplace.address);
  console.log("✅ Marketplace contract set in VoucherNFT");

  // Add deployer as verifier in PlotRegistry
  await plotRegistry.addVerifier(deployer.address);
  console.log("✅ Deployer added as verifier in PlotRegistry");

  // Approve deployer as vendor in Marketplace
  await marketplace.approveVendor(deployer.address);
  console.log("✅ Deployer approved as vendor in Marketplace");

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("PlotRegistry:", plotRegistry.address);
  console.log("CarbonToken:", carbonToken.address);
  console.log("VoucherNFT:", voucherNFT.address);
  console.log("Marketplace:", marketplace.address);

  console.log("\n📝 Environment Variables for .env:");
  console.log(`VITE_PLOT_REGISTRY_ADDRESS=${plotRegistry.address}`);
  console.log(`VITE_CARBON_TOKEN_ADDRESS=${carbonToken.address}`);
  console.log(`VITE_VOUCHER_NFT_ADDRESS=${voucherNFT.address}`);
  console.log(`VITE_MARKETPLACE_ADDRESS=${marketplace.address}`);

  // Verify contracts on Polygonscan (optional)
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("\n🔍 Verifying contracts on Polygonscan...");
    
    try {
      await hre.run("verify:verify", {
        address: plotRegistry.address,
        constructorArguments: [],
      });
      console.log("✅ PlotRegistry verified");
    } catch (error) {
      console.log("❌ PlotRegistry verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: carbonToken.address,
        constructorArguments: [],
      });
      console.log("✅ CarbonToken verified");
    } catch (error) {
      console.log("❌ CarbonToken verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: voucherNFT.address,
        constructorArguments: [],
      });
      console.log("✅ VoucherNFT verified");
    } catch (error) {
      console.log("❌ VoucherNFT verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: marketplace.address,
        constructorArguments: [carbonToken.address, voucherNFT.address],
      });
      console.log("✅ Marketplace verified");
    } catch (error) {
      console.log("❌ Marketplace verification failed:", error.message);
    }
  }

  console.log("\n🚀 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });