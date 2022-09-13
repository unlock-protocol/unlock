const { ethers } = require('hardhat')
const Locks = require('../../test/fixtures/locks')
const createLock = require('../deployments/lock.js')

const { AddressZero } = ethers.constants

async function main({
  unlockAddress,
  unlockVersion,
  tokenAddress = AddressZero,
}) {
  const PublicLock = await ethers.getContractFactory('PublicLock')

  const signers = await ethers.getSigners()

  // loop through all locks and deploy them
  const serializedLocks = Object.keys(Locks).map((name, i) => ({
    ...Locks[name],
    tokenAddress,
    name: `Lock ${i}`,
  }))

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
    const value =
      keyPrice.toString() === '0' ? 0 : keyPrice.mul(maxNumberOfKeys)

    // multiple purchases was introduced in v11
    if ((await lock.publicLockVersion()) <= 10) {
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
    } else {
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
      purchases.map(({ events }) =>
        events.find(({ event }) => event === 'Transfer')
      )
    }
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
