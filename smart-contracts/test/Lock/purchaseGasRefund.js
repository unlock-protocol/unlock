const BigNumber = require('bignumber.js')
const { tokens } = require('hardlydifficult-ethereum-contracts')
const deployLocks = require('../helpers/deployLocks')
const getProxy = require('../helpers/proxy')

const unlockContract = artifacts.require('Unlock.sol')
const Erc20Token = artifacts.require('IERC20.sol')

const scenarios = [false, true]
let unlock
let locks
let testToken
const keyPrice = web3.utils.toWei('0.01', 'ether')
const tip = new BigNumber(keyPrice).plus(web3.utils.toWei('1', 'ether'))

contract('Lock / purchaseTip', (accounts) => {
  scenarios.forEach((isErc20, i) => {
    let lock
    let tokenAddress
    let userBalanceBefore

    if (i === 1) return

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        testToken = await tokens.dai.deploy(web3, accounts[0])
        // Mint some tokens for testing
        await testToken.mint(accounts[2], '100000000000000000000', {
          from: accounts[0],
        })

        tokenAddress = isErc20 ? testToken.address : web3.utils.padLeft(0, 40)

        unlock = await getProxy(unlockContract)
        locks = await deployLocks(unlock, accounts[0], tokenAddress)
        lock = locks.FIRST

        // Approve spending
        await testToken.approve(lock.address, tip, {
          from: accounts[2],
        })

        userBalanceBefore = isErc20
          ? await Erc20Token.at(tokenAddress).balanceOf(accounts[2])
          : await web3.eth.getBalance(accounts[2])
      })

      describe('purchase with gas refund', () => {
        let tx

        beforeEach(async () => {
          await lock.setGasRefundPercentage(25)
          tx = await lock.purchase(
            keyPrice.toString(),
            accounts[2],
            web3.utils.padLeft(0, 40),
            [],
            {
              from: accounts[2],
              value: isErc20 ? 0 : keyPrice.toString(),
            }
          )
        })

        it('gas refunded event is fired', async () => {
          const evt = tx.logs.find((v) => v.event === 'GasRefunded')
          const { receiver, refundedAmount, refundedTokenAddress } = evt.args
          assert.equal(receiver, accounts[2])
          assert.equal(refundedAmount.toNumber(), keyPrice / 4)
          assert.equal(refundedTokenAddress, tokenAddress)
        })

        it('user gas has been refunded', async () => {
          const userBalanceAfter = isErc20
            ? await Erc20Token.at(tokenAddress).balanceOf(accounts[2])
            : await web3.eth.getBalance(accounts[2])

          assert.equal(
            userBalanceAfter.toNumber(),
            userBalanceBefore + keyPrice / 4
          )
        })
      })
    })
  })
})
