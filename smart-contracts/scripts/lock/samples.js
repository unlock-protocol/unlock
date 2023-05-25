const { ethers } = require('hardhat')
const Locks = require('../../test/fixtures/locks')
const createLock = require('../deployments/lock.js')
const contracts = require('@unlock-protocol/contracts')
const { networks } = require('@unlock-protocol/networks')

const { AddressZero } = ethers.constants

async function main({
  unlockAddress,
  lockVersion,
  tokenAddress = AddressZero,
  lockCount = 1,
}) {
  const signers = await ethers.getSigners()

  const { chainId } = await ethers.provider.getNetwork()
  if (!unlockAddress && chainId !== 31337) {
    ;({ unlockAddress } = networks[chainId])
  }
  if (!unlockAddress) {
    throw Error('Missing Unlock address')
  }
  console.log(`Deploying on chain ${chainId} with Unlock at: ${unlockAddress}`)

  // loop through all locks and deploy them
  const serializedLocks = Object.keys(Locks).map((name, i) => ({
    ...Locks[name],
    tokenAddress,
    name: `Lock ${i} (${new Date().toLocaleString()})`,
  }))

  let deployed = 0
  // eslint-disable-next-line no-restricted-syntax
  for (const serializedLock of serializedLocks) {
    // deploy only so much locks as `lockCount` specified
    if (deployed >= lockCount) return

    const newLockAddress = await createLock({
      unlockAddress,
      serializedLock,
      lockVersion,
      salt: web3.utils.randomHex(12),
    })

    // get correct versio  of the lock abi
    let Lock
    if (!lockVersion) {
      Lock = await ethers.getContractFactory('PublicLock')
    } else {
      const { abi, bytecode } = contracts[`PublicLockV${lockVersion}`]
      Lock = await ethers.getContractFactory(abi, bytecode)
    }
    const lock = Lock.attach(newLockAddress)

    // eslint-disable-next-line no-console
    console.log('LOCK SAMPLES > Buying a bunch of keys...')

    // purchase a bunch of keys
    const { maxNumberOfKeys, keyPrice } = serializedLock
    const purchasers = signers.slice(0, maxNumberOfKeys) // prevent soldout revert
    const value =
      keyPrice.toString() === '0' ? 0 : keyPrice.mul(maxNumberOfKeys).toString()

    const tx = await lock.purchase(
      [],
      purchasers.map(({ address }) => address),
      purchasers.map(() => web3.utils.padLeft(0, 40)),
      purchasers.map(() => web3.utils.padLeft(0, 40)),
      purchasers.map(() => []),
      { value }
    )

    // get token ids
    const { events } = await tx.wait()
    events
      .filter((v) => v.event === 'Transfer')
      .forEach(({ args: { to, tokenId } }) => {
        // eslint-disable-next-line no-console
        console.log(`LOCK SAMPLES > key (${tokenId}) purchased by ${to}`)
      })

    // keep track of how many logs have been deployed
    deployed++
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
