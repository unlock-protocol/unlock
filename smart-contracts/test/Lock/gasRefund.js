const { assert } = require('chai')
const {
  getBalance,
  ADDRESS_ZERO,
  deployLock,
  reverts,
  deployERC20,
  compareBigNumbers,
  purchaseKey,
  increaseTimeTo,
} = require('../helpers')

const { ethers } = require('hardhat')
const keyPrice = ethers.utils.parseEther('0.01')
const gasRefundAmount = ethers.utils.parseEther('0.001')

// test for ERC20 and ETH
// const scenarios = [true, false]
const scenarios = [true]

const gasRefund = async (tx) => {
  const { gasPrice } = tx
  const { gasUsed } = await tx.wait()
  const gas = gasPrice.mul(gasUsed)
  const refund = keyPrice.sub(gasRefundAmount)
  return { gas, refund }
}

const eventFiredProperly = async ({ tx, keyOwner, tokenAddress }) => {
  const { events } = await tx.wait()
  const {
    args: { receiver, refundedAmount, tokenAddress: refundedTokenAddress },
  } = events.find(({ event }) => event === 'GasRefunded')

  assert.equal(receiver, keyOwner.address)
  compareBigNumbers(gasRefundAmount, refundedAmount)
  assert.equal(refundedTokenAddress, tokenAddress)
}

const gasRefundedProperly = async ({
  tx,
  keyOwner,
  userBalanceBefore,
  isErc20,
  testToken,
}) => {
  const userBalanceAfter = await getBalance(
    keyOwner.address,
    isErc20 ? testToken.address : null
  )

  const { gas, refund } = await gasRefund(tx)

  const expected = isErc20
    ? // buy a key, get a refund
      userBalanceBefore.sub(refund)
    : userBalanceBefore
        // buy a key, get a refund
        .sub(refund)
        .sub(gas) // pay for the gas

  compareBigNumbers(userBalanceAfter, expected)
}

describe('Lock / GasRefund', () => {
  let lock
  let tokenAddress = ADDRESS_ZERO
  let testToken
  let lockCreator, lockManager, keyOwner, deployer, random

  scenarios.forEach((isErc20) => {
    describe(`purchase with gas refund using ${
      isErc20 ? 'ERC20' : 'ETH'
    }`, () => {
      beforeEach(async () => {
        ;[lockCreator, lockManager, keyOwner, deployer, random] =
          await ethers.getSigners()
        testToken = await deployERC20(deployer.address)
        // Mint some tokens for testing
        await testToken
          .connect(deployer)
          .mint(keyOwner.address, ethers.utils.parseEther('100'))

        // deploy lock w ERC20
        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO
        lock = await deployLock({ tokenAddress, from: lockCreator })

        // Approve spending
        await testToken
          .connect(keyOwner)
          .approve(lock.address, keyPrice.add(gasRefundAmount))
      })

      describe('gas refund value', () => {
        it('default to zero', async () => {
          compareBigNumbers(await lock.gasRefundValue(), 0)
        })

        it('get set properly', async () => {
          await lock.setGasRefundValue(gasRefundAmount)
          compareBigNumbers(await lock.gasRefundValue(), gasRefundAmount)
        })

        it('emits an event', async () => {
          const tx = await lock.setGasRefundValue(gasRefundAmount)
          const { events } = await tx.wait()
          const { args } = events.find(
            ({ event }) => event === 'GasRefundValueChanged'
          )
          compareBigNumbers(await lock.gasRefundValue(), gasRefundAmount)
          compareBigNumbers(args.refundValue, gasRefundAmount)
        })

        it('can not be set if caller is not lock manager', async () => {
          await reverts(
            lock.connect(random).setGasRefundValue(gasRefundAmount),
            'ONLY_LOCK_MANAGER'
          )
        })

        it('can be set by lock manager', async () => {
          await lock.addLockManager(lockManager.address)
          await lock.connect(lockManager).setGasRefundValue(gasRefundAmount)
          compareBigNumbers(await lock.gasRefundValue(), gasRefundAmount)
        })
      })

      describe('gas refund', () => {
        let userBalanceBefore
        let tx

        describe('purchase()', () => {
          beforeEach(async () => {
            // set gasRefund
            await lock.setGasRefundValue(gasRefundAmount)

            userBalanceBefore = await getBalance(
              keyOwner.address,
              isErc20 ? testToken.address : null
            )
            ;({ tx } = await purchaseKey(lock, keyOwner.address, isErc20))
          })
          it('gas refunded event is fired', async () => {
            await eventFiredProperly({ tx, lock, keyOwner, tokenAddress })
          })
          it('user gas has been refunded', async () => {
            await gasRefundedProperly({
              tx,
              keyOwner,
              userBalanceBefore,
              isErc20,
              testToken,
            })
          })
        })

        describe('extend()', () => {
          beforeEach(async () => {
            // set gasRefund
            await lock.setGasRefundValue(gasRefundAmount)
            const { tokenId } = await purchaseKey(
              lock,
              keyOwner.address,
              isErc20
            )

            // Approve some more spending
            await testToken
              .connect(keyOwner)
              .approve(lock.address, keyPrice.add(gasRefundAmount))

            // balance before extending
            userBalanceBefore = await getBalance(
              keyOwner.address,
              isErc20 ? testToken.address : null
            )

            tx = await lock
              .connect(keyOwner)
              .extend(isErc20 ? keyPrice : 0, tokenId, ADDRESS_ZERO, [], {
                value: isErc20 ? 0 : keyPrice.toString(),
              })
          })
          it('gas refunded event is fired', async () => {
            await eventFiredProperly({ tx, lock, keyOwner, tokenAddress })
          })
          it('user gas has been refunded', async () => {
            await gasRefundedProperly({
              tx,
              keyOwner,
              userBalanceBefore,
              isErc20,
              testToken,
            })
          })
        })

        describe('renewMembershipFor()', () => {
          // test only with ERC20
          if (isErc20) {
            beforeEach(async () => {
              // set gasRefund
              await lock.setGasRefundValue(gasRefundAmount)
              const { tokenId } = await purchaseKey(
                lock,
                keyOwner.address,
                isErc20
              )

              // Approve some more spending
              await testToken
                .connect(keyOwner)
                .approve(lock.address, keyPrice.add(gasRefundAmount))

              // balance before extending
              userBalanceBefore = await getBalance(
                keyOwner.address,
                testToken.address
              )

              // advance time to expiration
              const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
              await increaseTimeTo(expirationTs)

              tx = await lock
                .connect(keyOwner)
                .renewMembershipFor(tokenId, ADDRESS_ZERO)
            })

            it('gas refunded event is fired', async () => {
              await eventFiredProperly({ tx, lock, keyOwner, tokenAddress })
            })
            it('user gas has been refunded', async () => {
              await gasRefundedProperly({
                tx,
                keyOwner,
                userBalanceBefore,
                isErc20,
                testToken,
              })
            })
          }
        })
      })

      describe('purchase without gas refund', () => {
        let tx
        let userBalanceBefore

        beforeEach(async () => {
          userBalanceBefore = await getBalance(
            keyOwner.address,
            isErc20 ? testToken.address : null
          )
          ;({ tx } = await purchaseKey(lock, keyOwner.address, isErc20))
        })

        it('does not fire refunded event', async () => {
          const { events } = await tx.wait()
          const evt = events.find(({ event }) => event === 'GasRefunded')
          assert.equal(evt, undefined)
        })

        it('user gas is not refunded', async () => {
          const userBalanceAfter = await getBalance(
            keyOwner.address,
            isErc20 ? testToken.address : null
          )

          // gather gas info for ETH balance
          const { gas } = await gasRefund(tx)

          const expected = isErc20
            ? userBalanceBefore.sub(keyPrice) // buy a key
            : userBalanceBefore
                .sub(keyPrice) // buy a key
                .sub(gas.toString()) // pay for the gas

          compareBigNumbers(userBalanceAfter, expected)
        })
      })
    })
  })
})
