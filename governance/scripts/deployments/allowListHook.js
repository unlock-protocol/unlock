const {
  getNetwork,
  PERMIT2_ADDRESS,
  deployContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  // fetch chain info

  const { id: chainId } = await getNetwork()

  console.log(`Deploying AllowListHook to ${chainId}`)

  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'AllowListHook', subfolder: 'Hooks' },
  ])

  console.log(` waiting for tx to be mined for contract verification...`)
  const { address: swapperAddress } = await deployContract(qualifiedPath, [], {
    wait: 5,
  })

  console.log(`AllowListHook deployed at ${swapperAddress}`)
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
