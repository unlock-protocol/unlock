const {
  getBalance,
  ADDRESS_ZERO,
  deployLock,
  reverts,
  deployERC20,
  increaseTimeTo,
} = require('../helpers')

const { ethers } = require('hardhat')
const { assert } = require('chai')

const keyPrice = ethers.utils.parseEther('0.01')
const gasRefundAmount = ethers.utils.parseEther('0.001')

// test for ERC20 and ETH
const scenarios = [true, false]

const gasRefund = async (tx) => {
  const { gasPrice } = tx
  const { gasUsed } = await tx.wait()
  const gas = gasPrice.mul(gasUsed)
  const refund = keyPrice.sub(gasRefundAmount)
  return { gas, refund }
}

describe('Lock / GasRefund', () => {
  let lock
  let accounts
  let tokenAddress = ADDRESS_ZERO
  let userBalanceBefore
  let tx
  let testToken

  scenarios.forEach((isErc20) => {
    describe(`purchase with gas refund using ${
      isErc20 ? 'ERC20' : 'ETH'
    }`, () => {
      beforeEach(async () => {
        accounts = await ethers.getSigners()
        testToken = await deployERC20(accounts[0])
        // Mint some tokens for testing
        await testToken.mint(
          accounts[2].address,
          ethers.utils.parseEther('100')
        )

        // deploy lock w ERC20
        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO
        lock = await deployLock({ tokenAddress })

        // Approve spending
        await testToken
          .connect(accounts[2])
          .approve(
            lock.address,
            ethers.BigNumber.from(keyPrice.toString()).add(
              gasRefundAmount.toString()
            )
          )
      })

      describe('gas refund value', () => {
        it('default to zero', async () => {
          assert.equal((await lock.gasRefundValue()).toNumber(), 0)
        })

        it('get set properly', async () => {
          await lock.setGasRefundValue(gasRefundAmount)
          assert.equal((await lock.gasRefundValue()).eq(gasRefundAmount), true)
        })

        it('can not be set if caller is not lock manager', async () => {
          await reverts(
            lock.connect(accounts[3]).setGasRefundValue(gasRefundAmount),
            'ONLY_LOCK_MANAGER'
          )
        })

        it('can be set by lock manager', async () => {
          await lock.addLockManager(accounts[5].address)
          await lock.connect(accounts[5]).setGasRefundValue(gasRefundAmount)
          assert.equal((await lock.gasRefundValue()).eq(gasRefundAmount), true)
        })
      })

      describe('purchase() / gas refund', () => {
        // test with both ETH and ERC20
        beforeEach(async () => {
          // set gasRefund
          await lock.setGasRefundValue(gasRefundAmount)

          userBalanceBefore = await getBalance(
            accounts[2].address,
            isErc20 ? testToken.address : null
          )

          tx = await lock
            .connect(accounts[2])
            .purchase(
              [keyPrice.toString()],
              [accounts[2].address],
              [tokenAddress],
              [ADDRESS_ZERO],
              [[]],
              {
                value: isErc20 ? 0 : keyPrice.toString(),
              }
            )
        })

        it('gas refunded event is fired', async () => {
          const { events } = await tx.wait()
          const evt = events.find((v) => v.event === 'GasRefunded')
          const {
            receiver,
            refundedAmount,
            tokenAddress: refundedTokenAddress,
          } = evt.args

          assert.equal(receiver, accounts[2].address)
          assert.equal(refundedAmount.eq(gasRefundAmount), true)
          assert.equal(refundedTokenAddress, tokenAddress)
        })

        it('user gas has been refunded', async () => {
          const userBalanceAfter = await getBalance(
            accounts[2],
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

          assert.equal(userBalanceAfter.toString(), expected.toString())
        })
      })

      describe('extend() / gas refund', () => {
        // test with both ETH and ERC20
        beforeEach(async () => {
          // set gasRefund
          await lock.setGasRefundValue(gasRefundAmount)

          const txPurchase = await lock
            .connect(accounts[2])
            .purchase(
              [keyPrice.toString()],
              [accounts[2].address],
              [tokenAddress],
              [ADDRESS_ZERO],
              [[]],
              {
                value: isErc20 ? 0 : keyPrice.toString(),
              }
            )

          // Approve some more spending
          await testToken
            .connect(accounts[2])
            .approve(lock.address, keyPrice.add(gasRefundAmount))

          // balance before extending
          userBalanceBefore = await getBalance(
            accounts[2],
            isErc20 ? testToken.address : null
          )

          const { events } = await txPurchase.wait()
          const { args } = events.find((v) => v.event === 'Transfer')
          tx = await lock
            .connect(accounts[2])
            .extend(isErc20 ? keyPrice : 0, args.tokenId, ADDRESS_ZERO, [], {
              value: isErc20 ? 0 : keyPrice.toString(),
            })
        })

        it('gas refunded event is fired', async () => {
          const { events } = await tx.wait()
          const evt = events.find((v) => v.event === 'GasRefunded')
          const {
            receiver,
            refundedAmount,
            tokenAddress: refundedTokenAddress,
          } = evt.args

          assert.equal(receiver, accounts[2].address)
          assert.equal(refundedAmount.eq(gasRefundAmount), true)
          assert.equal(refundedTokenAddress, tokenAddress)
        })

        it('user gas has been refunded', async () => {
          const userBalanceAfter = await getBalance(
            accounts[2],
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

          assert.equal(userBalanceAfter.toString(), expected.toString())
        })
      })

      describe('renewMembershipFor() / gas refund', () => {
        // test only with ERC20
        if (isErc20) {
          beforeEach(async () => {
            // set gasRefund
            await lock.setGasRefundValue(gasRefundAmount)

            const txPurchase = await lock
              .connect(accounts[2])
              .purchase(
                [keyPrice.toString()],
                [accounts[2].address],
                [tokenAddress],
                [ADDRESS_ZERO],
                [[]]
              )

            const { events } = await txPurchase.wait()
            const { args } = events.find((v) => v.event === 'Transfer')
            const { tokenId } = args

            // Approve some more spending
            await testToken
              .connect(accounts[2])
              .approve(lock.address, keyPrice.add(gasRefundAmount))

            // balance before extending
            userBalanceBefore = await getBalance(accounts[2], testToken.address)

            // advance time to expiration
            const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
            await increaseTimeTo(expirationTs)

            tx = await lock
              .connect(accounts[2])
              .renewMembershipFor(tokenId, ADDRESS_ZERO)
          })

          it('gas refunded event is fired', async () => {
            const { events } = await tx.wait()
            const evt = events.find((v) => v.event === 'GasRefunded')
            const {
              receiver,
              refundedAmount,
              tokenAddress: refundedTokenAddress,
            } = evt.args

            assert.equal(receiver, accounts[2].address)
            assert.equal(refundedAmount.eq(gasRefundAmount), true)
            assert.equal(refundedTokenAddress, tokenAddress)
          })

          it('user gas has been refunded', async () => {
            const userBalanceAfter = await getBalance(
              accounts[2],
              testToken.address
            )

            const { gas, refund } = await gasRefund(tx)
            const expected = isErc20
              ? // buy a key, get a refund
                userBalanceBefore.sub(refund)
              : userBalanceBefore
                  // buy a key, get a refund
                  .sub(refund)
                  .sub(gas) // pay for the gas

            assert.equal(userBalanceAfter.toString(), expected.toString())
          })
        }
      })

      describe('purchase without gas refund', () => {
        let tx

        beforeEach(async () => {
          userBalanceBefore = await getBalance(
            accounts[2],
            isErc20 ? testToken.address : null
          )

          tx = await lock
            .connect(accounts[2])
            .purchase(
              [keyPrice.toString()],
              [accounts[2].address],
              [ADDRESS_ZERO],
              [ADDRESS_ZERO],
              [[]],
              {
                value: isErc20 ? 0 : keyPrice.toString(),
              }
            )
        })

        it('does not fire refunded event', async () => {
          const { events } = await tx.wait()
          const evt = events.find((v) => v.event === 'GasRefunded')
          assert.equal(evt, undefined)
        })

        it('user gas is not refunded', async () => {
          const userBalanceAfter = await getBalance(
            accounts[2],
            isErc20 ? testToken.address : null
          )

          // gather gas info for ETH balance
          const { gas } = await gasRefund(tx)

          const expected = isErc20
            ? userBalanceBefore.sub(keyPrice) // buy a key
            : userBalanceBefore
                .sub(keyPrice) // buy a key
                .sub(gas.toString()) // pay for the gas

          assert.equal(userBalanceAfter.toString(), expected.toString())
        })
      })
    })
  })
})
