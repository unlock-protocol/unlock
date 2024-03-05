const { assert } = require('chai')
const {
  reverts,
  deployERC20,
  deployLock,
  ADDRESS_ZERO,
  getBalance,
  compareBigNumbers,
} = require('../helpers')
const { ethers } = require('hardhat')

const scenarios = [false, true]

let testToken
const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const allowance = '100000000000000000000'

describe('Lock / purchase multiple keys at once', () => {
  scenarios.forEach((isErc20) => {
    let lock
    let tokenAddress
    let keyOwners

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        const [holder, deployer, ...signers] = await ethers.getSigners()
        keyOwners = signers.slice(1, 5)
        testToken = await deployERC20(deployer)

        // Mint some tokens for testing
        await testToken.connect(deployer).mint(holder.address, allowance)

        tokenAddress = isErc20 ? testToken.address : ADDRESS_ZERO
        lock = await deployLock({ tokenAddress })

        // Approve spending
        await testToken.connect(holder).approve(lock.address, allowance)
      })

      describe('purchase with exact value specified', () => {
        beforeEach(async () => {
          await lock.purchase(
            isErc20 ? keyOwners.map(() => keyPrice) : [],
            keyOwners.map(({ address }) => address),
            keyOwners.map(() => ADDRESS_ZERO),
            keyOwners.map(() => ADDRESS_ZERO),
            keyOwners.map(() => []),
            {
              value: isErc20 ? 0 : keyPrice.mul(keyOwners.length),
            }
          )
        })

        it('user sent correct token amounts to the contract', async () => {
          const balance = await getBalance(
            lock.address,
            isErc20 ? testToken.address : null
          )
          compareBigNumbers(balance, keyPrice.mul(keyOwners.length))
        })

        it('users should have valid keys', async () => {
          const areValid = await Promise.all(
            keyOwners.map(({ address }) => lock.getHasValidKey(address))
          )
          areValid.forEach((isValid) => assert.equal(isValid, true))
        })
      })

      describe('purchase with wrong amounts', () => {
        it('reverts when wrong amounts are specified', async () => {
          await reverts(
            lock.connect(keyOwners[1]).purchase(
              isErc20
                ? keyOwners.map(() => ethers.utils.parseUnits('0.005', 'ether'))
                : [],
              keyOwners.map(({ address }) => address),

              keyOwners.map(() => ADDRESS_ZERO),
              keyOwners.map(() => ADDRESS_ZERO),
              keyOwners.map(() => []),
              {
                value: isErc20 ? 0 : keyPrice.mul(keyOwners.length - 2),
              }
            ),
            isErc20 ? 'INSUFFICIENT_ERC20_VALUE' : 'INSUFFICIENT_VALUE'
          )
        })
      })
    })
  })
})
