const { ethers } = require('hardhat')
const { getNetwork, getUnlock } = require('@unlock-protocol/hardhat-helpers')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

const getOwners = require('../multisig/owners')

async function main({ unlockAddress, quiet = false }) {
  let safeAddress
  const { name } = await getNetwork()
  if (!unlockAddress) {
    ;({ unlockAddress, multisig: safeAddress } = await getNetwork())
  }

  const errorLog = (txt) => console.log(`[${name}]: ⚠️  ${txt}`)

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
    errorLog(`Unlock contract and ProxyAdmin have different owners!`)
  }
  if (proxyAdminOwner !== safeAddress) {
    errorLog(`ProxyAdmin owner is not the team multisig!`)
  }

  let nbOwners
  try {
    nbOwners = (await getOwners({ safeAddress: unlockOwner })).length
  } catch (error) {
    errorLog(`Unlock owner is not the team multisig!`)
  }

  if (nbOwners && !isMultisig) {
    errorLog(`Multisig in networks package does not match with Unlock owner!`)
  }

  if (!quiet) {
    console.log(
      `Unlock deployed on ${name} \n`,
      `-  address: ${unlockAddress} \n`,
      `-  unlockVersion: ${await unlock.unlockVersion()} \n`,
      `-  publicLockVersion: ${await unlock.publicLockLatestVersion()} \n`,
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
