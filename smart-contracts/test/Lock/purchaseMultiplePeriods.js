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
const allowance = '1000000000000000000000'
const BASIS_POINT_DENOMINATOR = 10000n
describe('Lock / purchase multiple periods at once', () => {
  scenarios.forEach((isErc20) => {
    let unlock
    let lock
    let governanceToken
    let tokenAddress
    let holder, deployer, keyOwner, referrer, otherReferrer
    let purchaseArgs
    let keyPrice
    const nbPeriods = 3n

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        ;[holder, deployer, keyOwner, referrer, otherReferrer] =
          await ethers.getSigners()
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
        keyPrice = await lock.keyPrice()

        // allow for more keys to be minted
        await lock.updateLockConfig(await lock.expirationDuration(), 1000, 50)

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
            protocolReferrer: ADDRESS_ZERO,
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
          const expectedFee =
            (keyPrice * (nbPeriods + 1n) * 100n) / BASIS_POINT_DENOMINATOR
          const unlockBalanceBefore = await getBalance(
            await unlock.getAddress(),
            tokenAddress
          )
          await lock.connect(holder).purchase(purchaseArgs, {
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

      describe('referrer fee ', () => {
        it('is paid correctly', async () => {
          const referrerFee = 500n
          const referrerAddress = await referrer.getAddress()
          await lock.setReferrerFee(referrerAddress, referrerFee)
          const expectedFee =
            (keyPrice * (nbPeriods + 1n) * referrerFee) /
            BASIS_POINT_DENOMINATOR
          const referrerBalanceBefore = await getBalance(
            referrerAddress,
            tokenAddress
          )
          await lock.connect(holder).purchase(
            purchaseArgs.map((p) => ({
              ...p,
              referrer: referrerAddress,
            })),
            {
              value: isErc20 ? 0 : keyPrice * (nbPeriods + 1n),
            }
          )
          assert.equal(
            (await getBalance(referrerAddress, tokenAddress)) -
              referrerBalanceBefore,
            expectedFee
          )
        })
      })

      describe('works when purchasing multiple keys', async () => {
        let receipt
        beforeEach(async () => {
          const tx = await lock
            .connect(holder)
            .purchase([...purchaseArgs, ...purchaseArgs], {
              value: isErc20 ? 0 : keyPrice * (nbPeriods + 1n) * 2n,
            })
          receipt = await tx.wait()
        })
        it('keys are minted and extended properly', async () => {
          const { events: transferEvents } = await getEvents(
            receipt,
            'Transfer'
          )
          const tokenIds = transferEvents.map(({ args }) => args.tokenId)
          assert(await lock.isValidKey(tokenIds[0]))
          assert(await lock.isValidKey(tokenIds[1]))

          const { timestamp: tsBefore } = await ethers.provider.getBlock(
            receipt.blockNumber
          )
          assert(
            await lock.keyExpirationTimestampFor(tokenIds[0]),
            BigInt(tsBefore) +
              (await lock.expirationDuration()) * (nbPeriods + 1n)
          )
          assert(
            await lock.keyExpirationTimestampFor(tokenIds[1]),
            BigInt(tsBefore) +
              (await lock.expirationDuration()) * (nbPeriods + 1n)
          )
        })
        it('events are fired properly', async () => {
          const { events: transferEvents } = await getEvents(
            receipt,
            'Transfer'
          )
          const { events: extendEvents } = await getEvents(
            receipt,
            'KeyExtended'
          )
          //
          assert.equal(transferEvents.length, 2)
          assert.equal(extendEvents.length, nbPeriods * 2n)
        })

        // ;({ tokenId } = args)
        // ;({ timestamp: tsBefore } = await ethers.provider.getBlock(blockNumber))
      })

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
