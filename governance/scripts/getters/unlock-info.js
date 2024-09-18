const { ethers } = require('hardhat')
const { getNetwork, getUnlock } = require('@unlock-protocol/hardhat-helpers')
const { log } = require('../../helpers/logger')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')
const {
  PUBLICLOCK_LATEST_VERSION,
  UNLOCK_LATEST_VERSION,
} = require('@unlock-protocol/contracts')

const getOwners = require('../multisig/owners')

async function main({ unlockAddress, quiet = false }) {
  let safeAddress
  const { name } = await getNetwork()
  if (!unlockAddress) {
    ;({ unlockAddress, multisig: safeAddress } = await getNetwork())
  }

  const errorLog = (txt) => log(`[${name}]: ⚠️  ${txt}`, 'warning')

  const unlock = await getUnlock(unlockAddress)
  const unlockOwner = await unlock.owner()
  const isMultisig = safeAddress === unlockOwner

  const proxyAdminAddress = await unlock.getAdmin()

  const proxyAdmin = await ethers.getContractAt(
    proxyAdminABI,
    proxyAdminAddress
  )
  const proxyAdminOwner = await proxyAdmin.owner()

  if (proxyAdminOwner !== unlockOwner) {
    errorLog(`Unlock contract and ProxyAdmin have different owners`)
  }
  if (proxyAdminOwner !== safeAddress) {
    errorLog(`ProxyAdmin owner is not the team multisig`)
  }

  let nbOwners
  try {
    nbOwners = (await getOwners({ safeAddress: unlockOwner })).length
  } catch (error) {
    errorLog(`Unlock owner is not the team multisig`)
  }

  if (nbOwners && !isMultisig) {
    errorLog(`Multisig in networks package does not match with Unlock owner`)
  }

  const unlockVersion = await unlock.unlockVersion()
  const publicLockVersion = await unlock.publicLockLatestVersion()

  if (unlockVersion != UNLOCK_LATEST_VERSION) {
    errorLog(
      `Wrong Unlock version ${unlockVersion} (expected ${UNLOCK_LATEST_VERSION})`
    )
  }

  if (publicLockVersion != PUBLICLOCK_LATEST_VERSION) {
    errorLog(
      `Wrong PublicLock version ${publicLockVersion} (expected ${PUBLICLOCK_LATEST_VERSION})`
    )
  }

  if (!quiet) {
    console.log(
      `Unlock deployed on ${name} \n`,
      `-  address: ${unlockAddress} \n`,
      `-  unlockVersion: ${unlockVersion} \n`,
      `-  publicLockVersion: ${publicLockVersion} \n`,
      `-  owner: ${unlockOwner} ${nbOwners ? `(${nbOwners} owners)` : ''}\n`,
      `-  proxyAdminAddress: ${proxyAdminAddress} \n`,
      `-  multisig: ${safeAddress} \n`
    )
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
