const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const deployLocks = require('../helpers/deployLocks')

const TestErc20Token = artifacts.require('TestErc20Token.sol')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')

const scenarios = [false, true]
let unlock, locks, testToken
const keyPrice = Units.convert('0.01', 'eth', 'wei')

contract('Lock / getBalance', accounts => {
  scenarios.forEach(isErc20 => {
    let tokenAddress

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        testToken = await TestErc20Token.new()
        // Mint some tokens for testing
        for (let i = 0; i < accounts.length; i++) {
          await testToken.mint(accounts[i], '1000000000000000000', {
            from: accounts[0],
          })
        }

        tokenAddress = isErc20 ? testToken.address : Web3Utils.padLeft(0, 40)

        unlock = await getProxy(unlockContract)
        locks = await deployLocks(unlock, accounts[0], tokenAddress)

        // Purchase 1 key
        const lock = locks['FIRST']
        await testToken.approve(lock.address, '1000000000000000000', {
          from: accounts[2],
        })
        await lock.purchase(0, accounts[2], web3.utils.padLeft(0, 40), [], {
          from: accounts[2],
          value: isErc20 ? 0 : keyPrice.toString(),
        })
      })

      it('get balance of contract', async () => {
        const balance = await locks['FIRST'].getBalance(
          tokenAddress,
          locks['FIRST'].address
        )
        assert.equal(balance.toString(), keyPrice.toString())
      })

      it('get balance of account', async () => {
        const balance = await locks['FIRST'].getBalance(
          tokenAddress,
          accounts[1]
        )
        assert(balance.gt(0))
      })
    })
  })
})
