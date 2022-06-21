const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../helpers/constants')
const { getBalance } = require('../helpers')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let unlock
let locks

contract('Lock / expireAndRefundFor', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let lock
  let tokenIds
  const keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]
  const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
  const refundAmount = ethers.utils.parseUnits('0.01', 'ether')
  const lockCreator = accounts[0]

  before(async () => {
    lock = locks.SECOND
    const tx = await lock.purchase(
      [],
      keyOwners,
      keyOwners.map(() => ADDRESS_ZERO),
      keyOwners.map(() => ADDRESS_ZERO),
      keyOwners.map(() => []),
      {
        value: (keyPrice * keyOwners.length).toFixed(),
        from: keyOwners[1],
      }
    )

    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
  })

  describe('should cancel and refund when enough time remains', () => {
    let initialLockBalance
    let initialKeyOwnerBalance
    let txObj

    before(async () => {
      initialLockBalance = await getBalance(lock.address)
      initialKeyOwnerBalance = await getBalance(keyOwners[0])

      txObj = await lock.expireAndRefundFor(tokenIds[0], refundAmount, {
        from: lockCreator,
      })
    })

    it('should emit a CancelKey event', async () => {
      assert.equal(txObj.logs[0].event, 'CancelKey')
    })

    it('the amount of refund should be the key price', async () => {
      const refund = new BigNumber(txObj.logs[0].args.refund)
      assert.equal(refund.toString(), keyPrice.toString())
    })

    it('should make the key no longer valid (i.e. expired)', async () => {
      const isValid = await lock.getHasValidKey(keyOwners[0])
      assert.equal(isValid, false)
    })

    it("should increase the owner's balance with the amount of funds refunded from the lock", async () => {
      const txHash = await ethers.provider.getTransaction(txObj.tx)
      const gasUsed = new BigNumber(txObj.receipt.gasUsed)
      const gasPrice = new BigNumber(txHash.gasPrice)
      const txFee = gasPrice.times(gasUsed)
      const finalOwnerBalance = await getBalance(keyOwners[0])
      assert(
        finalOwnerBalance.toString(),
        initialKeyOwnerBalance.plus(keyPrice).minus(txFee).toString()
      )
    })

    it("should increase the lock's balance by the keyPrice", async () => {
      const finalLockBalance = (await getBalance(lock.address)).minus(
        initialLockBalance
      )

      assert(
        finalLockBalance.toFixed(),
        initialLockBalance.minus(keyPrice).toFixed()
      )
    })
  })

  describe('should fail when', () => {
    it('invoked by the key owner', async () => {
      await reverts(
        lock.expireAndRefundFor(tokenIds[3], refundAmount, {
          from: keyOwners[3],
        }),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('invoked by another user', async () => {
      await reverts(
        lock.expireAndRefundFor(tokenIds[3], refundAmount, {
          from: accounts[1],
        }),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('the Lock owner withdraws too much funds', async () => {
      await lock.withdraw(await lock.tokenAddress(), 0, {
        from: lockCreator,
      })
      await reverts(
        lock.expireAndRefundFor(tokenIds[3], refundAmount, {
          from: lockCreator,
        }),
        ''
      )
    })

    it('the key is expired', async () => {
      await lock.expireAndRefundFor(tokenIds[3], 0, {
        from: lockCreator,
      })
      await reverts(
        lock.expireAndRefundFor(tokenIds[3], refundAmount, {
          from: lockCreator,
        }),
        'KEY_NOT_VALID'
      )
    })

    it('the key does not exist', async () => {
      await reverts(
        lock.expireAndRefundFor(18, refundAmount, {
          from: lockCreator,
        }),
        'NO_SUCH_KEY'
      )
    })
  })
})
