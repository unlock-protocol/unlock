const {
  reverts,
  deployERC20,
  deployLock,
  ADDRESS_ZERO,
  getBalance,
} = require('../helpers')
const { ethers } = require('hardhat')

const scenarios = [false, true]

let testToken
const keyPrice = ethers.utils.parseUnits('0.01', 'ether')

contract('Lock / purchase multiple keys at once', (accounts) => {
  scenarios.forEach((isErc20) => {
    let lock
    let tokenAddress
    const keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        testToken = await deployERC20(accounts[0])
        // Mint some tokens for testing
        await testToken.mint(accounts[2], '100000000000000000000', {
          from: accounts[0],
        })

        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO
        lock = await deployLock({ tokenAddress })

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
            keyOwners.map(() => ADDRESS_ZERO),
            keyOwners.map(() => ADDRESS_ZERO),
            keyOwners.map(() => []),
            {
              value: isErc20 ? 0 : keyPrice * keyOwners.length,
              from: keyOwners[1],
            }
          )
        })

        it('user sent correct token amounts to the contract', async () => {
          const balance = await getBalance(
            lock.address,
            isErc20 ? testToken.address : null
          )
          assert.equal(
            balance.toString(),
            (keyPrice * keyOwners.length).toString()
          )
        })

        it('users should have valid keys', async () => {
          const areValid = await Promise.all(
            keyOwners.map((account) => lock.getHasValidKey(account))
          )
          areValid.forEach((isValid) => assert.equal(isValid, true))
        })
      })

      describe('purchase with wrong amounts', () => {
        it('reverts when wrong amounts are specified', async () => {
          await reverts(
            lock.purchase(
              isErc20
                ? keyOwners.map(() => ethers.utils.parseUnits('0.005', 'ether'))
                : [],
              keyOwners,
              keyOwners.map(() => ADDRESS_ZERO),
              keyOwners.map(() => ADDRESS_ZERO),
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
