const { ethers } = require('hardhat')
const { reverts } = require('../helpers/errors')
const { BN, time } = require('@openzeppelin/test-helpers')
const { deployERC20 } = require('../helpers')
const deployLocks = require('../helpers/deployLocks')
const { getBalance } = require('../helpers')
const getContractInstance = require('../helpers/truffle-artifacts')

const unlockContract = artifacts.require('Unlock.sol')
const { ADDRESS_ZERO } = require('../helpers/constants')

const keyPrice = new BN(ethers.utils.parseEther('0.01').toString())
const gasRefundAmount = new BN(ethers.utils.parseEther('0.001').toString())

// test for ERC20 and ETH
const scenarios = [true, false]

const gasRefund = async (tx) => {
  const { gasPrice } = await ethers.provider.getTransaction(tx.tx)
  const { gasUsed } = tx.receipt
  const gas = gasPrice.mul(gasUsed)
  const refund = keyPrice.sub(gasRefundAmount)
  return { gas, refund }
}

contract('Lock / GasRefund', (accounts) => {
  let unlock
  let locks
  let lock
  let tokenAddress = ADDRESS_ZERO
  let userBalanceBefore
  let tx
  let testToken

  scenarios.forEach((isErc20) => {
    describe(`purchase with gas refund using ${
      isErc20 ? 'ERC20' : 'ETH'
    }`, () => {
      beforeEach(async () => {
        unlock = await getContractInstance(unlockContract)

        testToken = await deployERC20(accounts[0])
        // Mint some tokens for testing
        await testToken.mint(accounts[2], ethers.utils.parseEther('100'), {
          from: accounts[0],
        })

        // deploy lock w ERC20
        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO
        locks = await deployLocks(unlock, accounts[0], tokenAddress)
        lock = locks.FIRST

        // Approve spending
        await testToken.approve(
          lock.address,
          ethers.BigNumber.from(keyPrice.toString()).add(
            gasRefundAmount.toString()
          ),
          {
            from: accounts[2],
          }
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
            lock.setGasRefundValue(gasRefundAmount, {
              from: accounts[3],
            }),
            'ONLY_LOCK_MANAGER'
          )
        })

        it('can be set by lock manager', async () => {
          await lock.addLockManager(accounts[5], { from: accounts[0] })
          await lock.setGasRefundValue(gasRefundAmount, { from: accounts[5] })
          assert.equal((await lock.gasRefundValue()).eq(gasRefundAmount), true)
        })
      })

      describe('purchase() / gas refund', () => {
        // test with both ETH and ERC20
        beforeEach(async () => {
          // set gasRefund
          await lock.setGasRefundValue(gasRefundAmount)

          userBalanceBefore = await getBalance(
            accounts[2],
            isErc20 ? testToken.address : null
          )

          tx = await lock.purchase(
            [keyPrice.toString()],
            [accounts[2]],
            [tokenAddress],
            [ADDRESS_ZERO],
            [[]],
            {
              from: accounts[2],
              value: isErc20 ? 0 : keyPrice.toString(),
            }
          )
        })

        it('gas refunded event is fired', async () => {
          const evt = tx.logs.find((v) => v.event === 'GasRefunded')
          const {
            receiver,
            refundedAmount,
            tokenAddress: refundedTokenAddress,
          } = evt.args

          assert.equal(receiver, accounts[2])
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
              userBalanceBefore.minus(refund)
            : userBalanceBefore
                // buy a key, get a refund
                .minus(refund)
                .minus(gas) // pay for the gas

          assert.equal(userBalanceAfter.toString(), expected.toString())
        })
      })

      describe('extend() / gas refund', () => {
        // test with both ETH and ERC20
        beforeEach(async () => {
          // set gasRefund
          await lock.setGasRefundValue(gasRefundAmount)

          const txPurchase = await lock.purchase(
            [keyPrice.toString()],
            [accounts[2]],
            [tokenAddress],
            [ADDRESS_ZERO],
            [[]],
            {
              from: accounts[2],
              value: isErc20 ? 0 : keyPrice.toString(),
            }
          )

          // Approve some more spending
          await testToken.approve(
            lock.address,
            new BN(keyPrice).add(gasRefundAmount),
            {
              from: accounts[2],
            }
          )

          // balance before extending
          userBalanceBefore = await getBalance(
            accounts[2],
            isErc20 ? testToken.address : null
          )

          const { args } = txPurchase.logs.find((v) => v.event === 'Transfer')
          tx = await lock.extend(
            isErc20 ? keyPrice : 0,
            args.tokenId,
            ADDRESS_ZERO,
            [],
            {
              value: isErc20 ? 0 : keyPrice.toString(),
              from: accounts[2],
            }
          )
        })

        it('gas refunded event is fired', async () => {
          const evt = tx.logs.find((v) => v.event === 'GasRefunded')
          const {
            receiver,
            refundedAmount,
            tokenAddress: refundedTokenAddress,
          } = evt.args

          assert.equal(receiver, accounts[2])
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
              userBalanceBefore.minus(refund)
            : userBalanceBefore
                // buy a key, get a refund
                .minus(refund)
                .minus(gas) // pay for the gas

          assert.equal(userBalanceAfter.toString(), expected.toString())
        })
      })

      describe('renewMembershipFor() / gas refund', () => {
        // test only with ERC20
        if (isErc20) {
          beforeEach(async () => {
            // set gasRefund
            await lock.setGasRefundValue(gasRefundAmount)

            const txPurchase = await lock.purchase(
              [keyPrice.toString()],
              [accounts[2]],
              [tokenAddress],
              [ADDRESS_ZERO],
              [[]],
              {
                from: accounts[2],
                value: 0,
              }
            )

            const { args } = txPurchase.logs.find((v) => v.event === 'Transfer')
            const { tokenId } = args

            // Approve some more spending
            await testToken.approve(
              lock.address,
              new BN(keyPrice).add(gasRefundAmount),
              {
                from: accounts[2],
              }
            )

            // balance before extending
            userBalanceBefore = await getBalance(accounts[2], testToken.address)

            // advance time to expiration
            const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
            await time.increaseTo(expirationTs.toNumber())

            tx = await lock.renewMembershipFor(tokenId, ADDRESS_ZERO, {
              from: accounts[2],
            })
          })

          it('gas refunded event is fired', async () => {
            const evt = tx.logs.find((v) => v.event === 'GasRefunded')
            const {
              receiver,
              refundedAmount,
              tokenAddress: refundedTokenAddress,
            } = evt.args

            assert.equal(receiver, accounts[2])
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
                userBalanceBefore.minus(refund)
              : userBalanceBefore
                  // buy a key, get a refund
                  .minus(refund)
                  .minus(gas) // pay for the gas

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

          tx = await lock.purchase(
            [keyPrice.toString()],
            [accounts[2]],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]],
            {
              from: accounts[2],
              value: isErc20 ? 0 : keyPrice.toString(),
            }
          )
        })

        it('does not fire refunded event', async () => {
          const evt = tx.logs.find((v) => v.event === 'GasRefunded')
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
            ? userBalanceBefore.minus(keyPrice) // buy a key
            : userBalanceBefore
                .minus(keyPrice) // buy a key
                .minus(gas) // pay for the gas

          assert.equal(userBalanceAfter.toString(), expected.toString())
        })
      })
    })
  })
})
