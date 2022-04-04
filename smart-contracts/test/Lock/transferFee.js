const BigNumber = require('bignumber.js')

const { reverts } = require('truffle-assertions')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock
let locks

contract('Lock / transferFee', (accounts) => {
  let lock
  const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
  const keyOwner = accounts[1]
  const denominator = 10000
  let tokenId

  before(async () => {
    unlock = await getProxy(unlockContract)
    // TODO test using an ERC20 priced lock as well
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    const tx = await lock.purchase(
      [],
      [keyOwner],
      [web3.utils.padLeft(0, 40)],
      [web3.utils.padLeft(0, 40)],
      [[]],
      {
        value: keyPrice.toFixed(),
      }
    )

    const tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
    tokenId = tokenIds[0]
  })

  it('has a default fee of 0%', async () => {
    const feeNumerator = new BigNumber(await lock.transferFeeBasisPoints.call())
    assert.equal(feeNumerator.div(denominator).toFixed(), 0.0)
  })

  it('reverts if a non-manager attempts to change the fee', async () => {
    await reverts(
      lock.updateTransferFee(0, { from: accounts[1] }),
      'ONLY_LOCK_MANAGER'
    )
  })

  describe('once a fee of 5% is set', () => {
    let fee
    let fee1
    let fee2
    let fee3
    before(async () => {
      // Change the fee to 5%
      await lock.updateTransferFee(500)
    })

    it('estimates the transfer fee, which is 5% of remaining duration or less', async () => {
      const nowBefore = (await web3.eth.getBlock('latest')).timestamp
      fee = new BigNumber(await lock.getTransferFee.call(tokenId, 0))
      // Mine a transaction in order to ensure the block.timestamp has updated
      await lock.purchase(
        [],
        [accounts[8]],
        [web3.utils.padLeft(0, 40)],
        [web3.utils.padLeft(0, 40)],
        [[]],
        {
          value: keyPrice.toFixed(),
        }
      )
      const nowAfter = (await web3.eth.getBlock('latest')).timestamp
      let expiration = new BigNumber(
        await lock.keyExpirationTimestampFor.call(tokenId)
      )
      // Fee is <= the expected fee before the call
      assert(
        fee.lte(
          expiration.minus(nowBefore).times(0.05).dp(0, BigNumber.ROUND_DOWN)
        )
      )
      // and >= the expected fee after the call
      assert(
        fee.gte(
          expiration.minus(nowAfter).times(0.05).dp(0, BigNumber.ROUND_DOWN)
        )
      )
    })

    it('calculates the fee based on the time value passed in', async () => {
      fee1 = await lock.getTransferFee.call(tokenId, 100)
      fee2 = await lock.getTransferFee.call(tokenId, 60 * 60 * 24 * 365)
      fee3 = await lock.getTransferFee.call(tokenId, 60 * 60 * 24 * 30)
      assert.equal(fee1, 5)
      assert.equal(fee2, 1576800)
      assert.equal(fee3, 129600)
    })

    it('should revert if called for a non-existing key', async () => {
      await reverts(
        lock.getTransferFee(9, 0, {
          from: accounts[3],
        }),
        'NO_SUCH_KEY'
      )
    })

    describe('when the key is transferred', () => {
      const newOwner = accounts[2]
      let expirationBefore
      let expirationAfter
      let fee

      before(async () => {
        expirationBefore = new BigNumber(
          await lock.keyExpirationTimestampFor(tokenId)
        )
        fee = await lock.getTransferFee(tokenId, 0)
        await lock.transferFrom(keyOwner, newOwner, tokenId, {
          from: keyOwner,
        })
        expirationAfter = new BigNumber(
          await lock.keyExpirationTimestampFor(tokenId)
        )
      })

      it('the fee is deducted from the time transferred', async () => {
        // make sure that a fee was taken
        // fee may be over-estimated (but not under-estimated)
        assert(expirationAfter.gte(expirationBefore.minus(fee)))
        // if less than 5 seconds have passed than the delta should be <= 1
        assert(expirationAfter.lte(expirationBefore.minus(fee).plus(1)))
      })

      after(async () => {
        // Reset owners
        await lock.transferFrom(newOwner, keyOwner, tokenId, {
          from: newOwner,
        })
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
        assert.equal(feeNumerator.div(denominator).toFixed(), 0.0025)
      })

      it('emits TransferFeeChanged event', async () => {
        assert.equal(tx.logs[0].event, 'TransferFeeChanged')
        assert.equal(tx.logs[0].args.transferFeeBasisPoints.toString(), 25)
      })
    })

    describe('should fail if', () => {
      it('called by an account which does not own the lock', async () => {
        await reverts(lock.updateTransferFee(1000, { from: accounts[1] }))
      })
    })
  })
})
