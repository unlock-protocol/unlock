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

contract('Lock / extend keys', (accounts) => {
  scenarios.forEach((isErc20) => {
    let lock
    let nonExpiringLock
    let tokenAddress
    let tsBefore
    let tokenId

    const [lockOwner, keyOwner, nonExpiringKeyOwner] = accounts

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        testToken = await deployERC20(lockOwner)
        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO

        // Mint some tokens for testing
        await testToken.mint(keyOwner, someTokens, {
          from: lockOwner,
        })

        lock = await deployLock({ tokenAddress })
        nonExpiringLock = await deployLock({
          tokenAddress,
          name: 'NON_EXPIRING',
        })
      })

      describe('common lock', () => {
        beforeEach(async () => {
          // Approve spending
          await testToken.approve(lock.address, someTokens, {
            from: keyOwner,
          })

          // purchase a key
          ;({ tokenId } = await purchaseKey(lock, keyOwner, isErc20))
        })

        it('prevent extend a non-existing key', async () => {
          await reverts(
            lock.extend(isErc20 ? keyPrice : 0, 1245, ADDRESS_ZERO, [], {
              value: isErc20 ? 0 : keyPrice,
              from: accounts[6],
            }),
            'NO_SUCH_KEY'
          )
        })

        it('reverts with insufficient value', async () => {
          const belowPrice = ethers.utils.parseUnits('0.005', 'ether')
          await reverts(
            lock.extend(isErc20 ? belowPrice : 0, tokenId, ADDRESS_ZERO, [], {
              value: isErc20 ? 0 : belowPrice,
              from: accounts[6],
            }),
            isErc20 ? 'INSUFFICIENT_ERC20_VALUE' : 'INSUFFICIENT_VALUE'
          )
        })

        describe('extend a valid key', () => {
          let tx
          beforeEach(async () => {
            assert.equal(await lock.isValidKey(tokenId), true)
            tsBefore = await lock.keyExpirationTimestampFor(tokenId)

            // extend
            tx = await lock.extend(
              isErc20 ? keyPrice : 0,
              tokenId,
              ADDRESS_ZERO,
              [],
              {
                value: isErc20 ? 0 : keyPrice,
                from: keyOwner,
              }
            )
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
            const { args } = tx.logs.find((v) => v.event === 'KeyExtended')
            assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
            assert.equal(args.newTimestamp.toNumber(), tsAfter.toNumber())
          })
        })

        describe('extend an expired key', () => {
          beforeEach(async () => {
            // expire key
            await lock.expireAndRefundFor(tokenId, 0, {
              from: lockOwner,
            })
            assert.equal(await lock.isValidKey(tokenId), false)

            // extend
            await lock.extend(
              isErc20 ? keyPrice : 0,
              tokenId,
              ADDRESS_ZERO,
              [],
              {
                value: isErc20 ? 0 : keyPrice,
                from: keyOwner,
              }
            )
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
              latestBlock.timestamp + expirationDuration.toNumber(),
              tsAfter.toNumber()
            )
          })
        })
      })

      describe('non-expiring lock', () => {
        beforeEach(async () => {
          // mint some tokens
          await testToken.mint(nonExpiringKeyOwner, someTokens, {
            from: lockOwner,
          })

          // approve ERC20 spending
          await testToken.approve(nonExpiringLock.address, someTokens, {
            from: nonExpiringKeyOwner,
          })

          // purchase a key for non-expiring
          ;({ tokenId } = await purchaseKey(
            nonExpiringLock,
            nonExpiringKeyOwner,
            isErc20
          ))
        })

        it('reverts when attempting to extend a valid key', async () => {
          await reverts(
            nonExpiringLock.extend(
              isErc20 ? keyPrice : 0,
              tokenId,
              ADDRESS_ZERO,
              [],
              {
                value: isErc20 ? 0 : keyPrice,
                from: nonExpiringKeyOwner,
              }
            ),
            'CANT_EXTEND_NON_EXPIRING_KEY'
          )
        })

        it('allows to extend an expired key', async () => {
          // expire key
          await nonExpiringLock.expireAndRefundFor(tokenId, 0, {
            from: lockOwner,
          })
          assert.equal(await nonExpiringLock.isValidKey(tokenId), false)

          // extend
          await nonExpiringLock.extend(
            isErc20 ? keyPrice : 0,
            tokenId,
            ADDRESS_ZERO,
            [],
            {
              value: isErc20 ? 0 : keyPrice,
              from: nonExpiringKeyOwner,
            }
          )

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
