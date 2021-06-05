module.exports = async ({
  getNamedAccounts,
  deployments
}) => {
  const { deploy } = deployments;
  const { unlockOwner } = await getNamedAccounts();

  // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
  await deploy('Migrations', {
    from: unlockOwner,
    // gasLimit: 4000000,
    args: [],
    log: true
  });
};

// const { ethers, upgrades } = require("hardhat");

// async function main() {
  
//   // Deploying
//   const Migrations = await ethers.getContractFactory('Migrations');
//   const migrations = await Migrations.deploy();

//   await migrations.deployed();

//   console.log("Migrations deployed to:", migrations.address);

// }


// main()
//   .then(() => process.exit(0))
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });