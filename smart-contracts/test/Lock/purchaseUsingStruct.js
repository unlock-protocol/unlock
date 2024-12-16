const assert = require('assert')

const {
  getBalance,
  deployERC20,
  deployLock,
  ADDRESS_ZERO,
  MAX_UINT,
  deployContracts,
} = require('../helpers')

const { ethers } = require('hardhat')
const scenarios = [false, true]

const keyPrice = ethers.parseUnits('0.01', 'ether')
// const tip = ethers.parseUnits('1', 'ether')

describe('Lock / purchase using Struct signature', () => {
  scenarios.forEach((isErc20) => {
    let lock, unlock
    let tokenAddress, expectedFee
    let testToken, governanceToken
    let deployer, spender, recipient

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        ;[deployer, spender, recipient] = await ethers.getSigners()

        if (isErc20) {
          testToken = await deployERC20(deployer)
          // Mint some tokens for testing
          await testToken.mint(
            await spender.getAddress(),
            '100000000000000000000'
          )
        }
        ;({ unlock } = await deployContracts())
        tokenAddress = isErc20 ? await testToken.getAddress() : ADDRESS_ZERO
        lock = await deployLock({ tokenAddress, unlock })

        // configure unlock
        governanceToken = await deployERC20(deployer)
        await unlock.configUnlock(
          await governanceToken.getAddress(),
          await unlock.weth(),
          0,
          'KEY',
          await unlock.globalBaseTokenURI(),
          1 // mainnet
        )

        // set 1% protocol fee
        await unlock.setProtocolFee(100)
        expectedFee = (keyPrice * 100n) / 10000n

        // default to spender
        lock = lock.connect(spender)

        // Approve spending
        if (isErc20) {
          await testToken
            .connect(spender)
            .approve(await lock.getAddress(), MAX_UINT)
        }
      })

      describe('purchase a single key', () => {
        let lockBalanceBefore, unlockBalanceBefore
        beforeEach(async () => {
          lockBalanceBefore = await getBalance(
            await lock.getAddress(),
            tokenAddress
          )
          unlockBalanceBefore = await getBalance(
            await unlock.getAddress(),
            tokenAddress
          )

          await lock.purchase(
            [
              {
                value: keyPrice,
                recipient: await recipient.getAddress(),
                referrer: ADDRESS_ZERO,
                protocolReferrer: ADDRESS_ZERO,
                keyManager: ADDRESS_ZERO,
                data: '0x',
                additionalPeriods: 0,
              },
            ],
            {
              value: isErc20 ? 0 : keyPrice,
            }
          )
        })

        it('lock receveid the correct payment for the key', async () => {
          assert.equal(
            await getBalance(await lock.getAddress(), tokenAddress),
            lockBalanceBefore + keyPrice - expectedFee
          )
        })

        it('user sucessfully received a key', async () => {
          assert.equal(await lock.balanceOf(await recipient.getAddress()), 1)
        })

        it('protocol fee has been paid', async () => {
          assert.equal(
            (await getBalance(await unlock.getAddress(), tokenAddress)) -
              unlockBalanceBefore,
            expectedFee
          )
        })
      })
    })
  })
})
