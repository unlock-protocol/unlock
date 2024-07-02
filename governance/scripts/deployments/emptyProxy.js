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
  // deploys an empty UP contract to be filled later by actual implementation
  console.log(`Deploying proxy with empty impl...`)
  const EmptyImpl = await ethers.getContractFactory('EmptyImpl')
  await deployUpgradeableContract(EmptyImpl)

  // deploys the UP token implementation
  console.log(`Deploying UPToken implementation...`)
  const [upTokenQualifiedPath] = await copyAndBuildContractsAtVersion(
    __dirname,
    [{ contractName, subfolder }]
  )
  await deployContract(upTokenQualifiedPath)
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
