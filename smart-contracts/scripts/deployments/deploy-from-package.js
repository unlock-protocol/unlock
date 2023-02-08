const { ethers, upgrades, unlock } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const { getNetworkName } = require('../../helpers/network')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

async function main(owner) {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying from ${deployer.address}.`)

  // fetch chain info
  const chainId = await deployer.getChainId()
  const networkName = getNetworkName(chainId)

  await unlock.deployProtocol();
  const contract = await unlock.getUnlockContract();
  const implementation = await getImplementationAddress(deployer.provider, contract.address)

  console.log(`> Deployed Unlock on ${networkName} to ${contract.address} (impl: ${implementation})`)

  if (!owner) {
    owner = networks[chainId.toString()].owner
  }

  if (!owner) {
    console.warn(`Unlock Contract and proxy admin are owned by hot wallet ${deployer.address}. DO NOT USE IN PRODUCTION`)
  }
  // Transfer ownership to owner (based on networks package)
  if (owner) {
    await contract.transferOwnership(owner)
    console.log(`> Transfered ownership of KeyManager to owner ${owner}`)

    // Transfer ownership of proxyadmin!
    const proxyAdmin = await upgrades.admin.getInstance()
    const proxyAdminOwner = await proxyAdmin.owner()
    if (proxyAdminOwner === deployer.address) {
      console.log(`> Proxy admin is owned by deployer, transfering to owner ${owner}`)
      await upgrades.admin.transferProxyAdminOwnership(owner)
      console.log(`> Transfered proxy admin ownership to ${owner}`)
    } else if (proxyAdminOwner === owner) {
      console.log(`> Proxy admin is already onwed by owner`)
    } else {
      console.log(`⚠️ Proxy admin is owned by ${proxyAdminOwner}! Make sure to transfer to owner ${owner}!`)
    }
  }

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
