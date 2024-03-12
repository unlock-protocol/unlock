const {
  getBalance,
  deployERC20,
  deployLock,
  reverts,
  ADDRESS_ZERO,
  compareBigNumbers,
  MAX_UINT,
} = require('../helpers')

const { ethers } = require('hardhat')
const scenarios = [false, true]

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const tip = ethers.utils.parseUnits('1', 'ether')

describe('Lock / purchaseTip', () => {
  scenarios.forEach((isErc20) => {
    let lock
    let tokenAddress
    let testToken
    let deployer, spender

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        ;[deployer, spender] = await ethers.getSigners()
        testToken = await deployERC20(deployer)
        // Mint some tokens for testing
        await testToken.mint(spender.address, '100000000000000000000')

        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO
        lock = await deployLock({ tokenAddress })
        // default to spender
        lock = lock.connect(spender)

        // Approve spending
        if (isErc20) {
          await testToken.connect(spender).approve(lock.address, MAX_UINT)
        }
      })

      describe('purchase with exact value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            [keyPrice],
            [spender.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]],
            {
              value: isErc20 ? 0 : keyPrice,
            }
          )
        })

        it('user sent keyPrice to the contract', async () => {
          compareBigNumbers(
            await getBalance(lock.address, tokenAddress),
            keyPrice
          )
        })
      })

      describe('purchase with tip', () => {
        beforeEach(async () => {
          await lock.purchase(
            [keyPrice.add(tip)],
            [spender.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]],
            {
              value: isErc20 ? 0 : keyPrice.add(tip),
            }
          )
        })

        it('user sent the tip to the contract', async () => {
          compareBigNumbers(
            await getBalance(lock.address, tokenAddress),
            isErc20 ? keyPrice : keyPrice.add(tip)
          )
        })
      })

      describe('purchase with ETH tip > value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            [keyPrice],
            [spender.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]],
            {
              value: isErc20 ? 0 : keyPrice.add(tip),
            }
          )
        })

        it('user sent tip to the contract if ETH (else send keyPrice)', async () => {
          const balance = await getBalance(lock.address, tokenAddress)
          if (!isErc20) {
            compareBigNumbers(balance, keyPrice.add(tip))
          } else {
            compareBigNumbers(balance, keyPrice)
          }
        })
      })

      if (!isErc20) {
        describe('purchase with unspecified ETH tip', () => {
          beforeEach(async () => {
            await lock.purchase(
              [],
              [spender.address],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              [[]],
              {
                value: keyPrice.add(tip),
              }
            )
          })

          it('user sent tip to the contract if ETH (else send keyPrice)', async () => {
            const balance = await getBalance(lock.address, tokenAddress)
            compareBigNumbers(balance, keyPrice.add(tip))
          })
        })
      }

      if (isErc20) {
        it('should fail if value is less than keyPrice', async () => {
          await reverts(
            lock.purchase(
              [ethers.utils.parseUnits('0.001', 'ether')],
              [spender.address],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              [[]],
              {
                value: 0,
              }
            ),
            'INSUFFICIENT_ERC20_VALUE'
          )
        })
      }
    })
  })
})
