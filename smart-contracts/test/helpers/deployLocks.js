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

  // parse deployer as ethers signer
  if (!deployer) {
    ;[deployer] = await ethers.getSigners()
  } else if (typeof deployer === 'string') {
    deployer = await ethers.getSigner(deployer)
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

  const calldata = await createLockCalldata({ args, from: deployer.address })

  // attach Lock contract abi from newly created lock in Unlock event
  const tx = await unlock.createUpgradeableLock(calldata)
  const { events } = await tx.wait()
  const {
    args: { newLockAddress },
  } = events.find((v) => v.event === 'NewLock')

  const lock = await ethers.getContractAt(
    'contracts/PublicLock.sol:PublicLock',
    newLockAddress
  )

  if (maxKeysPerAddress) {
    await lock.connect(deployer).updateLockConfig(
      expirationDuration,
      maxNumberOfKeys,
      10 // default maxKeysPerAddress to 10 for tests
    )
  }

  return lock
}

module.exports = {
  deployLock,
}
