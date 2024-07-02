const { ethers } = require('hardhat')

const {
  deployContract,
  deployUpgradeableContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  // 1. deploys a proxy contract with an empty implementation
  console.log(`Deploying proxy with empty impl...`)
  const [emptyQualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'EmptyImpl', subfolder: 'utils' },
  ])
  const EmptyImpl = await ethers.getContractFactory(emptyQualifiedPath)
  const { address: proxy } = await deployUpgradeableContract(EmptyImpl)

  // 2. deploys the UP swap implementation
  console.log(`Deploying UPSwap implementation...`)
  const [upSwapQualifiedPath] = await copyAndBuildContractsAtVersion(
    __dirname,
    [{ contractName: 'UPSwap', subfolder: 'UP' }]
  )
  const { address: impl } = await deployContract(upSwapQualifiedPath)

  console.log({
    upSwapProxyAddress: proxy,
    upSwapImplAddress: impl,
  })
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
