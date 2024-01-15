const { ADDRESS_ZERO, purchaseKey, deployLock } = require('../helpers')
const { ethers } = require('hardhat')

contract('Lock / getHasValidKey', (accounts) => {
  let lock
  let tokenId
  let keyOwner
  let keyOwnerSigner

  beforeEach(async () => {
    lock = await deployLock({ isEthers: true })
    ;[, keyOwnerSigner] = await ethers.getSigners()
    keyOwner = keyOwnerSigner.address
    await lock.updateTransferFee(0) // disable the transfer fee for this test
  })

  it('should be false before purchasing a key', async () => {
    const isValid = await lock.getHasValidKey(keyOwner)
    assert.equal(isValid, false)
  })

  describe('after purchase', () => {
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
    })

    it('should be true', async () => {
      assert.equal((await lock.balanceOf(keyOwner)).toNumber(), 1)
      const isValid = await lock.getHasValidKey(keyOwner)
      assert.equal(isValid, true)
    })

    describe('after transfering a previously purchased key', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwnerSigner)
          .transferFrom(keyOwner, accounts[5], tokenId)
      })

      it('should be false', async () => {
        const isValid = await lock.getHasValidKey(keyOwner)
        assert.equal(isValid, false)
      })
    })
  })

  describe('with multiple keys', () => {
    let tokenIds
    beforeEach(async () => {
      const tx = await lock.purchase(
        [],
        [keyOwner, keyOwner, keyOwner],
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
      const isValid = await lock.getHasValidKey(keyOwner)
      assert.equal(isValid, true)
    })

    describe('after transfering one of the purchased key', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwnerSigner)
          .transferFrom(keyOwner, accounts[5], tokenIds[0])
      })

      it('should still be true', async () => {
        const isValid = await lock.getHasValidKey(keyOwner)
        assert.equal(isValid, true)
        assert.equal(await lock.getHasValidKey(accounts[5]), true)
      })
    })

    describe('after cancelling one of the purchased key', () => {
      beforeEach(async () => {
        await lock.connect(keyOwnerSigner).cancelAndRefund(tokenIds[1])
      })

      it('should be true', async () => {
        const isValid = await lock.getHasValidKey(keyOwner)
        assert.equal(isValid, true)
      })
    })

    describe('after transferring all of the purchased key', () => {
      beforeEach(async () => {
        await Promise.all(
          tokenIds.map((id) =>
            lock.connect(keyOwnerSigner).transferFrom(keyOwner, accounts[5], id)
          )
        )
      })

      it('should be false', async () => {
        assert.equal((await lock.balanceOf(keyOwner)).toNumber(), 0)
        assert.equal((await lock.balanceOf(accounts[5])).toNumber(), 3)
        const isValid = await lock.getHasValidKey(keyOwner)
        assert.equal(isValid, false)
      })
    })
  })
})
