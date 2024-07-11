const { ethers } = require('hardhat')
const {
  copyAndBuildContractsAtVersion,
  deployUpgradeableContract,
} = require('@unlock-protocol/hardhat-helpers')

// This script will be called by the BVI Foundation UP issuer.
async function main() {
  const [signer] = await ethers.getSigners()
  const initialOwner = await signer.getAddress()

  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'UPToken', subfolder: 'UP' },
  ])
  const UPToken = await ethers.getContractFactory(qualifiedPath)

  await deployUpgradeableContract(UPToken, [initialOwner])
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
