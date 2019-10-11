const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / purchaseFor', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  describe('when the contract has a public key release', () => {
    it('should fail if the price is not enough', async () => {
      await shouldFail(
        locks['FIRST'].purchase(0, accounts[0], web3.utils.padLeft(0, 40), [], {
          value: Units.convert('0.0001', 'eth', 'wei'),
        }),
        'NOT_ENOUGH_FUNDS'
      )
      // Making sure we do not have a key set!
      await shouldFail(
        locks['FIRST'].keyExpirationTimestampFor.call(accounts[0]),
        'HAS_NEVER_OWNED_KEY'
      )
    })

    it('should fail if we reached the max number of keys', async () => {
      await locks['SINGLE KEY'].purchase(
        0,
        accounts[0],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
        }
      )
      await shouldFail(
        locks['SINGLE KEY'].purchase(
          0,
          accounts[1],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: Units.convert('0.01', 'eth', 'wei'),
            from: accounts[1],
          }
        ),
        'LOCK_SOLD_OUT'
      )
    })

    it('should trigger an event when successful', async () => {
      const tx = await locks['FIRST'].purchase(
        0,
        accounts[2],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
        }
      )
      assert.equal(tx.logs[0].event, 'Transfer')
      assert.equal(tx.logs[0].args._from, 0)
      assert.equal(tx.logs[0].args._to, accounts[2])
    })

    describe('when the user already owns an expired key', () => {
      it('should expand the validity by the default key duration', async () => {
        await locks['SECOND'].purchase(
          0,
          accounts[4],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: Units.convert('0.01', 'eth', 'wei'),
          }
        )
        // let's now expire the key
        await locks['SECOND'].expireKeyFor(accounts[4])
        // Purchase a new one
        await locks['SECOND'].purchase(
          0,
          accounts[4],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: Units.convert('0.01', 'eth', 'wei'),
          }
        )
        // And check the expiration which shiuld be exactly now + keyDuration
        const expirationTimestamp = new BigNumber(
          await locks['SECOND'].keyExpirationTimestampFor.call(accounts[4])
        )
        const now = parseInt(new Date().getTime() / 1000)
        // we check +/- 10 seconds to fix for now being different inside the EVM and here... :(
        assert(
          expirationTimestamp.gt(
            locks['SECOND'].params.expirationDuration.plus(now - 10)
          )
        )
        assert(
          expirationTimestamp.lt(
            locks['SECOND'].params.expirationDuration.plus(now + 10)
          )
        )
      })
    })

    describe('when the user already owns a non expired key', () => {
      it('should expand the validity by the default key duration', async () => {
        await locks['FIRST'].purchase(
          0,
          accounts[1],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: Units.convert('0.01', 'eth', 'wei'),
          }
        )
        const firstExpiration = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(accounts[1])
        )
        assert(firstExpiration.gt(0))
        await locks['FIRST'].purchase(
          0,
          accounts[1],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: Units.convert('0.01', 'eth', 'wei'),
          }
        )
        const expirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(accounts[1])
        )
        assert.equal(
          expirationTimestamp.toFixed(),
          firstExpiration
            .plus(locks['FIRST'].params.expirationDuration)
            .toFixed()
        )
      })
    })

    describe('when the key was successfuly purchased', () => {
      let totalSupply, numberOfOwners, balance, now

      before(async () => {
        balance = new BigNumber(
          await web3.eth.getBalance(locks['FIRST'].address)
        )
        totalSupply = new BigNumber(await locks['FIRST'].totalSupply.call())
        now = parseInt(new Date().getTime() / 1000)
        numberOfOwners = new BigNumber(
          await locks['FIRST'].numberOfOwners.call()
        )
        return locks['FIRST'].purchase(
          0,
          accounts[0],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: Units.convert('0.01', 'eth', 'wei'),
          }
        )
      })

      it('should have the right expiration timestamp for the key', async () => {
        const expirationTimestamp = new BigNumber(
          await locks['FIRST'].keyExpirationTimestampFor.call(accounts[0])
        )
        const expirationDuration = new BigNumber(
          await locks['FIRST'].expirationDuration.call()
        )
        assert(expirationTimestamp.gte(expirationDuration.plus(now)))
      })

      it('should have added the funds to the contract', async () => {
        let newBalance = new BigNumber(
          await web3.eth.getBalance(locks['FIRST'].address)
        )
        assert.equal(
          parseFloat(Units.convert(newBalance, 'wei', 'eth')),
          parseFloat(Units.convert(balance, 'wei', 'eth')) + 0.01
        )
      })

      it('should have increased the number of outstanding keys', async () => {
        const _totalSupply = new BigNumber(
          await locks['FIRST'].totalSupply.call()
        )
        assert.equal(_totalSupply.toFixed(), totalSupply.plus(1).toFixed())
      })

      it('should have increased the number of owners', async () => {
        const _numberOfOwners = new BigNumber(
          await locks['FIRST'].numberOfOwners.call()
        )
        assert.equal(
          _numberOfOwners.toFixed(),
          numberOfOwners.plus(1).toFixed()
        )
      })
    })

    it('can purchase a free key', async () => {
      const tx = await locks['FREE'].purchase(
        0,
        accounts[2],
        web3.utils.padLeft(0, 40),
        []
      )
      assert.equal(tx.logs[0].event, 'Transfer')
      assert.equal(tx.logs[0].args._from, 0)
      assert.equal(tx.logs[0].args._to, accounts[2])
    })

    describe('can re-purchase an expired key', () => {
      before(async () => {
        await locks['SHORT'].purchase(
          0,
          accounts[4],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: Units.convert('0.01', 'eth', 'wei'),
          }
        )
        // let's now expire the key
        await locks['SHORT'].expireKeyFor(accounts[4])
        // sleep 10 seconds
        await sleep(10000)
      })

      it('should expand the validity by the default key duration', async () => {
        // Purchase a new one
        await locks['SHORT'].purchase(
          0,
          accounts[4],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: Units.convert('0.01', 'eth', 'wei'),
          }
        )
        // And check the expiration which shiuld be exactly now + keyDuration
        const expirationTimestamp = new BigNumber(
          await locks['SHORT'].keyExpirationTimestampFor.call(accounts[4])
        )
        const now = parseInt(new Date().getTime() / 1000)
        // we check +/- 10 seconds to fix for now being different inside the EVM and here... :(
        assert(
          expirationTimestamp.gt(
            locks['SHORT'].params.expirationDuration.plus(now - 10)
          )
        )
        assert(
          expirationTimestamp.lt(
            locks['SHORT'].params.expirationDuration.plus(now + 10)
          )
        )
      })
    })
  })
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
