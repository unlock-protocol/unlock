const { ethers } = require('hardhat')
const Locks = require('../../test/fixtures/locks')
const createLock = require('../deployments/lock.js')

async function main({ unlockAddress, unlockVersion, tokenAddress }) {
  // loop through all locks and deploy them
  const serializedLocks = Object.keys(Locks).map((name) => ({
    expirationDuration: Locks[name].expirationDuration.toFixed(),
    tokenAddress: tokenAddress || ethers.constants.AddressZero,
    keyPrice: Locks[name].keyPrice.toFixed(),
    maxNumberOfKeys: Locks[name].maxNumberOfKeys.toFixed(),
    name: Locks[name].lockName,
  }))

  // eslint-disable-next-line no-restricted-syntax
  for (const serializedLock of serializedLocks) {
    await createLock({
      unlockAddress,
      unlockVersion,
      serializedLock,
      salt: web3.utils.randomHex(12),
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
