const BigNumber = require('bignumber.js')
const { deployERC20, deployLock, reverts, ADDRESS_ZERO } = require('../helpers')

const Erc20Token = artifacts.require(
  '@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20'
)

const scenarios = [false, true]

let testToken
const keyPrice = web3.utils.toWei('0.01', 'ether')
const tip = new BigNumber(keyPrice).plus(web3.utils.toWei('1', 'ether'))

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
        lock = await deployLock({ tokenAddress })

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
          const balance = isErc20
            ? await Erc20Token.at(tokenAddress).balanceOf(lock.address)
            : await web3.eth.getBalance(lock.address)
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
          const balance = isErc20
            ? await Erc20Token.at(tokenAddress).balanceOf(lock.address)
            : await web3.eth.getBalance(lock.address)
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
          const balance = isErc20
            ? await Erc20Token.at(tokenAddress).balanceOf(lock.address)
            : await web3.eth.getBalance(lock.address)
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
            const balance = isErc20
              ? await Erc20Token.at(tokenAddress).balanceOf(lock.address)
              : await web3.eth.getBalance(lock.address)
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
          await reverts(
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
            'INSUFFICIENT_VALUE'
          )
        })
      }
    })
  })
})
