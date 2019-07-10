const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / transferFee', accounts => {
  let lock
  const keyPrice = new BigNumber(Units.convert('0.01', 'eth', 'wei'))
  const keyOwner = accounts[1]

  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    // TODO test using an ERC20 priced lock as well
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
    await lock.purchase(keyOwner, web3.utils.padLeft(0, 40), {
      value: keyPrice.toFixed(),
    })
  })

  it('has a default fee of 0%', async () => {
    const feeNumerator = new BigNumber(await lock.transferFeeNumerator.call())
    const feeDenominator = new BigNumber(
      await lock.transferFeeDenominator.call()
    )
    assert.equal(feeNumerator.div(feeDenominator).toFixed(), 0.0)
  })

  describe('once a fee of 5% is set', () => {
    before(async () => {
      // Change the fee to 0.05%
      await lock.updateTransferFee(5, 100)
    })

    it('estimates the transfer fee, which is 5% of keyPrice or less', async () => {
      const fee = new BigNumber(await lock.getTransferFee.call(keyOwner))
      assert(fee.lte(keyPrice.times(0.05)))
    })

    describe('when the key is transfered', () => {
      const newOwner = accounts[2]

      it('should fail if the fee is not included', async () => {
        await shouldFail(
          lock.transferFrom(
            keyOwner,
            newOwner,
            await lock.getTokenIdFor.call(keyOwner),
            {
              from: keyOwner,
            }
          )
        )
      })

      describe('can transfer using transferFrom when the fee is paid', () => {
        let tokenId
        let keyOwnerInitialBalance
        let lockInitialBalance
        let transferGasCost
        let estimatedTransferFee

        before(async () => {
          keyOwnerInitialBalance = new BigNumber(
            await web3.eth.getBalance(keyOwner)
          )
          lockInitialBalance = new BigNumber(
            await web3.eth.getBalance(lock.address)
          )
          tokenId = await lock.getTokenIdFor.call(keyOwner)
          estimatedTransferFee = await lock.getTransferFee.call(keyOwner)

          const tx = await lock.transferFrom(keyOwner, newOwner, tokenId, {
            from: keyOwner,
            value: estimatedTransferFee,
          })

          const gasPrice = new BigNumber(
            (await web3.eth.getTransaction(tx.tx)).gasPrice
          )
          transferGasCost = gasPrice.times(tx.receipt.gasUsed)
        })

        it('transfer was successful', async () => {
          const owner = await lock.ownerOf(tokenId)
          assert.equal(owner, newOwner)
        })

        it('transfer fee was paid by the keyOwner', async () => {
          const keyOwnerBalance = new BigNumber(
            await web3.eth.getBalance(keyOwner)
          )
          assert.equal(
            keyOwnerBalance.toFixed(),
            keyOwnerInitialBalance
              .minus(transferGasCost)
              .minus(estimatedTransferFee)
              .toFixed()
          )
        })

        it('transfer fee was received by the contract', async () => {
          const lockBalance = new BigNumber(
            await web3.eth.getBalance(lock.address)
          )
          assert.equal(
            lockBalance.toFixed(),
            lockInitialBalance.plus(estimatedTransferFee).toFixed()
          )
        })

        after(async () => {
          // Reset owners
          await lock.transferFrom(
            newOwner,
            keyOwner,
            await lock.getTokenIdFor.call(newOwner),
            {
              from: newOwner,
              value: await lock.getTransferFee.call(newOwner),
            }
          )
        })
      })
    })

    describe('the lock owner can change the fee', () => {
      let tx

      before(async () => {
        // Change the fee to 0.025%
        tx = await lock.updateTransferFee(1, 4000)
      })

      it('has an updated fee', async () => {
        const feeNumerator = new BigNumber(
          await lock.transferFeeNumerator.call()
        )
        const feeDenominator = new BigNumber(
          await lock.transferFeeDenominator.call()
        )
        assert.equal(feeNumerator.div(feeDenominator).toFixed(), 0.00025)
      })

      it('emits the TransferFeeDenominatorChanged event', async () => {
        assert.equal(tx.logs[0].event, 'TransferFeeChanged')
        assert.equal(tx.logs[0].args.oldTransferFeeNumerator, 5)
        assert.equal(tx.logs[0].args.oldTransferFeeDenominator, 100)
        assert.equal(tx.logs[0].args.transferFeeNumerator, 1)
        assert.equal(tx.logs[0].args.transferFeeDenominator, 4000)
      })
    })

    describe('should fail if', () => {
      it('called by an account which does not own the lock', async () => {
        await shouldFail(lock.updateTransferFee(1, 100, { from: accounts[1] }))
      })

      it('attempt to set the denominator to 0', async () => {
        await shouldFail(lock.updateTransferFee(1, 0), 'INVALID_RATE')
      })
    })
  })
})
