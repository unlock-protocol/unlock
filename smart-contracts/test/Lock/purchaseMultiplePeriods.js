const assert = require('assert')
const { reverts, deployERC20, deployLock, getBalance } = require('../helpers')
const { getEvent, ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')
const { ethers } = require('hardhat')

const scenarios = [false, true]

let testToken
const keyPrice = ethers.parseUnits('0.01', 'ether')
const allowance = '100000000000000000000'

describe('Lock / purchase multiple periods at once', () => {
  scenarios.forEach((isErc20) => {
    let lock
    let tokenAddress
    let holder, deployer, keyOwner
    let purchaseArgs
    const nbPeriods = 3n

    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        ;[holder, deployer, keyOwner] = await ethers.getSigners()

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

        purchaseArgs = [
          {
            value: isErc20 ? keyPrice : 0n,
            recipient: await keyOwner.getAddress(),
            keyManager: ADDRESS_ZERO,
            referrer: ADDRESS_ZERO,
            data: '0x',
            additionalPeriods: nbPeriods,
          },
        ]
      })

      describe('purchase with exact value specified', () => {
        let tokenId
        let tsBefore
        beforeEach(async () => {
          const tx = await lock.purchase(purchaseArgs, {
            value: isErc20 ? 0 : keyPrice * (nbPeriods + 1n),
          })
          const receipt = await tx.wait()
          const { args, blockNumber } = await getEvent(receipt, 'Transfer')

          ;({ tokenId } = args)
          ;({ timestamp: tsBefore } =
            await ethers.provider.getBlock(blockNumber))
        })

        it('user sent correct token amounts to the contract', async () => {
          const balance = await getBalance(
            await lock.getAddress(),
            isErc20 ? await testToken.getAddress() : null
          )
          assert.equal(balance, keyPrice * (nbPeriods + 1n))
        })

        it('should have received a valid key', async () => {
          assert(await lock.getHasValidKey(await keyOwner.getAddress()))
          assert(await lock.isValidKey(tokenId))
        })

        it('duration should have been updated', async () => {
          assert(
            await lock.keyExpirationTimestampFor(tokenId),
            BigInt(tsBefore) +
              (await lock.expirationDuration()) * (nbPeriods + 1n)
          )
        })
      })

      // TODO: test fees: protocol fee, referrer fee, record key purchase
      // TODO: test events are fired properly

      describe('purchase with wrong amounts', () => {
        it('reverts when wrong amounts are specified', async () => {
          await reverts(
            lock.purchase(
              purchaseArgs.map((p) => ({
                ...p,
                value: isErc20 ? ethers.parseUnits('0.005', 'ether') : 0n,
              })),
              {
                value: isErc20 ? 0 : keyPrice * nbPeriods,
              }
            ),
            isErc20 ? 'INSUFFICIENT_ERC20_VALUE' : 'INSUFFICIENT_VALUE'
          )
        })
      })
    })
  })
})
