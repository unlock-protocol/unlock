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
        return deployLocks(unlock)
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
      }), 'Key is not valid')
    })

    it('should fail if the key has already expired', async () => {
      await locks['FIRST'].purchaseFor(accounts[2], Web3Utils.toHex('Julien'), {
        value: locks['FIRST'].params.keyPrice.toFixed(),
        from: accounts[0]
      })
      const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[2]))
      const now = Math.floor(new Date().getTime() / 1000)
      assert(expirationTimestamp.gt(now))
      await locks['FIRST'].expireKeyFor(accounts[2], {
        from: accounts[0]
      })
      await shouldFail(locks['FIRST'].expireKeyFor(accounts[2], {
        from: accounts[0]
      }), 'Key is not valid')
    })

    it('should expire a valid key', async () => {
      await locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('Julien'), {
        value: locks['FIRST'].params.keyPrice.toFixed(),
        from: accounts[0]
      })
      let expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[1]))
      let now = Math.floor(new Date().getTime() / 1000)
      assert(expirationTimestamp.gt(now))
      await locks['FIRST'].expireKeyFor(accounts[1], {
        from: accounts[0]
      })
      expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[1]))
      now = Math.floor(new Date().getTime() / 1000)
      assert(expirationTimestamp.lte(now))
    })
  })
})
