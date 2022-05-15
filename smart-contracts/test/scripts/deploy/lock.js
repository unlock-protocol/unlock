const { ethers } = require('hardhat')
const { UnlockV9 } = require('@unlock-protocol/contracts')
const { PublicLockV8 } = require('@unlock-protocol/contracts')

const Locks = require('../../fixtures/locks')
const deployLock = require('../../../scripts/deployments/lock')
const compareValues = require('../../LockSerializer/_compareValues')

contract('Scripts/deploy:lock', () => {
  let serializer
  let unlockAddress
  let PublicLock
  const locks = {}
  // addresses
  let unlockOwner
  let manager

  beforeEach(async () => {
    ;[unlockOwner, , manager] = await ethers.getSigners()

    // deploy unlock
    const Unlock = await ethers.getContractFactory(
      UnlockV9.abi,
      UnlockV9.bytecode
    )
    const unlock = await Unlock.deploy()
    await unlock.deployed()

    // deploy template
    PublicLock = await ethers.getContractFactory(
      PublicLockV8.abi,
      PublicLockV8.bytecode
    )
    const publicLock = await PublicLock.deploy()
    await publicLock.deployed()

    // set unlock
    await unlock.initialize(unlockOwner.address)
    await unlock.connect(unlockOwner).setLockTemplate(publicLock.address)

    // deploy serializer
    const LockSerializer = await ethers.getContractFactory('LockSerializer')
    serializer = await LockSerializer.deploy()
    await serializer.deployed()

    // deploy locks
    await Promise.all(
      Object.keys(Locks)
        .filter((name) => name != 'NON_EXPIRING') // avoid max 100yrs revert
        .map(async (name) => {
          const lockArgs = [
            Locks[name].expirationDuration.toFixed(),
            web3.utils.padLeft(0, 40),
            Locks[name].keyPrice.toFixed(),
            Locks[name].maxNumberOfKeys.toFixed(),
            Locks[name].lockName,
            web3.utils.randomHex(12),
          ]
          const tx = await unlock.createLock(...lockArgs)
          const { events } = await tx.wait()
          const { args } = events.find((v) => v.event === 'NewLock')
          locks[name] = await PublicLock.attach(args.newLockAddress)
          locks[name].params = Locks[name]
        })
    )

    unlockAddress = unlock.address
  })

  it('identical init args', async () => {
    // check for all locks
    Object.keys(locks).forEach(async (id) => {
      const lock = locks[id]
      const serialized = await serializer.serialize(lock.address)

      // redeploy our lock
      const newLockAddress = await deployLock({
        unlockAddress,
        unlockVersion: 8,
        serializedLock: serialized,
        salt: web3.utils.randomHex(12),
      })

      // make sure values are identical
      const newLock = PublicLock.attach(newLockAddress)
      await compareValues(serialized, lock)
      await compareValues(serialized, newLock)
    })
  })
  it('identical custom fees', async () => {
    const lock = locks.FIRST

    // set custom values
    await lock.addLockManager(manager.address)
    await lock.connect(manager).updateRefundPenalty(2222, 2222)
    await lock.connect(manager).updateTransferFee(2222)

    const serialized = await serializer.serialize(lock.address)

    // redeploy our lock
    const newLockAddress = await deployLock({
      unlockAddress,
      unlockVersion: 8,
      serializedLock: serialized,
      salt: web3.utils.randomHex(12),
    })

    // make sure values are identical
    const newLock = PublicLock.attach(newLockAddress)
    await compareValues(serialized, lock)
    await compareValues(serialized, newLock)
  })
})
