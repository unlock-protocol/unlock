const truffleAssert = require('../helpers/errors')
const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const { deployERC20 } = require('../helpers')
const deployLocks = require('../helpers/deployLocks')
const getContractInstance = require('../helpers/truffle-artifacts')
const { ADDRESS_ZERO } = require('../helpers/constants')
const { getBalance } = require('../helpers')

const unlockContract = artifacts.require('Unlock.sol')

const scenarios = [false, true]
let unlock
let locks
let testToken
const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const tip = new BigNumber(keyPrice.toString()).plus(
  ethers.utils.parseUnits('1', 'ether').toString()
)

contract('Lock / purchaseTip', (accounts) => {
  scenarios.forEach((isErc20, i) => {
    let lock
    let tokenAddress

    if (i === 1) return

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        testToken = await deployERC20(accounts[0])
        // Mint some tokens for testing
        await testToken.mint(accounts[2], '100000000000000000000', {
          from: accounts[0],
        })

        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO

        unlock = await getContractInstance(unlockContract)
        locks = await deployLocks(unlock, accounts[0], tokenAddress)
        lock = locks.FIRST

        // Approve spending
        await testToken.approve(lock.address, tip, {
          from: accounts[2],
        })
      })

      describe('purchase with exact value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            [keyPrice.toString()],
            [accounts[2]],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]],
            {
              from: accounts[2],
              value: isErc20 ? 0 : keyPrice.toString(),
            }
          )
        })

        it('user sent keyPrice to the contract', async () => {
          const balance = await getBalance(lock.address, tokenAddress)
          assert.equal(balance.toString(), keyPrice.toString())
        })
      })

      describe('purchase with tip', () => {
        beforeEach(async () => {
          await lock.purchase(
            [tip.toString()],
            [accounts[2]],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]],
            {
              from: accounts[2],
              value: isErc20 ? 0 : tip.toString(),
            }
          )
        })

        it('user sent the tip to the contract', async () => {
          const balance = await getBalance(lock.address, tokenAddress)
          assert.notEqual(balance.toString(), keyPrice.toString())
          assert.equal(balance.toString(), tip.toString())
        })
      })

      describe('purchase with ETH tip > value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            [keyPrice.toString()],
            [accounts[2]],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]],
            {
              from: accounts[2],
              value: isErc20 ? 0 : tip.toString(),
            }
          )
        })

        it('user sent tip to the contract if ETH (else send keyPrice)', async () => {
          const balance = await getBalance(lock.address, tokenAddress)
          if (!isErc20) {
            assert.equal(balance.toString(), tip.toString())
          } else {
            assert.equal(balance.toString(), keyPrice.toString())
          }
        })
      })

      if (!isErc20) {
        describe('purchase with unspecified ETH tip', () => {
          beforeEach(async () => {
            await lock.purchase(
              [],
              [accounts[2]],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              [[]],
              {
                from: accounts[2],
                value: isErc20 ? 0 : tip.toString(),
              }
            )
          })

          it('user sent tip to the contract if ETH (else send keyPrice)', async () => {
            const balance = await getBalance(lock.address, tokenAddress)
            if (!isErc20) {
              assert.equal(balance.toString(), tip.toString())
            } else {
              assert.equal(balance.toString(), keyPrice.toString())
            }
          })
        })
      }

      if (isErc20) {
        it('should fail if value is less than keyPrice', async () => {
          await truffleAssert.fails(
            lock.purchase(
              [1],
              [accounts[2]],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              [[]],
              {
                from: accounts[2],
                value: isErc20 ? 0 : keyPrice.toString(),
              }
            ),
            'revert',
            'INSUFFICIENT_VALUE'
          )
        })
      }
    })
  })
})
