const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const Web3Utils = require('web3-utils')
const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const getTokenBalance = require('../helpers/getTokenBalance')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

const TestErc20Token = artifacts.require('TestErc20Token.sol')

let unlock, locks

contract('Lock / destroyLock', accounts => {
  let lock
  let testToken
  const scenarios = [false, true]

  before(async () => {
    testToken = await TestErc20Token.new()
    // Mint some tokens for testing
    for (let i = 0; i < accounts.length; i++) {
      await testToken.mint(accounts[i], '1000000000000000000', {
        from: accounts[0],
      })
    }
  })

  scenarios.forEach(isErc20 => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      let tokenAddress
      before(async () => {
        tokenAddress = isErc20 ? testToken.address : Web3Utils.padLeft(0, 40)
        unlock = await getProxy(unlockContract)
        locks = await deployLocks(unlock, accounts[0], tokenAddress)
        lock = locks['FIRST']

        for (let i = 0; i < accounts.length; i++) {
          await testToken.approve(lock.address, -1, { from: accounts[i] })
        }

        // Add ETH to the lock, even if it's priced in ERC20
        // TODO: should we block this from happening instead?
        await lock.purchase(0, accounts[9], web3.utils.padLeft(0, 40), [], {
          from: accounts[9],
          value: Units.convert('0.01', 'eth', 'wei'),
        })
      })

      it('should fail if called by the wrong account', async () => {
        await shouldFail(lock.destroyLock({ from: accounts[1] }), '')
      })

      describe('when called by the owner', () => {
        let initialLockBalance, initialOwnerBalance, txObj, event

        before(async () => {
          let value =
            tokenAddress === Web3Utils.padLeft(0, 40)
              ? Units.convert('0.01', 'eth', 'wei')
              : 0

          await lock.purchase(0, accounts[1], web3.utils.padLeft(0, 40), [], {
            from: accounts[1],
            value,
          })
          assert.equal(await lock.getHasValidKey.call(accounts[1]), true) // pre-req

          initialLockBalance = await getTokenBalance(lock.address, tokenAddress)
          initialOwnerBalance = await getTokenBalance(accounts[0], tokenAddress)
          await lock.disableLock() // We can't destroy a lock without first disabling it
          txObj = await lock.destroyLock({ from: accounts[0] })
          event = txObj.logs[0]
        })

        it('owner should have received funds from the contract', async () => {
          const finalOwnerBalance = await getTokenBalance(
            accounts[0],
            tokenAddress
          )
          assert(finalOwnerBalance.gt(initialOwnerBalance))
        })

        it('contract should no longer have any funds', async () => {
          const finalLockBalance = await getTokenBalance(
            lock.address,
            tokenAddress
          )
          assert.equal(finalLockBalance.toFixed(), 0)
        })

        it("contract should no longer have any ETH even if it's priced in ERC20", async () => {
          const finalLockBalance = new BigNumber(
            await web3.eth.getBalance(lock.address)
          )
          assert.equal(finalLockBalance.toFixed(), 0)
        })

        // TODO the event is not decoded, making this test hard to implement
        it.skip('should trigger the Destroy event', () => {
          assert.equal(event.event, 'Destroy')
          assert.equal(
            new BigNumber(event.args.balance).toFixed(),
            initialLockBalance.toFixed()
          )
          assert.equal(event.args.owner, accounts[0])
        })

        it('previously valid key is no longer valid', async () => {
          if (!process.env.TEST_COVERAGE) {
            try {
              await lock.getHasValidKey.call(accounts[1])
            } catch (e) {
              assert.equal(
                e,
                "Error: Returned values aren't valid, did it run Out of Gas?"
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
            let initialLockBalance = await getTokenBalance(
              lock.address,
              tokenAddress
            )
            assert.equal(initialLockBalance.toFixed(), 0)

            let value =
              tokenAddress === Web3Utils.padLeft(0, 40)
                ? Units.convert('0.01', 'eth', 'wei')
                : 0

            // This line does not fail, but instead calls the fallback function and sends msg.value to the destroyed contract.
            await lock.purchase(0, accounts[1], web3.utils.padLeft(0, 40), [], {
              from: accounts[1],
              value,
            })

            let finalLockBalance = await getTokenBalance(
              lock.address,
              tokenAddress
            )
            assert.equal(
              finalLockBalance.toFixed(),
              isErc20 ? 0 : 10000000000000000
            )

            // The user did not purchase a key, but still sent their eth to the contract.
            // Calling getHasValidKey will fail
            // assert.equal(await lock.getHasValidKey.call(accounts[1]), false)
          } else {
            try {
              await lock.purchase(
                0,
                accounts[1],
                web3.utils.padLeft(0, 40),
                [],
                {
                  value: Units.convert('0.01', 'eth', 'wei'),
                }
              )
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
})
