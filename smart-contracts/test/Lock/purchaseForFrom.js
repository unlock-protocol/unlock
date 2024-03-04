const { assert } = require('chai')
const { deployLock, ADDRESS_ZERO } = require('../helpers')
const { ethers } = require('hardhat')

describe('Lock / purchaseForFrom', () => {
  let lock
  let lockFree
  let keyOwner, referrer
  before(async () => {
    ;[, keyOwner, referrer] = await ethers.getSigners()
    lock = await deployLock()
    lockFree = await deployLock({ name: 'FREE' })
  })

  describe('if the referrer does not have a key', () => {
    it('should succeed', async () => {
      await lock.purchase(
        [],
        [keyOwner.address],
        [referrer.address],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.utils.parseUnits('0.01', 'ether'),
        }
      )
    })
  })

  describe('if the referrer has a key', () => {
    it('should succeed', async () => {
      await lock.purchase(
        [],
        [keyOwner.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.utils.parseUnits('0.01', 'ether'),
        }
      )
      await lock.purchase(
        [],
        [referrer.address],
        [keyOwner.address],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.utils.parseUnits('0.01', 'ether'),
        }
      )
    })

    it('can purchaseForFrom a free key', async () => {
      await lockFree.purchase(
        [],
        [keyOwner.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]]
      )
      const tx = await lockFree.purchase(
        [],
        [keyOwner.address],
        [referrer.address],
        [ADDRESS_ZERO],
        [[]]
      )

      const { events } = await tx.wait()
      const { args } = events.find(({ event }) => event === 'Transfer')
      assert.equal(args.from, 0)
      assert.equal(args.to, keyOwner.address)
    })
  })
})
