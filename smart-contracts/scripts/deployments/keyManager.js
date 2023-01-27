const { ethers, upgrades } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const { getNetworkName } = require('../../helpers/network')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

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
  const implementation = await getImplementationAddress(deployer.provider, keyManager.address)

  console.log(`> Deployed KeyManager on ${networkName} to ${keyManager.address} (impl: ${implementation})`)

  // Add locksmiths
  for (const locksmith of locksmiths) {
    await keyManager.addLocksmith(locksmith)
    console.log(`> Added ${locksmith} as signer on KeyManager`)
  }

  // Transfer ownership to multisig (based on networks package)
  const multisig = networks[chainId.toString()].multisig
  if (multisig) {
    await keyManager.transferOwnership(multisig)
    console.log(`> Transfered ownership of KeyManager to multisig ${multisig}`)

    // Transfer ownership of proxyadmin!
    const proxyAdmin = await upgrades.admin.getInstance()
    const proxyAdminOwner = await proxyAdmin.owner()
    if (proxyAdminOwner === deployer.address) {
      console.log(`> Proxy admin is owned by deployer, transfering to multisig ${multisig}`)
      await upgrades.admin.transferProxyAdminOwnership(multisig)
      console.log(`> Transfered proxy admin ownership to ${multisig}`)
    } else if (proxyAdminOwner === multisig) {
      console.log(`> Proxy admin is already onwed by multisig`)
    } else {
      console.log(`⚠️ Proxy admin is owned by ${proxyAdminOwner}! Make sure to transfer to multisig ${multisig}!`)
    }
  }
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
