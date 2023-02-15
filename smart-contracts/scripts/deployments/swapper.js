const { ethers, unlock, run } = require("hardhat");
const { PERMIT2_ADDRESS } = require("@uniswap/universal-router-sdk");

async function main() {
  const [deployer] = await ethers.getSigners();

  // fetch chain info
  const chainId = await deployer.getChainId();
  const { unlockAddress } = unlock.networks[chainId];

  console.log(
    `Deploying UnlockSwapPurchaser on chain ${chainId} (unlock: ${unlockAddress}, permit2: ${PERMIT2_ADDRESS}) `
  );
  const UnlockSwapPurchaser = await ethers.getContractFactory(
    "UnlockSwapPurchaser"
  );

  const swapper = await UnlockSwapPurchaser.deploy(
    unlockAddress,
    PERMIT2_ADDRESS
  );
  

  console.log(`  swapper deployed at ${swapper.address}`);
  
  console.log(`   waiting for tx to be mined for contract verification...`)
  await swapper.deployTransaction.wait(5)
  
  await run('verify:verify', {
    address: swapper.address,
    constructorArguments: [
      unlockAddress,
      PERMIT2_ADDRESS
    ]
  })
  
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
