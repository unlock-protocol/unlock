const {
  deployContract,
  getNetwork,
} = require('@unlock-protocol/hardhat-helpers')

async function main({
  bridge = '0x4200000000000000000000000000000000000010',
  remoteToken = '0x0B26203E3DE7E680c9749CFa47b7ea37fEE7bd98', // UDT on Sepolia
  tokenName = 'UDT (Bridged)',
  tokenSymbol = 'UDT.b',
} = {}) {
  const { name, id } = await getNetwork()
  // copyAndBuildContractsAtVersion,

  console.log(
    `Deploying ${tokenName} (${tokenSymbol}) bridge contract on ${name} (${id})`
  )

  const deployArgs = [bridge, remoteToken, tokenName, tokenSymbol]
  await deployContract('contracts/l2/UDTOptimism.sol:UDTOptimism', deployArgs)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
