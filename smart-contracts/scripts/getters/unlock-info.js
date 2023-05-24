const { ethers, network } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const { getProxyAdminAddress } = require('../../helpers/deployments')
const getOwners = require('../multisig/owners')

async function main({ unlockAddress }) {
  const { chainId } = await ethers.provider.getNetwork()
  let safeAddress
  if (!unlockAddress) {
    ;({ unlockAddress, multisig: safeAddress } = networks[chainId])
  }

  const { name } = networks[chainId]
  const unlock = await ethers.getContractAt('Unlock', unlockAddress)
  const unlockOwner = await unlock.owner()
  const isMultisig = safeAddress === unlockOwner

  let proxyAdminAddress
  try {
    proxyAdminAddress = await getProxyAdminAddress({ network })
  } catch (error) {
    console.log(`ERROR: Failed to fetch ProxyAdmin address`)
  }

  let nbOwners
  try {
    nbOwners = (await getOwners({ safeAddress: unlockOwner })).length
  } catch (error) {
    console.log(`⚠️: Unlock owner is not a multisig !`)
  }

  if (nbOwners && !isMultisig) {
    console.log(
      `⚠️: Multisig in networks package does not match with Unlock owner!`
    )
  }

  // eslint-disable-next-line no-console
  console.log(
    `Unlock deployed on ${name} \n`,
    `-  address: ${unlockAddress} \n`,
    `-  unlockVersion: ${await unlock.unlockVersion()} \n`,
    `-  publicLockVersion: ${await unlock.publicLockLatestVersion()} \n`,
    `-  owner: ${unlockOwner} ${nbOwners ? `(${nbOwners} owners)` : ''}\n`,
    `-  proxyAdminAddress: ${proxyAdminAddress} \n`
  )
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
