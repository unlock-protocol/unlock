const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const Web3Utils = require('web3-utils')
const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / shareKey', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let lock
  const keyOwners = [accounts[1], accounts[2], accounts[3]]
  const accountWithNoKey = accounts[4]
  const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))

  before(async () => {
    lock = locks['FIRST']
    const purchases = keyOwners.map(account => {
      return lock.purchase(0, account, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: account,
      })
    })
    await Promise.all(purchases)
  })

  describe('failing to share a key', () => {
    describe('not meeting pre-requisites', () => {
      it('sender does not have a key', async () => {
        await shouldFail(
          lock.shareKey(
            accountWithNoKey,
            accounts[7],
            11,
            1000,
            {
              from: accountWithNoKey,
            },
            'KEY_NOT_VALID'
          )
        )
      })
      it('called by other than keyOwner or approved ', async () => {
        await shouldFail(
          lock.shareKey(
            keyOwners[0],
            accounts[3],
            await lock.getTokenIdFor.call(keyOwners[0]),
            1000,
            {
              from: accounts[6],
            },
            'KEY_NOT_VALID'
          )
        )
      })

      it('should abort if the recipient is 0x', async () => {
        await shouldFail(
          lock.shareKey(
            keyOwners[0],
            Web3Utils.padLeft(0, 40),
            await lock.getTokenIdFor.call(keyOwners[0]),
            1000,
            {
              from: accounts[6],
            },
            'INVALID_ADDRESS'
          )
        )
      })
    })
    describe('fallback behaviors', () => {
      it('transfers all remaining time if amount to share >= remaining time', async () => {
        let timestamp = new BigNumber(
          await lock.keyExpirationTimestampFor.call(keyOwners[0])
        )
        let now = Math.floor(Date.now() / 1000)
        let timeRemaining = timestamp.minus(now)
        await lock.shareKey(
          keyOwners[0],
          accountWithNoKey,
          await lock.getTokenIdFor.call(keyOwners[0]),
          timeRemaining + 1000, // trying to share too much
          {
            from: keyOwners[0],
          }
        )
      })
      it('does not expire the origin key', async () => {})
    })
  })
  describe('successful key sharing', () => {
    it('should subtract the time shared + fee from keyOwner', async () => {})
    it('should create a new key and add the time shared to it', async () => {})
    it('should extend the key of an existing owner', async () => {})
  })
})
