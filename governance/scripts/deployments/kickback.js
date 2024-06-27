const {
  getNetwork,
  deployUpgradeableContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'Kickback', subfolder: 'utils' },
  ])

  const kickback = await deployUpgradeableContract(qualifiedPath, [])
  console.log(`  kickback deployed at ${kickback.address}`)
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
