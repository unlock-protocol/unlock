const assert = require('assert')
const { ADDRESS_ZERO, purchaseKey, deployLock } = require('../helpers')
const { ethers } = require('hardhat')
const { getEvents } = require('@unlock-protocol/hardhat-helpers')

describe('Lock / getHasValidKey', () => {
  let lock
  let tokenId
  let keyOwner, receiver

  beforeEach(async () => {
    lock = await deployLock()
    ;[, keyOwner, receiver] = await ethers.getSigners()
    await lock.updateTransferFee(0) // disable the transfer fee for this test
  })

  it('should be false before purchasing a key', async () => {
    const isValid = await lock.getHasValidKey(await keyOwner.getAddress())
    assert.equal(isValid, false)
  })

  describe('after purchase', () => {
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    })

    it('should be true', async () => {
      assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 1)
      const isValid = await lock.getHasValidKey(await keyOwner.getAddress())
      assert.equal(isValid, true)
    })

    describe('after transfering a previously purchased key', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .transferFrom(
            await keyOwner.getAddress(),
            await receiver.getAddress(),
            tokenId
          )
      })

      it('should be false', async () => {
        const isValid = await lock.getHasValidKey(await keyOwner.getAddress())
        assert.equal(isValid, false)
      })
    })
  })

  describe('with multiple keys', () => {
    let tokenIds
    beforeEach(async () => {
      const tx = await lock.purchase(
        [],
        [
          await keyOwner.getAddress(),
          await keyOwner.getAddress(),
          await keyOwner.getAddress(),
        ],
        [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
        [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
        ['0x', '0x', '0x'],
        {
          value: ethers.parseUnits('0.03', 'ether'),
        }
      )
      const receipt = await tx.wait()
      const { events } = await getEvents(receipt, 'Transfer')
      tokenIds = events.map(({ args }) => args.tokenId)
    })

    it('should be true', async () => {
      const isValid = await lock.getHasValidKey(await keyOwner.getAddress())
      assert.equal(isValid, true)
    })

    describe('after transfering one of the purchased key', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .transferFrom(
            await keyOwner.getAddress(),
            await receiver.getAddress(),
            tokenIds[0]
          )
      })

      it('should still be true', async () => {
        const isValid = await lock.getHasValidKey(await keyOwner.getAddress())
        assert.equal(isValid, true)
        assert.equal(
          await lock.getHasValidKey(await receiver.getAddress()),
          true
        )
      })
    })

    describe('after cancelling one of the purchased key', () => {
      beforeEach(async () => {
        await lock.connect(keyOwner).cancelAndRefund(tokenIds[1])
      })

      it('should be true', async () => {
        const isValid = await lock.getHasValidKey(await keyOwner.getAddress())
        assert.equal(isValid, true)
      })
    })

    describe('after transferring all of the purchased key', () => {
      beforeEach(async () => {
        await Promise.all(
          tokenIds.map(async (id) => {
            await lock
              .connect(keyOwner)
              .transferFrom(
                await keyOwner.getAddress(),
                await receiver.getAddress(),
                id
              )
          })
        )
      })

      it('should be false', async () => {
        assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 0)
        assert.equal(await lock.balanceOf(await receiver.getAddress()), 3)
        const isValid = await lock.getHasValidKey(await keyOwner.getAddress())
        assert.equal(isValid, false)
      })
    })
  })
})
