const { ethers } = require('hardhat')
const { deployLock, getBalance, purchaseKeys, reverts } = require('../helpers')
const { assert } = require('chai')

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const refundAmount = ethers.utils.parseUnits('0.01', 'ether')

describe('Lock / expireAndRefundFor', () => {
  let lock
  let tokenIds
  let keyOwners

  before(async () => {
    const [, ...signers] = await ethers.getSigners()
    keyOwners = signers.slice(0, 4)
    lock = await deployLock()
    ;({ tokenIds } = await purchaseKeys(lock, keyOwners.length))
  })

  describe('should cancel and refund when enough time remains', () => {
    let initialLockBalance
    let initialKeyOwnerBalance
    let events
    let gasUsed
    let transactionHash

    before(async () => {
      initialLockBalance = await getBalance(lock.address)
      initialKeyOwnerBalance = await getBalance(keyOwners[0].address)

      const tx = await lock.expireAndRefundFor(tokenIds[0], refundAmount)
      ;({ events, transactionHash, gasUsed } = await tx.wait())
    })

    it('should emit a CancelKey event', async () => {
      assert.equal(events[0].event, 'CancelKey')
    })

    it('the amount of refund should be the key price', async () => {
      const { refund } = events[0].args
      assert.equal(refund.toString(), keyPrice.toString())
    })

    it('should make the key no longer valid (i.e. expired)', async () => {
      const isValid = await lock.getHasValidKey(keyOwners[0].address)
      assert.equal(isValid, false)
    })

    it("should increase the owner's balance with the amount of funds refunded from the lock", async () => {
      const { gasPrice } = await ethers.provider.getTransaction(transactionHash)
      const txFee = gasPrice.mul(gasUsed)
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
      await lock.withdraw(await lock.tokenAddress(), 0)
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
