const { assert } = require('chai')
const { ethers } = require('hardhat')
const { deployLock, getBalance, purchaseKeys, reverts } = require('../helpers')

describe('Lock / expireAndRefundFor', () => {
  let lock
  let tokenIds
  let lockCreator
  let keyOwners
  const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
  const refundAmount = ethers.utils.parseUnits('0.01', 'ether')

  before(async () => {
    let signers
    ;[lockCreator, ...signers] = await ethers.getSigners()
    keyOwners = signers.splice(0, 5)

    lock = await deployLock({ isEthers: true })
    ;({ tokenIds } = await purchaseKeys(lock, keyOwners.length))
  })

  describe('should cancel and refund when enough time remains', () => {
    let initialLockBalance
    let initialKeyOwnerBalance
    let event, refund
    let txFee

    before(async () => {
      initialLockBalance = await getBalance(lock.address)
      initialKeyOwnerBalance = await getBalance(keyOwners[0].address)

      const tx = await lock.expireAndRefundFor(tokenIds[0], refundAmount)
      const { events, gasUsed } = await tx.wait()
      ;({
        event,
        args: { refund },
      } = events.find(({ event }) => event === 'CancelKey'))
      // estimate tx gas cost
      txFee = tx.gasPrice.mul(gasUsed)
    })

    it('should emit a CancelKey event', async () => {
      assert.equal(event, 'CancelKey')
    })

    it('the amount of refund should be the key price', async () => {
      assert.equal(refund.toString(), keyPrice.toString())
    })

    it('should make the key no longer valid (i.e. expired)', async () => {
      const isValid = await lock.getHasValidKey(keyOwners[0].address)
      assert.equal(isValid, false)
    })

    it("should increase the owner's balance with the amount of funds refunded from the lock", async () => {
      const finalOwnerBalance = await getBalance(keyOwners[0].address)
      assert(
        finalOwnerBalance.toString(),
        initialKeyOwnerBalance.add(keyPrice).sub(txFee).toString()
      )
    })

    it("should increase the lock's balance by the keyPrice", async () => {
      const finalLockBalance = (await getBalance(lock.address)).sub(
        initialLockBalance
      )

      assert(
        finalLockBalance.toString(),
        initialLockBalance.sub(keyPrice).toString()
      )
    })
  })

  describe('should fail when', () => {
    it('invoked by the key owner', async () => {
      await reverts(
        lock
          .connect(keyOwners[3])
          .expireAndRefundFor(tokenIds[3], refundAmount),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('invoked by another user', async () => {
      await reverts(
        lock
          .connect(keyOwners[1])
          .expireAndRefundFor(tokenIds[3], refundAmount),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('the Lock owner withdraws too much funds', async () => {
      await lock.withdraw(await lock.tokenAddress(), lockCreator.address, 0)
      await reverts(lock.expireAndRefundFor(tokenIds[3], refundAmount), '')
    })

    it('the key is expired', async () => {
      await lock.expireAndRefundFor(tokenIds[3], 0)
      await reverts(
        lock.expireAndRefundFor(tokenIds[3], refundAmount),
        'KEY_NOT_VALID'
      )
    })

    it('the key does not exist', async () => {
      await reverts(lock.expireAndRefundFor(18, refundAmount), 'NO_SUCH_KEY')
    })
  })
})
