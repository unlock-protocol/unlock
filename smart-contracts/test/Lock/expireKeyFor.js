const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / expireKeyFor', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should fail if not invoked by lock owner', async () => {
    await shouldFail(
      locks['FIRST'].expireKeyFor(accounts[1], {
        from: accounts[8],
      }),
      ''
    )
  })

  it('should fail if there is no such key', async () => {
    await shouldFail(
      locks['FIRST'].expireKeyFor(accounts[1], {
        from: accounts[0],
      }),
      'KEY_NOT_VALID'
    )
  })

  it('should fail if the key has already expired', async () => {
    await locks['FIRST'].purchase(
      0,
      accounts[2],
      web3.utils.padLeft(0, 40),
      [],
      {
        value: locks['FIRST'].params.keyPrice.toFixed(),
        from: accounts[0],
      }
    )
    const expirationTimestamp = new BigNumber(
      await locks['FIRST'].keyExpirationTimestampFor.call(accounts[2])
    )
    const now = Math.floor(new Date().getTime() / 1000)
    assert(expirationTimestamp.gt(now))
    await locks['FIRST'].expireKeyFor(accounts[2], {
      from: accounts[0],
    })
    await shouldFail(
      locks['FIRST'].expireKeyFor(accounts[2], {
        from: accounts[0],
      }),
      'KEY_NOT_VALID'
    )
  })

  describe('should expire a valid key', () => {
    let ID
    let event

    before(async () => {
      await locks['FIRST'].purchase(
        0,
        accounts[1],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: locks['FIRST'].params.keyPrice.toFixed(),
          from: accounts[0],
        }
      )
      ID = await locks['FIRST'].getTokenIdFor(accounts[1])
      const expirationTimestamp = new BigNumber(
        await locks['FIRST'].keyExpirationTimestampFor.call(accounts[1])
      )
      const now = Math.floor(new Date().getTime() / 1000)
      // Pre-condition
      assert(expirationTimestamp.gt(now))
      const result = await locks['FIRST'].expireKeyFor(accounts[1], {
        from: accounts[0],
      })
      event = result.logs[0]
    })

    it('should expire a valid key', async () => {
      const expirationTimestamp = new BigNumber(
        await locks['FIRST'].keyExpirationTimestampFor.call(accounts[1])
      )
      const now = Math.floor(new Date().getTime() / 1000)
      assert(expirationTimestamp.lte(now))
    })

    it('should emit an ExpireKey event', async () => {
      assert.equal(event.event, 'ExpireKey')
      assert.equal(event.args.tokenId.toString(), ID)
    })
  })
})
