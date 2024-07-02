/**
 * This will deploy a porxied contract with an *empty* implementation to be set later on via
 * DAO proposal or multisig call
 */
const { ethers } = require('hardhat')
const {
  copyAndBuildContractsAtVersion,
  deployUpgradeableContract,
  deployContract,
} = require('@unlock-protocol/hardhat-helpers')

async function main({ contractName = 'UPSwap', subfolder = 'UP' } = {}) {
  // deploys a proxy contract with an empty implementation
  console.log(`Deploying proxy with empty impl...`)
  const EmptyImpl = await ethers.getContractFactory('EmptyImpl')
  const { address: proxy } = await deployUpgradeableContract(EmptyImpl)

  // deploys the UP token implementation
  console.log(`Deploying UPToken implementation...`)
  const [upTokenQualifiedPath] = await copyAndBuildContractsAtVersion(
    __dirname,
    [{ contractName, subfolder }]
  )
  const { address: impl } = await deployContract(upTokenQualifiedPath)

  console.log({
    proxy,
    impl,
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
