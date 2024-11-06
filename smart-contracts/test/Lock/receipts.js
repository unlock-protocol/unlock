const { ethers } = require('hardhat')
const assert = require('assert')
const { deployLock, deployERC20, increaseTimeTo } = require('../helpers')

const { ADDRESS_ZERO, getEvent } = require('@unlock-protocol/hardhat-helpers')

const scenarios = [false, true]
const someTokens = ethers.parseUnits('10', 'ether')
const additionalPeriods = 2n
const tip = ethers.parseUnits('0.5', 'ether')

describe('Lock / PurchaseReceipt event', () => {
  let lock
  let token
  let tokenAddress
  let tokenId, purchaseTxReceipt
  let keyPrice
  let lockOwner, spender, keyOwner, referrer
  scenarios.forEach((isErc20) => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      beforeEach(async () => {
        ;[lockOwner, spender, keyOwner, referrer] = await ethers.getSigners()
        token = await deployERC20(await lockOwner.getAddress(), true)
        tokenAddress = isErc20 ? await token.getAddress() : ADDRESS_ZERO

        // Mint some tokens for testing
        await token.mint(await spender.getAddress(), someTokens)

        // deploy lock
        lock = await deployLock({ tokenAddress, isEthers: true })
        keyPrice = await lock.keyPrice()

        // Approve spending
        await token
          .connect(spender)
          .approve(await lock.getAddress(), someTokens)

        // purchase a key
        const purchaseArgs = [
          {
            value: isErc20 ? keyPrice + tip : 0n,
            recipient: await keyOwner.getAddress(),
            keyManager: ADDRESS_ZERO,
            referrer: await referrer.getAddress(),
            data: '0x',
            additionalPeriods: 2n,
          },
        ]
        const purchaseTx = await lock.connect(spender).purchase(purchaseArgs, {
          value: isErc20 ? 0 : keyPrice + tip,
        })

        purchaseTxReceipt = await purchaseTx.wait()
        const { args } = await getEvent(purchaseTxReceipt, 'Transfer')
        ;({ tokenId } = args)
      })

      it('is fired when purchasing a key', async () => {
        const { args } = await getEvent(purchaseTxReceipt, 'PurchaseReceipt')
        assert.equal(args.tokenId, tokenId)
        assert.equal(args.recipient, await keyOwner.getAddress())
        assert.equal(args.payer, await spender.getAddress())
        assert.equal(args.value, keyPrice)
        assert.equal(args.tokenAddress, tokenAddress)
        assert.equal(args.referrer, await referrer.getAddress())
        assert.equal(args.totalPaid, keyPrice + tip)
        assert.equal(args.isExtend, false)
      })

      it('is fired when extending a key', async () => {
        // extend
        const tx = await lock
          .connect(spender)
          .extend(
            isErc20 ? keyPrice : 0,
            tokenId,
            await referrer.getAddress(),
            '0x',
            {
              value: isErc20 ? 0 : keyPrice,
            }
          )
        const receipt = await tx.wait()
        const { args } = await getEvent(receipt, 'PurchaseReceipt')
        assert.equal(args.tokenId, tokenId)
        assert.equal(args.recipient, await keyOwner.getAddress())
        assert.equal(args.payer, await spender.getAddress())
        assert.equal(args.value, keyPrice)
        assert.equal(args.tokenAddress, tokenAddress)
        assert.equal(args.referrer, await referrer.getAddress())
        assert.equal(args.totalPaid, keyPrice)
        assert.equal(args.isExtend, true)
      })

      if (isErc20) {
        it('is fired when renewing a key', async () => {
          // expire key
          const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
          await increaseTimeTo(expirationTs)

          // renew key
          const tx = await lock
            .connect(spender)
            .renewMembershipFor(tokenId, await referrer.getAddress())

          const receipt = await tx.wait()
          const { args } = await getEvent(receipt, 'PurchaseReceipt')
          assert.equal(args.tokenId, tokenId)
          assert.equal(args.recipient, await keyOwner.getAddress())
          assert.equal(args.payer, await spender.getAddress())
          assert.equal(args.value, keyPrice)
          assert.equal(args.tokenAddress, tokenAddress)
          assert.equal(args.referrer, await referrer.getAddress())
          assert.equal(args.totalPaid, keyPrice)
          assert.equal(args.isExtend, true)
        })
      }
    })
  })
})
