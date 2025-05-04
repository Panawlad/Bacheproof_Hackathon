const hre = require("hardhat");

async function main() {
  const PotholeRegistry = await hre.ethers.getContractFactory("PotholeRegistry");
  const potholeRegistry = await PotholeRegistry.deploy();
  await potholeRegistry.deployed();

  console.log("PotholeRegistry deployed to:", potholeRegistry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });