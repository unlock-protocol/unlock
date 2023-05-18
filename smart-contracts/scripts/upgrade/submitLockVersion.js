/**
 * Deploy latest PublicLock template and send the txs to the multisig to add/set
 * it to the Unlock contract.
 *
 * ```
 * # If no existing address is specified, it will deploy the latest public lock.
 * yarn hardhat submit:version
 *
 * # with an existing address, contract gets deployed and specified
 * yarn hardhat submit:version --network goerli --public-lock-address <TEMPLATE_ADDRESS>
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
const contracts = require('@unlock-protocol/contracts')

const {
  addSomeETH,
  getMultisigSigner,
  deployLock,
} = require('../../test/helpers')

async function main({ publicLockAddress, publicLockVersion, addOnly, unlockAddress } = {}) {
  await run('compile')

  // make sure we get the correct chain id on local mainnet fork
  const { chainId } = process.env.RUN_MAINNET_FORK
    ? { chainId: '1' }
    : await ethers.provider.getNetwork()

  const { multisig } = networks[chainId]
  if (!unlockAddress) {
    ;({unlockAddress} = networks[chainId])
  }
  let publicLock

  // if not address is specified, deploy the lock template
  if (!publicLockAddress) {
    // deploy from contracts package
    if (publicLockVersion) {
      console.log(
        `Deploying PublicLock v${publicLockVersion} from contracts package`
      )
      publicLockAddress = await deployTemplate({ publicLockVersion })
      const { abi } = contracts[`PublicLockV${publicLockVersion}`]
      publicLock = await ethers.getContractAt(abi, publicLockAddress)
    } else {
      // deploy latest from local folder
      publicLockAddress = await deployTemplate({})
      publicLock = await ethers.getContractAt('PublicLock', publicLockAddress)
    }
  } else {
    publicLock = await ethers.getContractAt('PublicLock', publicLockAddress)
  }

  // get multisig signer
  const [signer] = process.env.RUN_MAINNET_FORK
    ? [await getMultisigSigner(multisig)]
    : await ethers.getSigners()

  if (process.env.RUN_MAINNET_FORK) {
    // some ETH for the issuer
    await addSomeETH(signer.address)
  }

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

  // mainnet uses old multisigs so we have to send tx 1 by 1
  if (chainId == 4 || chainId == 1) {
    
    // add template
    await submitTx({
      safeAddress: multisig,
      tx: parseTx('addLockTemplate', [publicLock.address, version]),
      signer,
    })

    // set template as default
    if(!addOnly) {
      await submitTx({
        safeAddress: multisig,
        tx: parseTx('setLockTemplate', [publicLock.address]),
        signer,
      })

    }
    // multisig txs are confirmed automatically on a mainnet fork
    if (process.env.RUN_MAINNET_FORK) {
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
    const txs = [
      parseTx('addLockTemplate', [publicLock.address, version]),
    ]

    if(!addOnly) {
      txs.push(
        parseTx('setLockTemplate', [publicLock.address]),
      )
    }

    await submitTx({
      safeAddress: multisig,
      tx: txs,
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
