const { ethers, upgrades } = require("hardhat");
const { constants } = require('hardlydifficult-ethereum-contracts')

async function main() {

    const [deployer] = await ethers.getSigners();
    
    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );
    
    // get contract    
    const PublicLock = artifacts.require('PublicLock')

    // set max Gas
    txParams.gas = constants.MAX_GAS

    // default account used by ganache
    const unlockOwner = deployer

    // Create an instance of Unlock
    const unlockContract = await create(
      Object.assign(
        {
          contractAlias: 'Unlock',
          methodName: 'initialize',
          methodArgs: [unlockOwner],
        },
        options
      )
    )

  // Deploy lock template
  const lockTemplate = await PublicLock.new()
  await unlockContract.methods
    .setLockTemplate(lockTemplate.address)
    .send({ from: unlockOwner, gas: constants.MAX_GAS })
  

//   const unlock = await Unlock.deploy();

//   await unlock.deployed();

//   console.log("Unlock deployed to:", unlock.address);
//   console.log(unlock)

}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

