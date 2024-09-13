const assert = require('assert')
const { deployLock, ADDRESS_ZERO } = require('../helpers')
const { ethers } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

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
        [await keyOwner.getAddress()],
        [await referrer.getAddress()],
        [ADDRESS_ZERO],
        ['0x'],
        {
          value: ethers.parseUnits('0.01', 'ether'),
        }
      )
    })
  })

  describe('if the referrer has a key', () => {
    it('should succeed', async () => {
      await lock.purchase(
        [],
        [await keyOwner.getAddress()],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        ['0x'],
        {
          value: ethers.parseUnits('0.01', 'ether'),
        }
      )
      await lock.purchase(
        [],
        [await referrer.getAddress()],
        [await keyOwner.getAddress()],
        [ADDRESS_ZERO],
        ['0x'],
        {
          value: ethers.parseUnits('0.01', 'ether'),
        }
      )
    })

    it('can purchaseForFrom a free key', async () => {
      await lockFree.purchase(
        [],
        [await keyOwner.getAddress()],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        ['0x']
      )
      const tx = await lockFree.purchase(
        [],
        [await keyOwner.getAddress()],
        [await referrer.getAddress()],
        [ADDRESS_ZERO],
        ['0x']
      )

      const receipt = await tx.wait()
      const { args } = await getEvent(receipt, 'Transfer')
      assert.equal(args.from, 0)
      assert.equal(args.to, await keyOwner.getAddress())
    })
  })
})
