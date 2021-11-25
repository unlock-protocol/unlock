const { ethers } = require('hardhat')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

contract('LockSerializer', () => {
  let serializer
  let unlock
  let unlockAddress
  let PublicLock
  let beneficiary
  const locks = {}

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    ;[, beneficiary] = await ethers.getSigners()

    // deploy serializer
    const LockSerializer = await ethers.getContractFactory('LockSerializer')
    serializer = await LockSerializer.deploy()
    await serializer.deployed()

    // get locks (truffle version)
    const locksTruffle = await deployLocks(unlock, beneficiary.address)

    // parse locks for ethers
    PublicLock = await ethers.getContractFactory('PublicLock')
    Object.keys(locksTruffle).forEach((k) => {
      locks[k] = PublicLock.attach(locksTruffle[k].address)
    })

    unlockAddress = unlock.address
  })

  describe('serialize', () => {
    it('deserialize values properly', () => {
      Object.keys(locks).forEach(async (id) => {
        const lock = locks[id]
        const serialized = await serializer.serialize(lock.address)

        const propNames = Object.keys(serialized)
          .filter((k) => Number.isNaN(Number.parseInt(k))) // remove numbers from array index
          .filter((k) => !['keyOwners', 'expirationTimestamps'].includes(k)) // exclude arrays
        const values = await Promise.all(propNames.map((k) => lock[k]()))

        // assertions
        propNames.forEach((k, i) => {
          if (
            ethers.BigNumber.isBigNumber(serialized[k]) &&
            ethers.BigNumber.isBigNumber(values[i])
          ) {
            assert.equal(
              serialized[k].eq(values[i]),
              true,
              `different serialized value ${k}, ${serialized[k]}, ${values[i]}`
            )
          } else {
            assert.equal(
              serialized[k],
              values[i],
              `different serialized value ${k}, ${serialized[k]}, ${values[i]}`
            )
          }
        })
      })
    })
    describe('key ownership', () => {
      let purchasers
      let lock
      const keyPrice = ethers.utils.parseEther('0.01')

      beforeEach(async () => {
        lock = locks.FIRST
        const [, ..._purchasers] = await ethers.getSigners()
        const maxNumberOfKeys = await lock.maxNumberOfKeys()
        purchasers = _purchasers.slice(0, maxNumberOfKeys.toNumber()) // prevent soldout revert

        // purchase keys
        await Promise.all(
          purchasers.map((purchaser) =>
            lock
              .connect(purchaser)
              .purchase(
                keyPrice.toString(),
                purchaser.address,
                web3.utils.padLeft(0, 40),
                [],
                { value: keyPrice }
              )
          )
        )
      })

      it('contains all key owners', async () => {
        const serialized = await serializer.serialize(lock.address)
        assert.deepEqual(
          serialized.keyOwners,
          purchasers.map((p) => p.address)
        )
      })

      it('containes key expirations', async () => {
        const serialized = await serializer.serialize(lock.address)
        assert.equal(serialized.expirationTimestamps.length, purchasers.length)
      })
    })
  })

  describe('deploy', () => {
    const salt = '0xffffffffffffffffffffffff'
    it('deployed shoud be identical', async () => {
      const lock = locks.FIRST
      const serialized = await serializer.serialize(lock.address)

      const newLockAddress = await serializer.deployLock(
        unlockAddress,
        serialized,
        salt
      )

      const newLock = PublicLock.attach(newLockAddress)

      assert.equal(await lock.name(), await newLock.name())
    })
  })
})
