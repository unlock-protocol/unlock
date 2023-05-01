const { ethers, unlock, run } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // fetch chain info
  const chainId = await deployer.getChainId();
  const { unlockAddress, multisig, tokens } = unlock.networks[chainId];

  const USDC = tokens?.find((t) => t.symbol === 'USDC')

  if (!USDC) {
    console.log(`USDC undefined for network ${chainId}`)
    return
  }


  console.log(
    `Deploying CardPurchaser on chain ${chainId} (unlock: ${unlockAddress}, multisig: ${multisig}, USDC: ${USDC.address})`
  );
  const CardPurchaser = await ethers.getContractFactory(
    "CardPurchaser"
  );

  const cardPurchaser = await CardPurchaser.deploy(
    multisig,
    unlockAddress,
    USDC.address
  )
  console.log(`  cardPurchaser deployed at ${cardPurchaser.address}`);

  if (chainId !== 31337) {
    console.log(`   waiting for tx to be mined for contract verification...`)
    await cardPurchaser.deployTransaction.wait(5)

    await run('verify:verify', {
      address: cardPurchaser.address,
      constructorArguments: [
        multisig,
        unlockAddress,
        USDC.address
      ]
    })
  }


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
