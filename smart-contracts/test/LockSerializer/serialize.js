const { assert } = require('chai')
const { ethers } = require('hardhat')
const compareValues = require('./_compareValues')

const { deployLock, ADDRESS_ZERO } = require('../helpers')

describe('LockSerializer', () => {
  let lock
  let serializer
  let lockOwner
  let keyOwner

  beforeEach(async () => {
    ;[lockOwner, keyOwner] = await ethers.getSigners()

    // deploy serializer
    const LockSerializer = await ethers.getContractFactory('LockSerializer')
    serializer = await LockSerializer.deploy()

    // get locks (truffle version)
    lock = await deployLock()
  })

  describe('serialize', () => {
    it('deserialize values properly', async () => {
      const serialized = await serializer.serialize(await lock.getAddress())
      await compareValues(serialized, lock)
    })

    it('fetch a sample of the tokenURI properly', async () => {
      const keyPrice = ethers.parseEther('0.01')
      const baseTokenURI = 'https://hahaha.com/'

      // purchase a key
      const tx = await lock
        .connect(keyOwner)
        .purchase(
          [keyPrice],
          [await keyOwner.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
          { value: keyPrice }
        )
      await tx.wait()

      const totalSupply = await lock.totalSupply()

      // default URI
      const serialized = await serializer.serialize(await lock.getAddress())
      await assert.equal(
        serialized.tokenURISample,
        `${(await lock.getAddress()).toLowerCase()}/${totalSupply}`
      )

      // custom URI
      await lock
        .connect(lockOwner)
        .setLockMetadata(await lock.name(), await lock.symbol(), baseTokenURI)
      const serializedCustomBaseURI = await serializer.serialize(
        await lock.getAddress()
      )
      await assert.equal(
        serializedCustomBaseURI.tokenURISample,
        `${baseTokenURI}${totalSupply}`
      )
    })

    describe('key ownership', () => {
      let purchasers
      const keyPrice = ethers.parseEther('0.01')

      // eslint-disable-next-line func-names
      beforeEach(async function () {
        const [, ..._purchasers] = await ethers.getSigners()
        const maxNumberOfKeys = await lock.maxNumberOfKeys()
        purchasers = _purchasers.slice(0, parseInt(maxNumberOfKeys.toString())) // prevent soldout revert

        // purchase keys
        await lock.connect(purchasers[0]).purchase(
          [],
          await Promise.all(purchasers.map((p) => p.getAddress())),
          purchasers.map(() => ADDRESS_ZERO),
          purchasers.map(() => ADDRESS_ZERO),
          purchasers.map(() => '0x'),
          { value: keyPrice * BigInt(purchasers.length) }
        )
      })

      it('contains all key owners', async () => {
        const serialized = await serializer.serialize(await lock.getAddress())
        assert.deepEqual(
          serialized.keyOwners,
          await Promise.all(purchasers.map((p) => p.getAddress()))
        )
      })

      it('containes key expirations', async () => {
        const serialized = await serializer.serialize(await lock.getAddress())
        assert.equal(serialized.expirationTimestamps.length, purchasers.length)
      })
    })
  })
})
