/**
 * This is a script to upgrade the protocol by sending to multisig
 * the instructions to upgrade Unlock proxy and set a new PublickLock template
 *
 */

const { ethers } = require('hardhat')
const {
  getNetwork,
  getProxyAdminAddress,
} = require('@unlock-protocol/hardhat-helpers')
const { submitTx } = require('../multisig')
const deployUnlock = require('./prepare')
const deployTemplate = require('../deployments/publicLock')

const { UnlockV13, PublicLockV14 } = require('@unlock-protocol/contracts')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

async function main() {
  const { id, multisig, unlockAddress } = await getNetwork()

  if (!unlockAddress) {
    throw Error('Missing unlock address')
  }

  const unlockImplAddress = await deployUnlock({
    contractName: 'Unlock',
    contractVersion: 14,
    proxyAddress: unlockAddress,
  })
  const publicLockAddress = await deployTemplate({
    publicLockVersion: 15,
  })

  let [signer] = await ethers.getSigners()

  // submit template to Unlock
  const unlock = await ethers.getContractAt(UnlockV13.abi, unlockAddress)
  const { interface: unlockInterface } = unlock
  const template = await ethers.getContractAt(
    PublicLockV14.abi,
    publicLockAddress
  )

  const unlockVersion = await unlock.unlockVersion()
  const publicLockVersion = await template.publicLockVersion()

  // submit Unlock upgrade
  const proxyAdminAddress = await getProxyAdminAddress({ chainId: id })
  const { interface: proxyAdminInterface } = await ethers.getContractAt(
    proxyAdminABI,
    proxyAdminAddress
  )

  console.log(`Submitting contract upgrade on chain ${id}: 
  - unlock proxy: ${unlockAddress}
  - proxyAdmin: ${proxyAdminAddress}
  - unlock impl: ${unlockImplAddress}
  - publicLock: ${publicLockAddress}
  - multisig: ${multisig}
  - signer: ${signer.address}
  `)

  // check versions are correct in all contracts
  assert(unlockVersion === 12n, 'Wrong actual unlockVersion')
  assert(
    (await unlock.publicLockLatestVersion()) === 13n,
    'Wrong actual publicLockVersion'
  )
  assert(
    (await (
      await ethers.getContractAt(UnlockV13.abi, unlockImplAddress)
    ).unlockVersion()) === 13n,
    'Wrong new unlockVersion'
  )
  assert(publicLockVersion === 14n, 'Wrong new publicLockVersion')
  const unlockOwmer = await unlock.owner()
  assert(unlockOwmer === multisig, `Owner ${unlockOwmer} is not a multisig`)

  // upgrade first so we dont have a revert when
  // template is initialized
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
