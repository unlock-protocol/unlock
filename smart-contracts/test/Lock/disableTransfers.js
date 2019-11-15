const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / disableTransfers', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let lock, tokenId
  const keyOwner = accounts[1]
  const accountWithNoKey = accounts[2]
  const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))
  const oneDay = new BigNumber(60 * 60 * 24)

  before(async () => {
    lock = locks['FIRST']
    await lock.purchase(0, keyOwner, web3.utils.padLeft(0, 40), [], {
      value: keyPrice.toFixed(),
      from: keyOwner,
    })
    // Change the fee to 100%
    await lock.updateTransferFee(10000)
  })

  describe('setting fee to 100%', () => {
    describe('disabling transferFrom', () => {
      it('should prevent key transfers by reverting', async () => {
        // check owner has a key
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
        tokenId = new BigNumber(await lock.getTokenIdFor.call(keyOwner))
        // try to transfer it
        await shouldFail(
          lock.transferFrom(keyOwner, accountWithNoKey, tokenId, {
            from: keyOwner,
          }),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
        // check recipient never received a key
        assert.equal(await lock.getHasValidKey.call(accountWithNoKey), false)
        assert.equal(
          new BigNumber(
            await lock.keyExpirationTimestampFor.call(accountWithNoKey)
          ),
          0
        )
      })
    })

    describe('disabling shareKey', () => {
      it('should prevent key sharing by reverting', async () => {
        // check owner has a key
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
        // try to share it
        await shouldFail(
          lock.shareKey(keyOwner, accountWithNoKey, tokenId, oneDay, {
            from: keyOwner,
          }),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(await lock.getHasValidKey.call(keyOwner), true)
        // check recipient never received a key
        assert.equal(await lock.getHasValidKey.call(accountWithNoKey), false)
        assert.equal(
          new BigNumber(
            await lock.keyExpirationTimestampFor.call(accountWithNoKey)
          ),
          0
        )
      })
    })
  })
})
