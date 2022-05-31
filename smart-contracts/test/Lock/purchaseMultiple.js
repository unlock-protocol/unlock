const { reverts } = require('../helpers/errors')
const { tokens } = require('hardlydifficult-ethereum-contracts')
const deployLocks = require('../helpers/deployLocks')
const getProxy = require('../helpers/proxy')

const unlockContract = artifacts.require('Unlock.sol')

const scenarios = [false, true]
let unlock
let locks
let testToken
const keyPrice = web3.utils.toWei('0.01', 'ether')

contract('Lock / purchase multiple keys at once', (accounts) => {
  scenarios.forEach((isErc20) => {
    let lock
    let tokenAddress
    const keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]

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
        await testToken.approve(
          lock.address,
          (keyPrice * keyOwners.length).toString(),
          {
            from: accounts[2],
          }
        )
      })

      describe('purchase with exact value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            isErc20 ? keyOwners.map(() => keyPrice) : [],
            keyOwners,
            keyOwners.map(() => web3.utils.padLeft(0, 40)),
            keyOwners.map(() => web3.utils.padLeft(0, 40)),
            keyOwners.map(() => []),
            {
              value: isErc20 ? 0 : keyPrice * keyOwners.length,
              from: keyOwners[1],
            }
          )
        })

        it('user sent correct token amounts to the contract', async () => {
          const balance = isErc20
            ? await testToken.balanceOf(lock.address)
            : await web3.eth.getBalance(lock.address)
          assert.equal(
            balance.toString(),
            (keyPrice * keyOwners.length).toString()
          )
        })

        it('users should have valid keys', async () => {
          const areValid = await Promise.all(
            keyOwners.map((account) => lock.getHasValidKey.call(account))
          )
          areValid.forEach((isValid) => assert.equal(isValid, true))
        })
      })

      describe('purchase with wrong amounts', () => {
        it('reverts when wrong amounts are specified', async () => {
          await reverts(
            lock.purchase(
              isErc20
                ? keyOwners.map(() => web3.utils.toWei('0.005', 'ether'))
                : [],
              keyOwners,
              keyOwners.map(() => web3.utils.padLeft(0, 40)),
              keyOwners.map(() => web3.utils.padLeft(0, 40)),
              keyOwners.map(() => []),
              {
                value: isErc20 ? 0 : keyPrice * (keyOwners.length - 2),
                from: keyOwners[1],
              }
            ),
            isErc20 ? 'INSUFFICIENT_ERC20_VALUE' : 'INSUFFICIENT_VALUE'
          )
        })
      })
    })
  })
})
