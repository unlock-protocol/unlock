/**
 * This is a script to upgrade the protocol by sending to multisig
 * the instructions to upgrade Unlock proxy and set a new PublickLock template
 *
 * TODO:
 * - make addresses list programmatic (using deployment tasks directly)
 */

const { ethers } = require('hardhat')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { submitTx } = require('../multisig')
const deployImpl = require('./prepare')
const deployTemplate = require('../deployments/publicLock')

const { Unlock, PublicLock } = require('@unlock-protocol/contracts')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

async function main({
  publicLockVersion,
  unlockVersion,
  unlockImplAddress,
  publicLockAddress,
  submit = false,
} = {}) {
  const { id, multisig, unlockAddress } = await getNetwork()

  const unlock = await ethers.getContractAt(Unlock.abi, unlockAddress)
  const { interface: unlockInterface } = unlock

  // get latest versions if necessary
  if (!unlockVersion) {
    const unlockVersionPrev = await unlock.unlockVersion()
    unlockVersion = unlockVersionPrev + 1n
  }
  if (!publicLockVersion) {
    const template = await ethers.getContractAt(
      PublicLock.abi,
      await unlock.publicLockAddress()
    )
    const publicLockVersionPrev = await template.publicLockVersion()
    publicLockVersion = publicLockVersionPrev + 1n
  }

  console.log(
    `Deploying Unlock v${unlockVersion} and template v${publicLockVersion}`
  )

  // deploy contracts
  if (!unlockImplAddress) {
    unlockImplAddress = await deployImpl({
      proxyAddress: unlockAddress,
      contractName: 'Unlock',
      contractVersion: unlockVersion,
    })
  }
  if (!publicLockAddress) {
    publicLockAddress = await deployTemplate({ publicLockVersion })
  }

  // submit Unlock upgrade
  const proxyAdminAddress = await unlock.getAdmin()
  const { interface: proxyAdminInterface } = await ethers.getContractAt(
    proxyAdminABI,
    proxyAdminAddress
  )

  let [signer] = await ethers.getSigners()
  console.log(`Preparing contract upgrade on chain ${id}: 
Unlock v${unlockVersion}
  - unlock proxy: ${unlockAddress}
  - proxyAdmin: ${proxyAdminAddress}
  - unlock impl: ${unlockImplAddress}
PublicLock v${publicLockVersion}
  - publicLock: ${publicLockAddress}
Deployer: ${await signer.getAddress()}
  `)

  // check owner is multisig
  if (submit) {
    console.log(`Submiting upgrade to multisig: ${multisig}`)
    const unlockOwmer = await unlock.owner()
    assert(unlockOwmer === multisig, `Owner ${unlockOwmer} is not a multisig`)

    // upgrade first so we dont have a revert when template is initialized
    const calls = [
      {
        contractAddress: proxyAdminAddress,
        explainer: `upgrade(${unlockAddress},${unlockImplAddress})`,
        calldata: proxyAdminInterface.encodeFunctionData('upgrade', [
          unlockAddress,
          unlockImplAddress,
        ]),
      },
      {
        contractAddress: unlockAddress,
        explainer: `addLockTemplate(${publicLockAddress},${publicLockVersion})`,
        calldata: unlockInterface.encodeFunctionData('addLockTemplate', [
          publicLockAddress,
          publicLockVersion,
        ]),
      },
      {
        contractAddress: unlockAddress,
        explainer: `setLockTemplate(${publicLockAddress})`,
        calldata: unlockInterface.encodeFunctionData('setLockTemplate', [
          publicLockAddress,
        ]),
      },
    ]

    // submit the calls to the multisig
    const txArgs = {
      safeAddress: multisig,
      tx: calls,
    }
    console.log(txArgs)
    await submitTx(txArgs)
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
