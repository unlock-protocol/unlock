const { ethers, upgrades } = require("hardhat");

async function main() {
  
  // Deploying
  const Migrations = await ethers.getContractFactory('Migrations');
  const migrations = await Migrations.deploy();

}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });