const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / transferFee', accounts => {
  let lock
  const keyPrice = new BigNumber(Units.convert('0.01', 'eth', 'wei'))
  const keyOwner = accounts[1]

  before(async () => {
    unlock = await getProxy(unlockContract)
    // TODO test using an ERC20 priced lock as well
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
    await lock.purchase(0, keyOwner, web3.utils.padLeft(0, 40), [], {
      value: keyPrice.toFixed(),
    })
  })

  it('has a default fee of 0%', async () => {
    const feeNumerator = new BigNumber(await lock.transferFeeBasisPoints.call())
    const feeDenominator = new BigNumber(await lock.BASIS_POINTS_DEN.call())
    assert.equal(feeNumerator.div(feeDenominator).toFixed(), 0.0)
  })

  describe('once a fee of 5% is set', () => {
    let fee, fee1, fee2, fee3, nowBefore
    before(async () => {
      // Change the fee to 5%
      await lock.updateTransferFee(500)
      nowBefore = Math.floor(Date.now() / 1000)
    })

    it('estimates the transfer fee, which is 5% of remaining duration or less', async () => {
      fee = new BigNumber(await lock.getTransferFee.call(keyOwner, 0))
      let expiration = new BigNumber(
        await lock.keyExpirationTimestampFor.call(keyOwner)
      )
      console.log(fee.toFixed())
      console.log(
        expiration
          .minus(nowBefore)
          .times(0.05)
          .toFixed()
      )

      let nowAfter = Math.ceil(Date.now() / 1000)
      console.log(
        expiration
          .minus(nowAfter)
          .times(0.05)
          .toFixed()
      )
      assert(fee.lte(expiration.minus(nowBefore).times(0.05)))
      //fee should be less or equal to 5% of remaining time(expirationTimestamp - block.timestamp)
      // remaining time before should be greater, so 5% should be greater before
      assert(fee.gte(expiration.minus(nowAfter).times(0.05)))
    })

    it('calculates the fee based on the time value passed in', async () => {
      fee1 = await lock.getTransferFee.call(keyOwner, 100)
      fee2 = await lock.getTransferFee.call(keyOwner, 60 * 60 * 24 * 365)
      fee3 = await lock.getTransferFee.call(keyOwner, 60 * 60 * 24 * 30)
      assert.equal(fee1, 5)
      assert.equal(fee2, 1576800)
      assert.equal(fee3, 129600)
    })

    describe('when the key is transfered', () => {
      const newOwner = accounts[2]
      let tokenId, expirationBefore, expirationAfter, fee

      before(async () => {
        tokenId = await lock.getTokenIdFor.call(keyOwner)
        expirationBefore = new BigNumber(
          await lock.keyExpirationTimestampFor(keyOwner)
        )
        fee = await lock.getTransferFee(keyOwner, 0)
        await lock.transferFrom(keyOwner, newOwner, tokenId, {
          from: keyOwner,
        })
        expirationAfter = new BigNumber(
          await lock.keyExpirationTimestampFor(newOwner)
        )
      })

      it('the fee is deducted from the time transferred', async () => {
        console.log(expirationBefore.toFixed())
        console.log(expirationAfter.toFixed())
        console.log(expirationBefore.minus(fee).toFixed())
        assert(expirationAfter.lt(expirationBefore))
        assert(expirationAfter.lte(expirationBefore.minus(fee)))
      })

      after(async () => {
        // Reset owners
        await lock.transferFrom(
          newOwner,
          keyOwner,
          await lock.getTokenIdFor.call(newOwner),
          {
            from: newOwner,
          }
        )
      })
    })

    describe('the lock owner can change the fee', () => {
      let tx

      before(async () => {
        // Change the fee to 0.25%
        tx = await lock.updateTransferFee(25)
      })

      it('has an updated fee', async () => {
        const feeNumerator = new BigNumber(
          await lock.transferFeeBasisPoints.call()
        )
        const feeDenominator = new BigNumber(await lock.BASIS_POINTS_DEN.call())
        assert.equal(feeNumerator.div(feeDenominator).toFixed(), 0.0025)
      })

      it('emits TransferFeeChanged event', async () => {
        assert.equal(tx.logs[0].event, 'TransferFeeChanged')
        assert.equal(tx.logs[0].args.transferFeeBasisPoints.toString(), 25)
      })
    })

    describe('should fail if', () => {
      it('called by an account which does not own the lock', async () => {
        await shouldFail(lock.updateTransferFee(1000, { from: accounts[1] }))
      })
    })
  })
})
