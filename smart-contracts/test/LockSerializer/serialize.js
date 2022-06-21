const { ethers } = require('hardhat')
const compareValues = require('./_compareValues')

const { deployAllLocks, ADDRESS_ZERO } = require('../helpers/constants')

contract('LockSerializer', () => {
  let serializer
  let PublicLock
  let beneficiary
  const locks = {}

  beforeEach(async () => {
    ;[, beneficiary] = await ethers.getSigners()

    // deploy serializer
    const LockSerializer = await ethers.getContractFactory('LockSerializer')
    serializer = await LockSerializer.deploy()
    await serializer.deployed()

    // get locks (truffle version)
    const locksTruffle = await deployAllLocks(null, beneficiary.address)
    // parse locks for ethers
    PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
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

    it('fetch a sample of the tokenURI properly', async () => {
      const lock = locks.FIRST
      const keyPrice = ethers.utils.parseEther('0.01')
      const baseTokenURI = 'https://hahaha.com/'

      const [, purchaser] = await ethers.getSigners()

      // purchase a key
      const tx = await lock
        .connect(purchaser)
        .purchase(
          [keyPrice.toString()],
          [purchaser.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          { value: keyPrice }
        )
      await tx.wait()

      const totalSupply = await lock.totalSupply()

      // default URI
      const serialized = await serializer.serialize(lock.address)
      await assert.equal(
        serialized.tokenURISample,
        `${lock.address.toLowerCase()}/${totalSupply}`
      )

      // custom URI
      await lock.connect(beneficiary).setBaseTokenURI(baseTokenURI)
      const serializedCustomBaseURI = await serializer.serialize(lock.address)
      await assert.equal(
        serializedCustomBaseURI.tokenURISample,
        `${baseTokenURI}${totalSupply}`
      )
    })

    describe('key ownership', () => {
      let purchasers
      let lock
      const keyPrice = ethers.utils.parseEther('0.01')

      // eslint-disable-next-line func-names
      beforeEach(async function () {
        lock = locks.FIRST
        const [, ..._purchasers] = await ethers.getSigners()
        const maxNumberOfKeys = await lock.maxNumberOfKeys()
        purchasers = _purchasers.slice(0, maxNumberOfKeys.toNumber()) // prevent soldout revert

        // purchase keys
        await lock.connect(purchasers[0]).purchase(
          [],
          purchasers.map((p) => p.address),
          purchasers.map(() => ADDRESS_ZERO),
          purchasers.map(() => ADDRESS_ZERO),
          purchasers.map(() => []),
          { value: keyPrice.mul(purchasers.length) }
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
