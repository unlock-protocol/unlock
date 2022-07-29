/**
 * Deploy latest PublicLock template and send the txs to the multisig to add/set
 * it to the Unlock contract.
 *
 * ```
 * # If no existing address is specified, it will deploy the latest public lock.
 * yarn hardhat submit:version
 *
 * # with an existing address, contract gets deployed and specified
 * yarn hardhat submit:version --network rinkeby --public-lock-address <TEMPLATE_ADDRESS>
 * ```
 * NB: You can first test on mainnet to make sure the template is deploying correctly * :
 *
 * ```
 * RUN_MAINNET_FORK=1 hardhat submit:version
 * ```
 */
const { ethers, run } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const submitTx = require('../multisig/submitTx')
const deployTemplate = require('../deployments/template')

const {
  addSomeETH,
  confirmMultisigTx,
  getMultisigSigner,
  deployLock,
} = require('../../test/helpers')

async function main({ publicLockAddress } = {}) {
  await run('compile')

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

  const parseTx = (functionName, functionArgs) => ({
    contractName: 'Unlock',
    contractAddress: unlockAddress,
    functionName,
    functionArgs,
  })

  // rinkeby and mainnet uses old multisigs so we have to send tx 1 by 1
  if (chainId == 4 || chainId == 1) {
    const nonce1 = await submitTx({
      safeAddress: multisig,
      tx: parseTx('addLockTemplate', [publicLock.address, version]),
      signer,
    })
    const nonce2 = await submitTx({
      safeAddress: multisig,
      tx: parseTx('setLockTemplate', [publicLock.address]),
      signer,
    })
    // check if multisig txs are valid when on mainnet fork
    if (process.env.RUN_MAINNET_FORK) {
      console.log(`Signing multisigs: ${nonce1} ${nonce2}`)
      await confirmMultisigTx({
        transactionId: nonce1,
        multisigAddress: multisig,
      })
      await confirmMultisigTx({
        transactionId: nonce2,
        multisigAddress: multisig,
      })
      const unlock = await ethers.getContractAt('Unlock', unlockAddress)
      const lock = await deployLock({ unlock })
      console.log(
        `Lock ${await lock.name()} (${await lock.publicLockVersion()}) deployed at ${
          lock.address
        }.`
      )
    }
  } else {
    // on all other networks, we can send all txs at once
    await submitTx({
      safeAddress: multisig,
      tx: [
        parseTx('addLockTemplate', [publicLock.address, version]),
        parseTx('setLockTemplate', [publicLock.address]),
      ],
      signer,
    })
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
