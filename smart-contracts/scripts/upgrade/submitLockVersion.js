/**
 * Send the txs to the multisig to add and set the new Lock template
 * to the Unlock contract.
 *
 * NB: You can test on mainnet (without the template being deployed) with:
 *
 * ```
 * RUN_MAINNET_FORK=1 yarn hardhat run scripts/upgrade/submitLockVersion.js
 * ```
 */
const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const submitTx = require('../multisig/submitTx')

const {
  addSomeETH,
  confirmMultisigTx,
  getMultisigSigner,
  deployLock,
} = require('../../test/helpers')

async function main({ publicLockAddress }) {
  // make sure we get the correct chain id on local mainnet fork
  const { chainId } = process.env.RUN_MAINNET_FORK
    ? { chainId: '1' }
    : await ethers.provider.getNetwork()

  const { unlockAddress, multisig } = networks[chainId]
  if (!publicLockAddress && !process.env.RUN_MAINNET_FORK) {
    throw new Error('Missing public lock address')
  }

  // get multisig signer
  const [signer] = process.env.RUN_MAINNET_FORK
    ? [await getMultisigSigner(multisig)]
    : await ethers.getSigners()

  let publicLock
  if (process.env.RUN_MAINNET_FORK) {
    // deploy latest public lock
    const PublicLock = await ethers.getContractFactory('PublicLock')
    publicLock = await PublicLock.deploy()
    await publicLock.deployed()

    // some ETH for the issuer
    await addSomeETH(signer.address)
  } else {
    publicLock = await ethers.getContractAt('PublicLock', publicLockAddress)
  }
  const version = await publicLock.publicLockVersion()

  console.log(`Setting PublicLock v${version} on network ${chainId}`)
  console.log(`Unlock: ${unlockAddress} - PublicLock ${publicLock.address}`)
  console.log(`Multisig: ${multisig} - Signer: ${signer.address}`)

  const submit = async (functionName, functionArgs) => {
    const tx1 = {
      contractName: 'Unlock',
      contractAddress: unlockAddress,
      functionName,
      functionArgs,
    }
    console.log(`submitting ${functionName} to multisig...`)
    console.log(functionArgs)

    const txId1 = await submitTx({
      safeAddress: multisig,
      tx: tx1,
      signer,
    })

    return txId1
  }

  // send txsx
  const txId1 = await submit('addLockTemplate', [publicLock.address, version])
  const txId2 = await submit('setLockTemplate', [publicLock.address])

  // validate multisig txs and test
  if (process.env.RUN_MAINNET_FORK) {
    console.log(`Signing multisigs: ${txId1} ${txId2}`)
    await confirmMultisigTx({
      transactionId: txId1,
      multisigAddress: multisig,
    })
    await confirmMultisigTx({
      transactionId: txId2,
      multisigAddress: multisig,
    })
    const unlock = await ethers.getContractAt('Unlock', unlockAddress)
    const lock = await deployLock({ unlock })
    console.log(`Lock ${await lock.name()} deployed at ${lock.address}.`)
  }
}

// execute as standalone
if (require.main === module) {
  main({})
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
