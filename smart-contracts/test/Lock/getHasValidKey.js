const { assert } = require('chai')
const { ADDRESS_ZERO, purchaseKey, deployLock } = require('../helpers')
const { ethers } = require('hardhat')

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
    const isValid = await lock.getHasValidKey(keyOwner.address)
    assert.equal(isValid, false)
  })

  describe('after purchase', () => {
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    })

    it('should be true', async () => {
      assert.equal((await lock.balanceOf(keyOwner.address)).toNumber(), 1)
      const isValid = await lock.getHasValidKey(keyOwner.address)
      assert.equal(isValid, true)
    })

    describe('after transfering a previously purchased key', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .transferFrom(keyOwner.address, receiver.address, tokenId)
      })

      it('should be false', async () => {
        const isValid = await lock.getHasValidKey(keyOwner.address)
        assert.equal(isValid, false)
      })
    })
  })

  describe('with multiple keys', () => {
    let tokenIds
    beforeEach(async () => {
      const tx = await lock.purchase(
        [],
        [keyOwner.address, keyOwner.address, keyOwner.address],
        [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
        [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
        [[], [], []],
        {
          value: ethers.utils.parseUnits('0.03', 'ether'),
        }
      )
      const { events } = await tx.wait()
      tokenIds = await events
        .filter((v) => v.event === 'Transfer')
        .map(({ args }) => args.tokenId)
    })

    it('should be true', async () => {
      const isValid = await lock.getHasValidKey(keyOwner.address)
      assert.equal(isValid, true)
    })

    describe('after transfering one of the purchased key', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .transferFrom(keyOwner.address, receiver.address, tokenIds[0])
      })

      it('should still be true', async () => {
        const isValid = await lock.getHasValidKey(keyOwner.address)
        assert.equal(isValid, true)
        assert.equal(await lock.getHasValidKey(receiver.address), true)
      })
    })

    describe('after cancelling one of the purchased key', () => {
      beforeEach(async () => {
        await lock.connect(keyOwner).cancelAndRefund(tokenIds[1])
      })

      it('should be true', async () => {
        const isValid = await lock.getHasValidKey(keyOwner.address)
        assert.equal(isValid, true)
      })
    })

    describe('after transferring all of the purchased key', () => {
      beforeEach(async () => {
        await Promise.all(
          tokenIds.map((id) =>
            lock
              .connect(keyOwner)
              .transferFrom(keyOwner.address, receiver.address, id)
          )
        )
      })

      it('should be false', async () => {
        assert.equal((await lock.balanceOf(keyOwner.address)).toNumber(), 0)
        assert.equal((await lock.balanceOf(receiver.address)).toNumber(), 3)
        const isValid = await lock.getHasValidKey(keyOwner.address)
        assert.equal(isValid, false)
      })
    })
  })
})
