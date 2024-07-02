const { ethers } = require('hardhat')

const {
  deployContract,
  deployUpgradeableContract,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

async function main() {
  // 1. deploys a proxy contract with an empty implementation
  console.log(`Deploying proxy with empty impl...`)
  const EmptyImpl = await ethers.getContractFactory('EmptyImpl')
  const { address: proxy } = await deployUpgradeableContract(EmptyImpl)

  // 2. deploys the UP token implementation
  console.log(`Deploying UPToken implementation...`)
  const [upTokenQualifiedPath] = await copyAndBuildContractsAtVersion(
    __dirname,
    [{ contractName: 'UPSwap', subfolder: 'UP' }]
  )
  const { address: impl } = await deployContract(upTokenQualifiedPath)

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
