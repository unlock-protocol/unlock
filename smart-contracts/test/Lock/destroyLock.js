const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', accounts => {
  let lock

  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock)
    lock = locks['FIRST']
  })

  describe('destroyLock', () => {
    it('should fail if called by the wrong account', async () => {
      await shouldFail(lock.destroyLock({ from: accounts[1] }), '')
    })

    describe('when called by the owner', () => {
      let initialLockBalance, initialOwnerBalance, txObj, event

      before(async () => {
        await lock.purchaseFor(accounts[1], Web3Utils.toHex('Julien'), {
          value: Units.convert('0.01', 'eth', 'wei')
        })
        assert.equal(await lock.getHasValidKey.call(accounts[1]), true) // pre-req

        initialLockBalance = new BigNumber(
          await web3.eth.getBalance(lock.address)
        )
        initialOwnerBalance = new BigNumber(
          await web3.eth.getBalance(accounts[0])
        )
        await lock.disableLock() // We can't destroy a lock without first disabling it
        txObj = await lock.destroyLock({ from: accounts[0] })
        event = txObj.logs[0]
      })

      it('owner should have received funds from the contract', async () => {
        const finalOwnerBalance = new BigNumber(
          await web3.eth.getBalance(accounts[0])
        )
        assert(finalOwnerBalance.gt(initialOwnerBalance))
      })

      it('contract should no longer have any funds', async () => {
        const finalLockBalance = new BigNumber(
          await web3.eth.getBalance(lock.address)
        )
        assert.equal(finalLockBalance.toFixed(), 0)
      })

      it('should trigger the Destroy event', () => {
        assert.equal(event.event, 'Destroy')
        assert(new BigNumber(event.args.balance).eq(initialLockBalance))
        assert.equal(event.args.owner, accounts[0])
      })

      it('previously valid key is no longer valid', async () => {
        if (!process.env.TEST_COVERAGE) {
          try {
            await lock.getHasValidKey.call(accounts[1])
          } catch (e) {
            assert.equal(
              e,
              'Error: Returned values aren\'t valid, did it run Out of Gas?'
            )
          }
        } else {
          try {
            await lock.getHasValidKey.call(accounts[1])
          } catch (e) {
            assert(e.message.endsWith('is not a contract address'))
            return
          }
          throw new Error('Expected error')
        }
      })

      // After selfdestruct, a user can't buy a key, but if they try they loose their money.
      it('does not allow people to purchase new keys', async () => {
        if (!process.env.TEST_COVERAGE) {
          let initialLockBalance = new BigNumber(
            await web3.eth.getBalance(lock.address)
          ).toFixed()
          assert.equal(initialLockBalance, 0)

          // This line does not fail, but instead calls the fallback function and sends msg.value to the destroyed contract.
          await lock.purchaseFor(accounts[1], Web3Utils.toHex('Julien'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })

          let finalLockBalance = new BigNumber(
            await web3.eth.getBalance(lock.address)
          ).toFixed()
          assert.equal(finalLockBalance, 10000000000000000)

          // The user did not purchase a key, but still sent their eth to the contract.
          // Calling getHasValidKey will fail
          // assert.equal(await lock.getHasValidKey.call(accounts[1]), false)
        } else {
          try {
            await lock.purchaseFor(accounts[1], Web3Utils.toHex('Julien'), {
              value: Units.convert('0.01', 'eth', 'wei')
            })
          } catch (e) {
            assert(e.message.endsWith('is not a contract address'))
            return
          }
          throw new Error('Expected error')
        }
      })
    })
  })
})
