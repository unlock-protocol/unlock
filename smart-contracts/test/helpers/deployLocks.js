const { ethers } = require('hardhat')
const deployContracts = require('../fixtures/deploy')
const {
  ADDRESS_ZERO,
  MAX_UINT,
  createLockCalldata,
  lockFixtures: Locks,
} = require('@unlock-protocol/hardhat-helpers')

async function deployLock({
  unlock,
  from: deployer,
  tokenAddress = ADDRESS_ZERO,
  name = 'FIRST',
  keyPrice,
} = {}) {
  if (!unlock) {
    ;({ unlock } = await deployContracts())
  }
  if (!deployer) {
    const [defaultDeployer] = await ethers.getSigners()
    deployer = defaultDeployer.address
  }

  const {
    expirationDuration: expirationDurationArg,
    keyPrice: price,
    maxNumberOfKeys,
    lockName,
    maxKeysPerAddress,
  } = Locks[name]

  const expirationDuration =
    name === 'NON_EXPIRING' ? MAX_UINT : expirationDurationArg.toString()

  const args = [
    expirationDuration,
    tokenAddress,
    (keyPrice || price).toString(),
    maxNumberOfKeys.toString(),
    lockName,
  ]

  const calldata = await createLockCalldata({ args, from: deployer })

  // support passing unlock as either truffle or ethersjs contract instance
  const tx = await unlock.createUpgradeableLock(calldata)
  let evt
  if (unlock.constructor.name === 'TruffleContract') {
    evt = tx.logs.find((v) => v.event === 'NewLock')
  } else {
    const { events } = await tx.wait()
    evt = events.find((v) => v.event === 'NewLock')
  }
  const { newLockAddress } = evt.args
  const lock = await ethers.getContractAt(
    'contracts/PublicLock.sol:PublicLock',
    newLockAddress
  )

  if (maxKeysPerAddress) {
    await lock.updateLockConfig(
      expirationDuration,
      maxNumberOfKeys,
      10, // default maxKeysPerAddress to 10 for tests
      { from: deployer }
    )
  }

  return lock
}

async function deployAllLocks(unlock, from, tokenAddress = ADDRESS_ZERO) {
  const locks = await Promise.all(
    Object.keys(Locks).map((name) =>
      deployLock(unlock, from, tokenAddress, Locks[name])
    )
  )
  return locks.reduce(
    (acc, d, i) => ({
      ...acc,
      [Object.keys(Locks)[i]]: locks[i],
    }),
    {}
  )
}

module.exports = {
  deployLock,
  deployAllLocks,
}
