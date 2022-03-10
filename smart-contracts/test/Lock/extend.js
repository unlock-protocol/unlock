const { reverts } = require('truffle-assertions')
const { assert } = require('chai')
const { ethers } = require('hardhat')
const { tokens } = require('hardlydifficult-ethereum-contracts')
const { MAX_UINT } = require('hardlydifficult-ethereum-contracts/src/constants')
const deployLocks = require('../helpers/deployLocks')
const getProxy = require('../helpers/proxy')

const unlockContract = artifacts.require('Unlock.sol')

const scenarios = [false, true]
let unlock
let locks
let testToken
const keyPrice = web3.utils.toWei('0.01', 'ether')
const someTokens = web3.utils.toWei('10', 'ether')

contract('Lock / extend keys', (accounts) => {
  scenarios.forEach((isErc20) => {
    let lock
    let nonExpiringLock
    let tokenAddress
    let tsBefore
    const lockOwner = accounts[0]
    const keyOwner = accounts[1]
    const nonExpiringKeyOwner = accounts[2]

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        testToken = await tokens.dai.deploy(web3, lockOwner)
        tokenAddress = isErc20 ? testToken.address : web3.utils.padLeft(0, 40)

        // Mint some tokens for testing
        await testToken.mint(keyOwner, someTokens, {
          from: lockOwner,
        })

        unlock = await getProxy(unlockContract)
        locks = await deployLocks(unlock, lockOwner, tokenAddress)
        lock = locks.FIRST
        nonExpiringLock = locks.NON_EXPIRING
      })

      describe('common lock', () => {
        beforeEach(async () => {
          // Approve spending
          await testToken.approve(lock.address, someTokens, {
            from: keyOwner,
          })

          // purchase a key
          await lock.purchase(
            isErc20 ? [keyPrice] : [],
            [keyOwner],
            [web3.utils.padLeft(0, 40)],
            [web3.utils.padLeft(0, 40)],
            [],
            {
              value: isErc20 ? 0 : keyPrice,
              from: keyOwner,
            }
          )
        })

        it('prevent extend without having purchased a key', async () => {
          await reverts(
            lock.extend(
              isErc20 ? keyPrice : 0,
              accounts[6],
              web3.utils.padLeft(0, 40),
              [],
              {
                value: isErc20 ? 0 : keyPrice,
                from: accounts[6],
              }
            ),
            'NON_EXISTING_KEY'
          )
        })

        it('reverts with insufficient value', async () => {
          const belowPrice = web3.utils.toWei('0.005', 'ether')
          await reverts(
            lock.extend(
              isErc20 ? belowPrice : 0,
              keyOwner,
              web3.utils.padLeft(0, 40),
              [],
              {
                value: isErc20 ? 0 : belowPrice,
                from: accounts[6],
              }
            ),
            isErc20 ? 'INSUFFICIENT_ERC20_VALUE' : 'INSUFFICIENT_VALUE'
          )
        })

        describe('extend a valid key', () => {
          beforeEach(async () => {
            assert.equal(await lock.getHasValidKey.call(keyOwner), true)
            tsBefore = await lock.keyExpirationTimestampFor(keyOwner)

            // extend
            await lock.extend(
              isErc20 ? keyPrice : 0,
              keyOwner,
              web3.utils.padLeft(0, 40),
              [],
              {
                value: isErc20 ? 0 : keyPrice,
                from: keyOwner,
              }
            )
          })

          it('key should stay valid', async () => {
            assert.equal(await lock.getHasValidKey.call(keyOwner), true)
          })

          it('duration has been extended accordingly', async () => {
            const expirationDuration = await lock.expirationDuration()
            const tsAfter = await lock.keyExpirationTimestampFor(keyOwner)
            assert.equal(
              tsBefore.add(expirationDuration).toString(),
              tsAfter.toString()
            )
          })
        })

        describe('extend an expired key', () => {
          beforeEach(async () => {
            // expire key
            await lock.expireAndRefundFor(keyOwner, 0, {
              from: lockOwner,
            })
            assert.equal(await lock.getHasValidKey.call(keyOwner), false)

            // extend
            await lock.extend(
              isErc20 ? keyPrice : 0,
              keyOwner,
              web3.utils.padLeft(0, 40),
              [],
              {
                value: isErc20 ? 0 : keyPrice,
                from: keyOwner,
              }
            )
          })

          it('key should stay valid', async () => {
            assert.equal(await lock.getHasValidKey.call(keyOwner), true)
          })

          it('duration has been extended accordingly', async () => {
            const expirationDuration = await lock.expirationDuration()
            const tsAfter = await lock.keyExpirationTimestampFor(keyOwner)
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
          await nonExpiringLock.purchase(
            isErc20 ? [keyPrice] : [],
            [nonExpiringKeyOwner],
            [web3.utils.padLeft(0, 40)],
            [web3.utils.padLeft(0, 40)],
            [],
            {
              value: isErc20 ? 0 : keyPrice,
              from: nonExpiringKeyOwner,
            }
          )
        })
        it('reverts when attempting to extend a valid key', async () => {
          await reverts(
            nonExpiringLock.extend(
              isErc20 ? keyPrice : 0,
              nonExpiringKeyOwner,
              web3.utils.padLeft(0, 40),
              [],
              {
                value: isErc20 ? 0 : keyPrice,
                from: nonExpiringKeyOwner,
              }
            ),
            'A valid non-expiring key can not be purchased twice'
          )
        })

        it('allows to extend an expired key', async () => {
          // expire key
          await nonExpiringLock.expireAndRefundFor(nonExpiringKeyOwner, 0, {
            from: lockOwner,
          })
          assert.equal(
            await nonExpiringLock.getHasValidKey.call(nonExpiringKeyOwner),
            false
          )

          // extend
          await nonExpiringLock.extend(
            isErc20 ? keyPrice : 0,
            nonExpiringKeyOwner,
            web3.utils.padLeft(0, 40),
            [],
            {
              value: isErc20 ? 0 : keyPrice,
              from: nonExpiringKeyOwner,
            }
          )

          assert.equal(
            await nonExpiringLock.getHasValidKey.call(nonExpiringKeyOwner),
            true
          )

          it('duration has been extended accordingly', async () => {
            assert.equal(
              await nonExpiringLock.keyExpirationTimestampFor(
                nonExpiringKeyOwner
              ),
              MAX_UINT
            )
          })
        })
      })
    })
  })
})
