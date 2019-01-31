const Units = require('ethereumjs-units')
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

  describe('purchaseFor', () => {
    describe('when the contract has a public key release', () => {
      it('should fail if the price is not enough', async () => {
        await shouldFail(locks['FIRST']
          .purchaseFor(accounts[0], Web3Utils.toHex('Julien'), {
            value: Units.convert('0.0001', 'eth', 'wei')
          }), 'Insufficient funds')
        // Making sure we do not have a key set!
        await shouldFail(locks['FIRST'].keyExpirationTimestampFor(accounts[0]), 'No such key')
      })

      it('should fail if we reached the max number of keys', async () => {
        await locks['SINGLE KEY']
          .purchaseFor(accounts[0], Web3Utils.toHex('Julien'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
        const keyData = await locks['SINGLE KEY'].keyDataFor(accounts[0])
        assert.equal(Web3Utils.toUtf8(keyData), 'Julien')
        await shouldFail(locks['SINGLE KEY'].purchaseFor(accounts[1], Web3Utils.toHex('Satoshi'), {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accounts[1]
        }), 'Maximum number of keys already sold')
        await shouldFail(locks['SINGLE KEY'].keyDataFor(accounts[1]), 'No such key')
      })

      it('should trigger an event when successful', async () => {
        const tx = await locks['FIRST']
          .purchaseFor(accounts[2], Web3Utils.toHex('Vitalik'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
        assert.equal(tx.logs[0].event, 'Transfer')
        assert.equal(tx.logs[0].args._from, 0)
        assert.equal(tx.logs[0].args._to, accounts[2])
      })

      describe('when the user already owns an expired key', () => {
        it('should expand the validity by the default key duration', async () => {
          await locks['SECOND'].purchaseFor(accounts[4], Web3Utils.toHex('Satoshi'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
          // let's now expire the key
          await locks['SECOND'].expireKeyFor(accounts[4])
          // Purchase a new one
          await locks['SECOND'].purchaseFor(accounts[4], Web3Utils.toHex('Satoshi'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
          // And check the expiration which shiuld be exactly now + keyDuration
          const expirationTimestamp = new BigNumber(await locks['SECOND'].keyExpirationTimestampFor(accounts[4]))
          const now = parseInt(new Date().getTime() / 1000)
          // we check +/- 10 seconds to fix for now being different inside the EVM and here... :(
          assert(expirationTimestamp.gt(locks['SECOND'].params.expirationDuration.plus(now - 10)))
          assert(expirationTimestamp.lt(locks['SECOND'].params.expirationDuration.plus(now + 10)))
        })
      })

      describe('when the user already owns a non expired key', () => {
        it('should expand the validity by the default key duration', async () => {
          await locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('Satoshi'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
          const firstKeyData = await locks['FIRST'].keyDataFor(accounts[1])
          assert.equal(Web3Utils.toUtf8(firstKeyData), 'Satoshi')
          const firstExpiration = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[1]))
          assert(firstExpiration.gt(0))
          await locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('Szabo'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
          const keyData = await locks['FIRST'].keyDataFor(accounts[1])
          assert.equal(Web3Utils.toUtf8(keyData), 'Szabo')
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[1]))
          assert.equal(expirationTimestamp.toFixed(), firstExpiration.plus(locks['FIRST'].params.expirationDuration).toFixed())
        })
      })

      describe('when the key was successfuly purchased', () => {
        let outstandingKeys, numberOfOwners, balance, now

        before(async () => {
          balance = new BigNumber(await web3.eth.getBalance(locks['FIRST'].address))
          outstandingKeys = new BigNumber(await locks['FIRST'].outstandingKeys())
          now = parseInt(new Date().getTime() / 1000)
          numberOfOwners = new BigNumber(await locks['FIRST'].numberOfOwners())
          return locks['FIRST'].purchaseFor(accounts[0], Web3Utils.toHex('Julien'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
        })

        it('should have the right data for the key', () => {
          return locks['FIRST']
            .keyDataFor(accounts[0])
            .then(keyData => {
              assert.equal(Web3Utils.toUtf8(keyData), 'Julien')
            })
        })

        it('should have the right expiration timestamp for the key', async () => {
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[0]))
          const expirationDuration = new BigNumber(await locks['FIRST'].expirationDuration())
          assert(expirationTimestamp.gte(expirationDuration.plus(now)))
        })

        it('should have added the funds to the contract', async () => {
          let newBalance = new BigNumber(await web3.eth.getBalance(locks['FIRST'].address))
          assert.equal(parseFloat(Units.convert(newBalance, 'wei', 'eth')), parseFloat(Units.convert(balance, 'wei', 'eth')) + 0.01)
        })

        it('should have increased the number of outstanding keys', async () => {
          const _outstandingKeys = new BigNumber(await locks['FIRST'].outstandingKeys.call())
          assert.equal(
            _outstandingKeys.toFixed(),
            outstandingKeys.plus(1).toFixed()
          )
        })

        it('should have increased the number of owners', async () => {
          const _numberOfOwners = new BigNumber(await locks['FIRST'].numberOfOwners.call())
          assert.equal(
            _numberOfOwners.toFixed(),
            numberOfOwners.plus(1).toFixed()
          )
        })
      })
    })
  })
})
