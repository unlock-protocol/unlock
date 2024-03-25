// const { ethers } = require('hardhat')
const {
  deployContract,
  getNetwork,
} = require('@unlock-protocol/hardhat-helpers')

async function main({
  bridge = '0x4200000000000000000000000000000000000007',
  remoteToken = '0x0B26203E3DE7E680c9749CFa47b7ea37fEE7bd98', // '0x90DE74265a416e1393A450752175AED98fe11517',
  tokenName = 'Unlock Discount Token',
  tokenSymbol = 'UDT',
} = {}) {
  const { name, id } = await getNetwork()
  // copyAndBuildContractsAtVersion,

  console.log(
    `Deployin ${tokenName} (${tokenSymbol}) bridge contract on ${name} (${id})`
  )

  const deployArgs = [bridge, remoteToken, tokenName, tokenSymbol]
  await deployContract('UDTOptimism', deployArgs)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
