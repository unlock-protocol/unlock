const { ethers } = require('hardhat')
const assert = require('assert')
const {
  deployLock,
  deployERC20,
  increaseTimeTo,
  compareBigNumberArrays,
} = require('../helpers')

const {
  ADDRESS_ZERO,
  getEvent,
  getEvents,
} = require('@unlock-protocol/hardhat-helpers')

const scenarios = [false, true]
const someTokens = ethers.parseUnits('10', 'ether')
const tip = ethers.parseUnits('0.005', 'ether')

describe('Lock / PaymentReceipt event', () => {
  let lock
  let token
  let tokenAddress
  let tokenIds, purchaseTxReceipt
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
            protocolReferrer: ADDRESS_ZERO,
            data: '0x',
            additionalPeriods: 2n,
          },
          {
            value: isErc20 ? keyPrice : 0n,
            recipient: await keyOwner.getAddress(),
            keyManager: ADDRESS_ZERO,
            referrer: await referrer.getAddress(),
            protocolReferrer: await referrer.getAddress(),
            data: '0x',
            additionalPeriods: 3n,
          },
        ]
        const purchaseTx = await lock.connect(spender).purchase(purchaseArgs, {
          value: isErc20 ? 0 : keyPrice * 7n,
        })

        purchaseTxReceipt = await purchaseTx.wait()
        const { events: transfers } = await getEvents(
          purchaseTxReceipt,
          'Transfer'
        )
        tokenIds = transfers.map(({ args }) => args.tokenId)
      })

      it('is fired when purchasing a key', async () => {
        const { args } = await getEvent(purchaseTxReceipt, 'PaymentReceipt')
        compareBigNumberArrays(args.tokenIds.toArray(), tokenIds)
        assert.equal(args.purchases, 2n)
        assert.equal(args.extensions, 5n)
        assert.equal(args.payer, await spender.getAddress())
        assert.equal(args.tokenAddress, tokenAddress)
        assert.equal(args.totalPaid, keyPrice * 7n)
      })

      it('is fired when purchasing a key using legacy sig', async () => {
        const purchaseTx = await lock
          .connect(spender)
          .purchase(
            isErc20 ? [keyPrice, keyPrice] : [],
            [await keyOwner.getAddress(), await keyOwner.getAddress()],
            [ADDRESS_ZERO, ADDRESS_ZERO],
            [ADDRESS_ZERO, ADDRESS_ZERO],
            ['0x', '0x'],
            {
              value: isErc20 ? 0 : keyPrice * 2n,
            }
          )
        const receipt = await purchaseTx.wait()
        const { events } = await getEvents(receipt, 'Transfer')
        const tokenIds = events.map(({ args }) => args.tokenId)
        const { args } = await getEvent(receipt, 'PaymentReceipt')
        compareBigNumberArrays(args.tokenIds.toArray(), tokenIds)
        assert.equal(args.purchases, 2n)
        assert.equal(args.extensions, 0n)
        assert.equal(args.payer, await spender.getAddress())
        assert.equal(args.tokenAddress, tokenAddress)
        assert.equal(args.totalPaid, keyPrice * 2n)
      })

      it('is fired when extending a key', async () => {
        // extend
        const tx = await lock
          .connect(spender)
          .extend(
            isErc20 ? keyPrice : 0,
            tokenIds[0],
            await referrer.getAddress(),
            '0x',
            {
              value: isErc20 ? 0 : keyPrice,
            }
          )
        const receipt = await tx.wait()
        const { args } = await getEvent(receipt, 'PaymentReceipt')
        compareBigNumberArrays(args.tokenIds.toArray(), [tokenIds[0]])
        assert.equal(args.purchases, 0n)
        assert.equal(args.extensions, 1n)
        assert.equal(args.payer, await spender.getAddress())
        assert.equal(args.tokenAddress, tokenAddress)
        assert.equal(args.totalPaid, keyPrice)
      })

      if (isErc20) {
        it('is fired when renewing a key', async () => {
          // Approve key owner to spend
          await token.mint(await keyOwner.getAddress(), someTokens)
          await token
            .connect(keyOwner)
            .approve(await lock.getAddress(), someTokens)

          // expire key
          const expirationTs = await lock.keyExpirationTimestampFor(tokenIds[1])
          await increaseTimeTo(expirationTs)

          // renew key
          const tx = await lock
            .connect(spender)
            .renewMembershipFor(tokenIds[1], await referrer.getAddress())

          const receipt = await tx.wait()
          const { args } = await getEvent(receipt, 'PaymentReceipt')
          compareBigNumberArrays(args.tokenIds.toArray(), [tokenIds[1]])
          assert.equal(args.purchases, 0n)
          assert.equal(args.extensions, 1n)
          assert.equal(args.payer, await spender.getAddress())
          assert.equal(args.tokenAddress, tokenAddress)
          assert.equal(args.totalPaid, keyPrice)
        })
      }
    })
  })
})
