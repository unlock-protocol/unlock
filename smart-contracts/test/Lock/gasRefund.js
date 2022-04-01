const truffleAssert = require('truffle-assertions')
const { BN } = require('@openzeppelin/test-helpers')
const { tokens } = require('hardlydifficult-ethereum-contracts')
const deployLocks = require('../helpers/deployLocks')
const getProxy = require('../helpers/proxy')

const unlockContract = artifacts.require('Unlock.sol')

let unlock
let locks
const keyPrice = web3.utils.toWei('0.01', 'ether')
const gasRefundAmount = new BN(web3.utils.toWei('0.001', 'ether'))

// test for ERC20 and ETH
const scenarios = [true, false]

contract('Lock / GasRefund', (accounts) => {
  let lock
  let tokenAddress = web3.utils.padLeft(0, 40)
  let userBalanceBefore
  let tx
  let testToken

  scenarios.forEach((isErc20) => {
    describe(`purchase with gas refund using ${
      isErc20 ? 'ERC20' : 'ETH'
    }`, () => {
      beforeEach(async () => {
        unlock = await getProxy(unlockContract)

        testToken = await tokens.dai.deploy(web3, accounts[0])
        // Mint some tokens for testing
        await testToken.mint(accounts[2], web3.utils.toWei('100', 'ether'), {
          from: accounts[0],
        })

        // deploy lock w ERC20
        tokenAddress = isErc20 ? testToken.address : web3.utils.padLeft(0, 40)
        locks = await deployLocks(unlock, accounts[0], tokenAddress)
        lock = locks.FIRST

        // Approve spending
        await testToken.approve(
          lock.address,
          new BN(keyPrice).add(gasRefundAmount),
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
          await truffleAssert.fails(
            lock.setGasRefundValue(gasRefundAmount, {
              from: accounts[3],
            }),
            'revert',
            'ONLY_LOCK_MANAGER'
          )
        })

        it('can be set by lock manager', async () => {
          await lock.addLockManager(accounts[5], { from: accounts[0] })
          await lock.setGasRefundValue(gasRefundAmount, { from: accounts[5] })
          assert.equal((await lock.gasRefundValue()).eq(gasRefundAmount), true)
        })
      })

      describe('gas refund', () => {
        // test with both ETH and ERC20
        beforeEach(async () => {
          // set gasRefund
          await lock.setGasRefundValue(gasRefundAmount)

          userBalanceBefore = isErc20
            ? await testToken.balanceOf(accounts[2])
            : new BN(await web3.eth.getBalance(accounts[2]))

          tx = await lock.purchase(
            [keyPrice.toString()],
            [accounts[2]],
            [tokenAddress],
            [web3.utils.padLeft(0, 40)],
            [],
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
          const userBalanceAfter = isErc20
            ? await testToken.balanceOf(accounts[2])
            : new BN(await web3.eth.getBalance(accounts[2]))

          const { gasPrice: _gasPrice } = await web3.eth.getTransaction(tx.tx)
          const { gasUsed: _gasUsed } = tx.receipt

          const gasUsed = new BN(_gasUsed)
          const gasPrice = new BN(_gasPrice)
          const gas = gasPrice.mul(gasUsed)

          const refund = new BN(keyPrice).sub(gasRefundAmount)

          const expected = isErc20
            ? // buy a key, get a refund
              userBalanceBefore.sub(refund)
            : userBalanceBefore
                // buy a key, get a refund
                .sub(refund)
                .sub(gas) // pay for the gas

          assert.equal(userBalanceAfter.eq(expected), true)
        })
      })

      describe('purchase without gas refund', () => {
        let tx

        beforeEach(async () => {
          userBalanceBefore = isErc20
            ? await testToken.balanceOf(accounts[2])
            : new BN(await web3.eth.getBalance(accounts[2]))

          tx = await lock.purchase(
            [keyPrice.toString()],
            [accounts[2]],
            [web3.utils.padLeft(0, 40)],
            [web3.utils.padLeft(0, 40)],
            [],
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
          const userBalanceAfter = isErc20
            ? await testToken.balanceOf(accounts[2])
            : new BN(await web3.eth.getBalance(accounts[2]))

          // gather gas info for ETH balance
          const { gasPrice: _gasPrice } = await web3.eth.getTransaction(tx.tx)
          const { gasUsed: _gasUsed } = tx.receipt
          const gasUsed = new BN(_gasUsed)
          const gasPrice = new BN(_gasPrice)
          const gas = gasPrice.mul(gasUsed)

          const expected = isErc20
            ? userBalanceBefore.sub(new BN(keyPrice)) // buy a key
            : userBalanceBefore
                .sub(new BN(keyPrice)) // buy a key
                .sub(gas) // pay for the gas

          assert.equal(userBalanceAfter.eq(expected), true)
        })
      })
    })
  })
})
