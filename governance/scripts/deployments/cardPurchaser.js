const {
  getNetwork,
  deployContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  // fetch chain info
  const { id: chainId, unlockAddress, multisig, tokens } = await getNetwork()

  const USDC = tokens?.find((t) => t.symbol === 'USDC')

  if (!USDC) {
    console.log(`USDC undefined for network ${chainId}`)
    return
  }

  console.log(
    `Deploying CardPurchaser on chain ${chainId} (unlock: ${unlockAddress}, multisig: ${multisig}, USDC: ${USDC.address})`
  )
  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'CardPurchaser', subfolder: 'utils' },
  ])

  const cardPurchaser = await deployContract(qualifiedPath, [
    multisig,
    unlockAddress,
    USDC.address,
  ])
  console.log(`  cardPurchaser deployed at ${cardPurchaser.address}`)
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
