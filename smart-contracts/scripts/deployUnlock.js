const { ethers, upgrades } = require("hardhat");
async function main() {
  
  const [deployer] = await ethers.getSigners();
  
  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  
  // Deploying
  const Unlock = await ethers.getContractFactory('Unlock');
  const unlock = await Unlock.deploy();

  await unlock.deployed();

  console.log("Unlock deployed to:", unlock.address);
  
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });