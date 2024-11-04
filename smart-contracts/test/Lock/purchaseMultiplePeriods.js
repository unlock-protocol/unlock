const assert = require('assert')
const {
  reverts,
  deployERC20,
  deployLock,
  getBalance,
  deployContracts,
} = require('../helpers')
const {
  getEvent,
  getEvents,
  ADDRESS_ZERO,
} = require('@unlock-protocol/hardhat-helpers')
const { ethers } = require('hardhat')

const scenarios = [false, true]

let testToken
const keyPrice = ethers.parseUnits('0.01', 'ether')
const allowance = '100000000000000000000'

describe('Lock / purchase multiple periods at once', () => {
  scenarios.forEach((isErc20) => {
    let unlock
    let lock
    let governanceToken
    let tokenAddress
    let holder, deployer, keyOwner
    let purchaseArgs
    const nbPeriods = 3n

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        ;[holder, deployer, keyOwner] = await ethers.getSigners()
        ;({ unlock } = await deployContracts())
        testToken = await deployERC20(deployer)

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

        // Mint some tokens for testing
        await testToken
          .connect(deployer)
          .mint(await holder.getAddress(), allowance)

        tokenAddress = isErc20 ? await testToken.getAddress() : ADDRESS_ZERO
        lock = await deployLock({ tokenAddress, unlock })

        // Approve spending
        await testToken
          .connect(holder)
          .approve(await lock.getAddress(), allowance)

        purchaseArgs = [
          {
            value: isErc20 ? keyPrice : 0n,
            recipient: await keyOwner.getAddress(),
            keyManager: ADDRESS_ZERO,
            referrer: ADDRESS_ZERO,
            data: '0x',
            additionalPeriods: nbPeriods,
          },
        ]
      })

      describe('purchase with exact value specified', () => {
        let tokenId
        let tsBefore
        let receipt
        beforeEach(async () => {
          const tx = await lock.purchase(purchaseArgs, {
            value: isErc20 ? 0 : keyPrice * (nbPeriods + 1n),
          })
          receipt = await tx.wait()
          const { args, blockNumber } = await getEvent(receipt, 'Transfer')

          ;({ tokenId } = args)
          ;({ timestamp: tsBefore } =
            await ethers.provider.getBlock(blockNumber))
        })

        it('user sent correct token amounts to the contract', async () => {
          const balance = await getBalance(
            await lock.getAddress(),
            isErc20 ? await testToken.getAddress() : null
          )
          assert.equal(balance, keyPrice * (nbPeriods + 1n))
        })

        it('should have received a valid key', async () => {
          assert(await lock.getHasValidKey(await keyOwner.getAddress()))
          assert(await lock.isValidKey(tokenId))
        })

        it('duration should have been updated', async () => {
          assert(
            await lock.keyExpirationTimestampFor(tokenId),
            BigInt(tsBefore) +
              (await lock.expirationDuration()) * (nbPeriods + 1n)
          )
        })
        it('events should have been fired', async () => {
          const { events: transferEvents } = await getEvents(
            receipt,
            'Transfer'
          )
          const { events: extendEvents } = await getEvents(
            receipt,
            'KeyExtended'
          )
          assert.equal(transferEvents.length, 1)
          assert.equal(extendEvents.length, nbPeriods)
        })
      })

      describe('protocol fee', () => {
        it('is paid correctly', async () => {
          // set 1% protocol fee
          await unlock.setProtocolFee(100)
          const expectedFee = ((keyPrice * 100n) / 10000n) * (nbPeriods + 1n)
          const unlockBalanceBefore = await getBalance(
            await unlock.getAddress(),
            tokenAddress
          )
          await lock.purchase(purchaseArgs, {
            value: isErc20 ? 0 : keyPrice * (nbPeriods + 1n),
          })
          assert.equal(
            (await getBalance(await unlock.getAddress(), tokenAddress)) -
              unlockBalanceBefore,
            expectedFee
          )
        })
        afterEach(async () => {
          await unlock.setProtocolFee(0)
        })
      })
      describe('referrer fee', () => {})

      // TODO: test events are fired properly

      describe('purchase with wrong amounts', () => {
        it('reverts when wrong amounts are specified', async () => {
          await reverts(
            lock.purchase(
              purchaseArgs.map((p) => ({
                ...p,
                value: isErc20 ? ethers.parseUnits('0.005', 'ether') : 0n,
              })),
              {
                value: isErc20 ? 0 : keyPrice * nbPeriods,
              }
            ),
            isErc20 ? 'INSUFFICIENT_ERC20_VALUE' : 'INSUFFICIENT_VALUE'
          )
        })
      })
    })
  })
})
