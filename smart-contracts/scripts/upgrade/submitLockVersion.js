/**
 * Deploy latest PublicLock template and send the txs to the multisig
 * to add/set it to the Unlock contract.
 * If no existing address is specified, it will deploy the latest public lock.
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
const deployTemplate = require('../deployments/template')

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

  // if not address is specified, deploy the latest public lock
  if (!publicLockAddress) {
    publicLockAddress = await deployTemplate({})
  }

  // get multisig signer
  const [signer] = process.env.RUN_MAINNET_FORK
    ? [await getMultisigSigner(multisig)]
    : await ethers.getSigners()

  if (process.env.RUN_MAINNET_FORK) {
    // some ETH for the issuer
    await addSomeETH(signer.address)
  }

  const publicLock = await ethers.getContractAt('PublicLock', publicLockAddress)
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

  // send txs to multisig
  const txId1 = await submit('addLockTemplate', [publicLock.address, version])
  const txId2 = await submit('setLockTemplate', [publicLock.address])

  // check if multisig txs are valid
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
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
