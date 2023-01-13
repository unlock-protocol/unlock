const { ethers, upgrades } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const { getNetworkName } = require('../../helpers/network')

async function main(locksmiths) {

  const [deployer] = await ethers.getSigners()

  // fetch chain info
  const chainId = await deployer.getChainId()
  const networkName = getNetworkName(chainId)

  const KeyManager = await ethers.getContractFactory('KeyManager')
  const keyManager = await upgrades.deployProxy(KeyManager, [], {
    initializer: 'initialize()',
  })
  await keyManager.deployed()
  console.log(`> Deployed KeyManager on ${networkName} to ${keyManager.address}`)

  // Add locksmiths
  for (const locksmith of locksmiths) {
    await keyManager.addLocksmith(locksmith)
    console.log(`> Added ${locksmith} as signer on KeyManager`)
  }

  // Transfer ownership to multisig (based on networks package)
  if (networks[chainId.toString()].multisig) {
    await keyManager.transferOwnership(networks[chainId.toString()].multisig)
    console.log(`> Transfered ownership of KeyManager to ${networks[chainId.toString()].multisig}`)
  }

  // TODO: transfer proxy admin to multisig (based on networks package?)

  // TODO: verify?

  return keyManager.address
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
