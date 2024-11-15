const assert = require('assert')
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
const keyPrice = ethers.parseUnits('0.01', 'ether')
const allowance = '100000000000000000000'

describe('Lock / purchase multiple keys at once', () => {
  scenarios.forEach((isErc20) => {
    let lock
    let tokenAddress
    let keyOwners
    let purchaseArgs

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        const [holder, deployer, ...signers] = await ethers.getSigners()
        keyOwners = signers.slice(1, 5)
        testToken = await deployERC20(deployer)

        // Mint some tokens for testing
        await testToken
          .connect(deployer)
          .mint(await holder.getAddress(), allowance)

        tokenAddress = isErc20 ? await testToken.getAddress() : ADDRESS_ZERO
        lock = await deployLock({ tokenAddress })

        // Approve spending
        await testToken
          .connect(holder)
          .approve(await lock.getAddress(), allowance)

        purchaseArgs = await Promise.all(
          keyOwners.map(async (keyOwner) => ({
            value: isErc20 ? keyPrice : 0n,
            recipient: await keyOwner.getAddress(),
            keyManager: ADDRESS_ZERO,
            referrer: ADDRESS_ZERO,
            protocolReferrer: ADDRESS_ZERO,
            data: '0x',
            additionalPeriods: 0,
          }))
        )
      })

      describe('purchase with exact value specified', () => {
        beforeEach(async () => {
          await lock.purchase(purchaseArgs, {
            value: isErc20 ? 0 : keyPrice * BigInt(purchaseArgs.length),
          })
        })

        it('user sent correct token amounts to the contract', async () => {
          const balance = await getBalance(
            await lock.getAddress(),
            isErc20 ? await testToken.getAddress() : null
          )
          compareBigNumbers(balance, keyPrice * BigInt(keyOwners.length))
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
              purchaseArgs.map((p) => ({
                ...p,
                value: isErc20 ? ethers.parseUnits('0.005', 'ether') : 0n,
              })),
              {
                value: isErc20 ? 0 : keyPrice * BigInt(keyOwners.length - 2),
              }
            ),
            isErc20 ? 'INSUFFICIENT_ERC20_VALUE' : 'INSUFFICIENT_VALUE'
          )
        })
      })
    })
  })
})
