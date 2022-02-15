const { ethers } = require('hardhat')
const Locks = require('../../test/fixtures/locks')
const createLock = require('../deployments/lock.js')

async function main({ unlockAddress, unlockVersion, tokenAddress }) {
  const PublicLock = await ethers.getContractFactory('PublicLock')

  // loop through all locks and deploy them
  const serializedLocks = Object.keys(Locks).map((name) => ({
    expirationDuration: Locks[name].expirationDuration.toFixed(),
    tokenAddress: tokenAddress || ethers.constants.AddressZero,
    keyPrice: Locks[name].keyPrice.toFixed(),
    maxNumberOfKeys: Locks[name].maxNumberOfKeys.toFixed(),
    name: Locks[name].lockName,
  }))

  const signers = await ethers.getSigners()

  // eslint-disable-next-line no-restricted-syntax
  for (const serializedLock of serializedLocks) {
    const newLockAddress = await createLock({
      unlockAddress,
      unlockVersion,
      serializedLock,
      salt: web3.utils.randomHex(12),
    })
    const lock = PublicLock.attach(newLockAddress)

    // eslint-disable-next-line no-console
    console.log('LOCK SAMPLES > Buying a bunch of locks...')

    // purchase a bunch of keys
    const { maxNumberOfKeys, keyPrice } = serializedLock
    const purchasers = signers.slice(0, maxNumberOfKeys) // prevent soldout revert
    const txs = await Promise.all(
      purchasers.map((purchaser) =>
        lock
          .connect(purchaser)
          .purchase(
            keyPrice,
            purchaser.address,
            web3.utils.padLeft(0, 40),
            web3.utils.padLeft(0, 40),
            [],
            { value: keyPrice }
          )
      )
    )
    const purchases = await Promise.all(txs.map((tx) => tx.wait()))
    purchases
      .map(({ events }) => events.find(({ event }) => event === 'Transfer'))
      .forEach(({ args: { to, tokenId } }) => {
        // eslint-disable-next-line no-console
        console.log(`LOCK SAMPLES > key (${tokenId}) purchased by ${to}`)
      })
  }
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
