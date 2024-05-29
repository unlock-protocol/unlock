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

const keyPrice = ethers.parseUnits('0.01', 'ether')
const tip = ethers.parseUnits('1', 'ether')

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
        await testToken.mint(
          await spender.getAddress(),
          '100000000000000000000'
        )

        tokenAddress = isErc20 ? await testToken.getAddress() : ADDRESS_ZERO
        lock = await deployLock({ tokenAddress })
        // default to spender
        lock = lock.connect(spender)

        // Approve spending
        if (isErc20) {
          await testToken
            .connect(spender)
            .approve(await lock.getAddress(), MAX_UINT)
        }
      })

      describe('purchase with exact value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            [keyPrice],
            [await spender.getAddress()],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            ['0x'],
            {
              value: isErc20 ? 0 : keyPrice,
            }
          )
        })

        it('user sent keyPrice to the contract', async () => {
          compareBigNumbers(
            await getBalance(await lock.getAddress(), tokenAddress),
            keyPrice
          )
        })
      })

      describe('purchase with tip', () => {
        beforeEach(async () => {
          await lock.purchase(
            [keyPrice + tip],
            [await spender.getAddress()],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            ['0x'],
            {
              value: isErc20 ? 0 : keyPrice + tip,
            }
          )
        })

        it('user sent the tip to the contract', async () => {
          compareBigNumbers(
            await getBalance(await lock.getAddress(), tokenAddress),
            isErc20 ? keyPrice : keyPrice + tip
          )
        })
      })

      describe('purchase with ETH tip > value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            [keyPrice],
            [await spender.getAddress()],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            ['0x'],
            {
              value: isErc20 ? 0 : keyPrice + tip,
            }
          )
        })

        it('user sent tip to the contract if ETH (else send keyPrice)', async () => {
          const balance = await getBalance(
            await lock.getAddress(),
            tokenAddress
          )
          if (!isErc20) {
            compareBigNumbers(balance, keyPrice + tip)
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
              [await spender.getAddress()],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              ['0x'],
              {
                value: keyPrice + tip,
              }
            )
          })

          it('user sent tip to the contract if ETH (else send keyPrice)', async () => {
            const balance = await getBalance(
              await lock.getAddress(),
              tokenAddress
            )
            compareBigNumbers(balance, keyPrice + tip)
          })
        })
      }

      if (isErc20) {
        it('should fail if value is less than keyPrice', async () => {
          await reverts(
            lock.purchase(
              [ethers.parseUnits('0.001', 'ether')],
              [await spender.getAddress()],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              ['0x'],
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
