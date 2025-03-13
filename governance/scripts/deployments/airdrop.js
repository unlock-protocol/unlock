const {
  getNetwork,
  deployUpgradeableContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

// from https://go.chainalysis.com/chainalysis-oracle-docs.html
const chainalysisOracle = '0x3A91A31cB3dC49b4db9Ce721F50a9D076c8D739B'

async function main() {
  // fetch chain info
  const base = await getNetwork(8453)
  const { address: upAddress } = base.tokens.find(
    (token) => token.symbol === 'UP'
  )
  const { id: chainId } = await getNetwork()

  console.log(`Deploying UP Airdrops to ${chainId}`)

  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'Airdrops', subfolder: 'UP' },
  ])

  console.log(` waiting for tx to be mined for contract verification...`)
  const { address: airdropAddress } = await deployUpgradeableContract(
    qualifiedPath,
    [upAddress, chainalysisOracle],
    {
      wait: 5,
    }
  )

  console.log(`UP Airdrops deployed at ${airdropAddress}`)
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
