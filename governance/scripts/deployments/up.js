const { ethers } = require('hardhat')
const {
  getNetwork,
  copyAndBuildContractsAtVersion,
  deployUpgradeableContract,
  deployContract,
} = require('@unlock-protocol/hardhat-helpers')
// const transferOwnership = require('../scripts/setters/transferOwnership')

async function main() {
  // deploys an empty UP contract to be filled later by actual implementation
  const EmptyImpl = await ethers.getContractFactory('EmptyImpl')
  const { hash: upProxyHash, address: upProxyAddress } =
    await deployUpgradeableContract(EmptyImpl)
  console.log(
    `UP Proxy (with empty impl) deployed at ${upProxyAddress} (tx: ${upProxyHash})`
  )

  // deploys the UP token implementation
  const [upTokenQualifiedPath] = await copyAndBuildContractsAtVersion(
    __dirname,
    [{ contractName: 'UPSwap', subfolder: 'UP' }]
  )
  const { hash, address: upImplAddress } =
    await deployContract(upTokenQualifiedPath)
  console.log(`UP impl  deployed at ${upImplAddress} (tx: ${hash})`)

  // transfer ownership to the DAO
  // const { multisig } = await getNetwork()
  // const transferOwnership

  return { upProxyAddress, upImplAddress }
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
