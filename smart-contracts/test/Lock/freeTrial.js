const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const { getBalance, ADDRESS_ZERO } = require('../helpers')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let unlock
let locks
let tokenId

contract('Lock / freeTrial', (accounts) => {
  let lock
  const keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]
  const keyPrice = ethers.utils.parseUnits('0.01', 'ether')

  beforeEach(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.SECOND
    const tx = await lock.purchase(
      [],
      keyOwners,
      keyOwners.map(() => ADDRESS_ZERO),
      keyOwners.map(() => ADDRESS_ZERO),
      keyOwners.map(() => []),
      {
        value: keyPrice.mul(keyOwners.length),
        from: keyOwners[1],
      }
    )
    const tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
    tokenId = tokenIds[0]
  })

  it('No free trial by default', async () => {
    const freeTrialLength = new BigNumber(await lock.freeTrialLength())
    assert.equal(freeTrialLength.toNumber(), 0)
  })

  describe('with a free trial defined', () => {
    let initialLockBalance

    beforeEach(async () => {
      await lock.updateRefundPenalty(5, 2000)
      initialLockBalance = await getBalance(lock.address)
    })

    describe('should cancel and provide a full refund when enough time remains', () => {
      beforeEach(async () => {
        await lock.cancelAndRefund(tokenId, {
          from: keyOwners[0],
        })
      })

      it('should provide a full refund', async () => {
        const refundAmount = initialLockBalance.minus(
          await getBalance(lock.address)
        )
        assert.equal(refundAmount.toString(), keyPrice.toString())
      })
    })

    describe('should cancel and provide a partial refund after the trial expires', () => {
      beforeEach(async () => {
        await sleep(6000)
        await lock.cancelAndRefund(tokenId, {
          from: keyOwners[0],
        })
      })

      it('should provide less than a full refund', async () => {
        const refundAmount = initialLockBalance.minus(
          await getBalance(lock.address)
        )
        assert.notEqual(refundAmount.toString(), keyPrice.toString())
        assert(refundAmount.lt(keyPrice.toString()))
      })
    })
  })
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
