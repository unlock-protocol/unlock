const { reverts } = require('../helpers')
const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  deployERC20,
  deployLock,
  ADDRESS_ZERO,
  MAX_UINT,
  purchaseKey,
} = require('../helpers')

const scenarios = [false, true]
let testToken
const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const someTokens = ethers.utils.parseUnits('10', 'ether')

describe('Lock / extend keys', () => {
  scenarios.forEach((isErc20) => {
    let lock
    let nonExpiringLock
    let tokenAddress
    let tsBefore
    let tokenId
    let lockOwner, keyOwner, nonExpiringKeyOwner, anotherAccount

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        ;[lockOwner, keyOwner, nonExpiringKeyOwner, anotherAccount] =
          await ethers.getSigners()
        testToken = await deployERC20(lockOwner.address, true)
        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO

        // Mint some tokens for testing
        await testToken.mint(keyOwner.address, someTokens)

        lock = await deployLock({ tokenAddress, isEthers: true })
        nonExpiringLock = await deployLock({
          tokenAddress,
          name: 'NON_EXPIRING',
          isEthers: true,
        })
      })

      describe('common lock', () => {
        beforeEach(async () => {
          // Approve spending
          await testToken.connect(keyOwner).approve(lock.address, someTokens)

          // purchase a key
          ;({ tokenId } = await purchaseKey(lock, keyOwner.address, isErc20))
        })

        it('prevent extend a non-existing key', async () => {
          await reverts(
            lock
              .connect(anotherAccount)
              .extend(isErc20 ? keyPrice : 0, 1245, ADDRESS_ZERO, [], {
                value: isErc20 ? 0 : keyPrice,
              }),
            'NO_SUCH_KEY'
          )
        })

        it('reverts with insufficient value', async () => {
          const belowPrice = ethers.utils.parseUnits('0.005', 'ether')
          await reverts(
            lock
              .connect(anotherAccount)
              .extend(isErc20 ? belowPrice : 0, tokenId, ADDRESS_ZERO, [], {
                value: isErc20 ? 0 : belowPrice,
              }),
            isErc20 ? 'INSUFFICIENT_ERC20_VALUE' : 'INSUFFICIENT_VALUE'
          )
        })

        describe('extend a valid key', () => {
          let args
          beforeEach(async () => {
            assert.equal(await lock.isValidKey(tokenId), true)
            tsBefore = await lock.keyExpirationTimestampFor(tokenId)

            // extend
            const tx = await lock
              .connect(keyOwner)
              .extend(isErc20 ? keyPrice : 0, tokenId, ADDRESS_ZERO, [], {
                value: isErc20 ? 0 : keyPrice,
              })
            const { events } = await tx.wait()
            ;({ args } = events.find((v) => v.event === 'KeyExtended'))
          })

          it('key should stay valid', async () => {
            assert.equal(await lock.isValidKey(tokenId), true)
          })

          it('duration has been extended accordingly', async () => {
            const expirationDuration = await lock.expirationDuration()
            const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
            assert.equal(
              tsBefore.add(expirationDuration).toString(),
              tsAfter.toString()
            )
          })

          it('should emit a KeyExtended event', async () => {
            const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
            assert.equal(args.tokenId.toString(), tokenId.toString())
            assert.equal(args.newTimestamp.toString(), tsAfter.toString())
          })
        })

        describe('extend an expired key', () => {
          beforeEach(async () => {
            // expire key
            await lock.expireAndRefundFor(tokenId, 0)
            assert.equal(await lock.isValidKey(tokenId), false)

            // extend
            await lock
              .connect(keyOwner)
              .extend(isErc20 ? keyPrice : 0, tokenId, ADDRESS_ZERO, [], {
                value: isErc20 ? 0 : keyPrice,
              })
          })

          it('key should stay valid', async () => {
            assert.equal(await lock.isValidKey(tokenId), true)
          })

          it('duration has been extended accordingly', async () => {
            const expirationDuration = await lock.expirationDuration()
            const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
            const blockNumber = await ethers.provider.getBlockNumber()
            const latestBlock = await ethers.provider.getBlock(blockNumber)
            assert.equal(
              expirationDuration.add(latestBlock.timestamp).toString(),
              tsAfter.toString()
            )
          })
        })
      })

      describe('non-expiring lock', () => {
        beforeEach(async () => {
          // mint some tokens
          await testToken.mint(nonExpiringKeyOwner.address, someTokens)

          // approve ERC20 spending
          await testToken
            .connect(nonExpiringKeyOwner)
            .approve(nonExpiringLock.address, someTokens)

          // purchase a key for non-expiring
          ;({ tokenId } = await purchaseKey(
            nonExpiringLock,
            nonExpiringKeyOwner.address,
            isErc20
          ))
        })

        it('reverts when attempting to extend a valid key', async () => {
          await reverts(
            nonExpiringLock
              .connect(nonExpiringKeyOwner)
              .extend(isErc20 ? keyPrice : 0, tokenId, ADDRESS_ZERO, [], {
                value: isErc20 ? 0 : keyPrice,
              }),
            'CANT_EXTEND_NON_EXPIRING_KEY'
          )
        })

        it('allows to extend an expired key', async () => {
          // expire key
          await nonExpiringLock.expireAndRefundFor(tokenId, 0)
          assert.equal(await nonExpiringLock.isValidKey(tokenId), false)

          // extend
          await nonExpiringLock
            .connect(nonExpiringKeyOwner)
            .extend(isErc20 ? keyPrice : 0, tokenId, ADDRESS_ZERO, [], {
              value: isErc20 ? 0 : keyPrice,
            })

          assert.equal(await nonExpiringLock.isValidKey(tokenId), true)

          it('duration has been extended accordingly', async () => {
            assert.equal(
              await nonExpiringLock.keyExpirationTimestampFor(tokenId),
              MAX_UINT
            )
          })
        })
      })
    })
  })
})
