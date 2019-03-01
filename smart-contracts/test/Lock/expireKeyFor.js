const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock, accounts[0])
      })
      .then(_locks => {
        locks = _locks
      })
  })

  describe('expireKeyFor', () => {
    it('should fail if not invoked by lock owner', async () => {
      await shouldFail(locks['FIRST'].expireKeyFor(accounts[1], {
        from: accounts[8]
      }), '')
    })

    it('should fail if there is no such key', async () => {
      await shouldFail(locks['FIRST'].expireKeyFor(accounts[1], {
        from: accounts[0]
      }), 'KEY_NOT_VALID')
    })

    it('should fail if the key has already expired', async () => {
      await locks['FIRST'].purchaseFor(accounts[2], Web3Utils.toHex('Julien'), {
        value: locks['FIRST'].params.keyPrice.toFixed(),
        from: accounts[0]
      })
      const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor.call(accounts[2]))
      const now = Math.floor(new Date().getTime() / 1000)
      assert(expirationTimestamp.gt(now))
      await locks['FIRST'].expireKeyFor(accounts[2], {
        from: accounts[0]
      })
      await shouldFail(locks['FIRST'].expireKeyFor(accounts[2], {
        from: accounts[0]
      }), 'KEY_NOT_VALID')
    })

    describe('should expire a valid key', () => {
      let ID
      let event

      before(async () => {
        await locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('Julien'), {
          value: locks['FIRST'].params.keyPrice.toFixed(),
          from: accounts[0]
        })
        ID = await locks['FIRST'].getTokenIdFor(accounts[1])
        const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor.call(accounts[1]))
        const now = Math.floor(new Date().getTime() / 1000)
        // Pre-condition
        assert(expirationTimestamp.gt(now))
        const result = await locks['FIRST'].expireKeyFor(accounts[1], {
          from: accounts[0]
        })
        event = result.logs[0]
      })

      it('should expire a valid key', async () => {
        const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor.call(accounts[1]))
        const now = Math.floor(new Date().getTime() / 1000)
        assert(expirationTimestamp.lte(now))
      })

      it('should emit an ExpireKey event', async () => {
        assert.equal(event.event, 'ExpireKey')
        assert.equal(event.args.tokenId.toString(), ID)
      })
    })
  })
})
