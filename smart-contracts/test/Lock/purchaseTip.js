const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const truffleAssert = require('truffle-assertions')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')

const TestErc20Token = artifacts.require('TestErc20Token.sol')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../helpers/proxy')

const scenarios = [false, true]
let unlock, locks, testToken
const keyPrice = Units.convert('0.01', 'eth', 'wei')
const tip = new BigNumber(keyPrice).plus(Units.convert('1', 'eth', 'wei'))

contract('Lock / purchaseTip', accounts => {
  scenarios.forEach(isErc20 => {
    let lock
    let tokenAddress

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        testToken = await TestErc20Token.new()
        // Mint some tokens for testing
        await testToken.mint(accounts[2], '100000000000000000000')

        tokenAddress = isErc20 ? testToken.address : Web3Utils.padLeft(0, 40)

        unlock = await getProxy(unlockContract)
        locks = await deployLocks(unlock, accounts[0], tokenAddress)
        lock = locks['FIRST']

        // Approve spending
        await testToken.approve(lock.address, -1, {
          from: accounts[2],
        })
      })

      describe('purchase with exact value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            keyPrice.toString(),
            accounts[2],
            web3.utils.padLeft(0, 40),
            [],
            {
              from: accounts[2],
              value: isErc20 ? 0 : keyPrice.toString(),
            }
          )
        })

        it('user sent keyPrice to the contract', async () => {
          const balance = await lock.getBalance(tokenAddress, lock.address)
          assert.equal(balance.toString(), keyPrice.toString())
        })
      })

      describe('purchase with tip', () => {
        beforeEach(async () => {
          await lock.purchase(
            tip.toString(),
            accounts[2],
            web3.utils.padLeft(0, 40),
            [],
            {
              from: accounts[2],
              value: isErc20 ? 0 : tip.toString(),
            }
          )
        })

        it('user sent the tip to the contract', async () => {
          const balance = await lock.getBalance(tokenAddress, lock.address)
          assert.notEqual(balance.toString(), keyPrice.toString())
          assert.equal(balance.toString(), tip.toString())
        })
      })

      describe('purchase with ETH tip > value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            keyPrice.toString(),
            accounts[2],
            web3.utils.padLeft(0, 40),
            [],
            {
              from: accounts[2],
              value: isErc20 ? 0 : tip.toString(),
            }
          )
        })

        it('user sent tip to the contract if ETH (else send keyPrice)', async () => {
          const balance = await lock.getBalance(tokenAddress, lock.address)
          if (!isErc20) {
            assert.equal(balance.toString(), tip.toString())
          } else {
            assert.equal(balance.toString(), keyPrice.toString())
          }
        })
      })

      describe('purchase with unspecified ETH tip', () => {
        beforeEach(async () => {
          await lock.purchase(0, accounts[2], web3.utils.padLeft(0, 40), [], {
            from: accounts[2],
            value: isErc20 ? 0 : tip.toString(),
          })
        })

        it('user sent tip to the contract if ETH (else send keyPrice)', async () => {
          const balance = await lock.getBalance(tokenAddress, lock.address)
          if (!isErc20) {
            assert.equal(balance.toString(), tip.toString())
          } else {
            assert.equal(balance.toString(), keyPrice.toString())
          }
        })
      })

      it('should fail if value is less than keyPrice', async () => {
        await truffleAssert.fails(
          lock.purchase(1, accounts[2], web3.utils.padLeft(0, 40), [], {
            from: accounts[2],
            value: isErc20 ? 0 : keyPrice.toString(),
          }),
          'revert',
          'INSUFFICIENT_VALUE'
        )
      })
    })
  })
})
