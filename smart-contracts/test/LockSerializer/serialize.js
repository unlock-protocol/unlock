const { ethers } = require('hardhat')
const deployLocks = require('../helpers/deployLocks')
const compareValues = require('./_compareValues')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

contract('LockSerializer', () => {
  let serializer
  let unlock
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
  })

  describe('serialize', () => {
    it('deserialize values properly', () => {
      Object.keys(locks).forEach(async (id) => {
        const lock = locks[id]
        const serialized = await serializer.serialize(lock.address)
        await compareValues(serialized, lock)
      })
    })

    describe('key ownership', () => {
      let purchasers
      let lock
      const keyPrice = ethers.utils.parseEther('0.01')

      // eslint-disable-next-line func-names
      beforeEach(async function () {
        lock = locks.FIRST
        // skip as getKeyOwners has been removed on v9
        if ((await lock.publicLockVersion()) <= 9) {
          this.skip()
        }
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
})
