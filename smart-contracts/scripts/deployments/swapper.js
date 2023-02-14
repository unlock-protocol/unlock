const { ethers, unlock } = require("hardhat");
const { PERMIT2_ADDRESS } = require("@uniswap/universal-router-sdk");

async function main() {
  const [deployer] = await ethers.getSigners();

  // fetch chain info
  const chainId = await deployer.getChainId();
  const { unlockAddress } = unlock.networks[chainId];

  console.log(
    `Deploying UnlockSwapPurchaser on chain ${chainId} (unlock: ${unlockAddress}) `
  );
  const UnlockSwapPurchaser = await ethers.getContractFactory(
    "UnlockSwapPurchaser"
  );

  const swapper = await UnlockSwapPurchaser.deploy(
    unlockAddress,
    PERMIT2_ADDRESS
  );

  console.log(`  swapper deployed at ${swapper.address}`);
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
