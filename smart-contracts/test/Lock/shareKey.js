const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const Web3Utils = require('web3-utils')
const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / shareKey', accounts => {
  let lock
  const keyOwner = accounts[1]
  // const recipient1 = accounts[1]
  // const recipient2 = accounts[2]
  const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['First']
    return lock.purchase(0, keyOwner, web3.utils.padLeft(0, 40), [], {
      value: keyPrice.toFixed(),
      from: keyOwner,
    })
  })
  describe('should fail when', () => {
    it('sender does not have a key', async () => {
      await shouldFail(
        lock.shareKey(
          accounts[6],
          accounts[7],
          11,
          1000,
          {
            from: accounts(6),
          },
          'KEY_NOT_VALID'
        )
      )
    })

    it('called by other than keyOwner or approved ', async () => {
      await shouldFail(
        lock.shareKey(
          keyOwner,
          accounts[3],
          await lock.getTokenIdFor.call(keyOwner),
          1000,
          {
            from: accounts(6),
          },
          'KEY_NOT_VALID'
        )
      )
    })

    it('should abort if the recipient is 0x', async () => {
      await shouldFail(
        lock.shareKey(
          keyOwner,
          Web3Utils.padLeft(0, 40),
          await lock.getTokenIdFor.call(keyOwner),
          1000,
          {
            from: accounts(6),
          },
          'INVALID_ADDRESS'
        )
      )
    })
    describe('when keyOwner does not have enough time remaining', () => {
      it('should fail when trying to share more than available time', async () => {})
    })
    describe('when keyOwner has enough time remaining', () => {
      it('should subtract the time shared + fee from keyOwner', async () => {})
    })
  })
})
