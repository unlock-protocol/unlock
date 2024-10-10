const assert = require('assert')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO, getEvent } = require('@unlock-protocol/hardhat-helpers')
const {
  deployERC20,
  deployLock,
  purchaseKey,
  almostEqual,
  increaseTimeTo,
} = require('../helpers')

const { canNotSetNonContractAddress } = require('./behaviors/hooks.js')

const keyPrice = ethers.parseUnits('0.01', 'ether')
const someTokens = ethers.parseUnits('10', 'ether')

describe('Lock / onKeyExtendHook', () => {
  let lock
  let tokenId
  let keyOwner
  let lockOwner, testEventHooks
  let expirationDuration
  let tx

  before(async () => {
    ;[lockOwner, keyOwner] = await ethers.getSigners()

    // ERC20 token setup
    const testToken = await deployERC20(await lockOwner.getAddress())
    await testToken.mint(await keyOwner.getAddress(), someTokens)

    lock = await deployLock({
      tokenAddress: await testToken.getAddress(),
    })

    // approve lock for spending
    await testToken
      .connect(keyOwner)
      .approve(await lock.getAddress(), someTokens)

    // deploy mock events contract
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()

    // set events in lock
    tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      await testEventHooks.getAddress(),
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    expirationDuration = await lock.expirationDuration()
  })

  it('emit the correct event', async () => {
    const receipt = await tx.wait()
    const { args } = await getEvent(receipt, 'EventHooksUpdated')
    assert.equal(args.onKeyPurchaseHook, ADDRESS_ZERO)
    assert.equal(args.onKeyCancelHook, ADDRESS_ZERO)
    assert.equal(args.onValidKeyHook, ADDRESS_ZERO)
    assert.equal(args.onTokenURIHook, ADDRESS_ZERO)
    assert.equal(args.onKeyTransferHook, ADDRESS_ZERO)
    assert.equal(args.onKeyExtendHook, await testEventHooks.getAddress())
    assert.equal(args.onKeyGrantHook, ADDRESS_ZERO)
  })

  describe('extend', () => {
    it('key cancels should log the hook event', async () => {
      ;({ tokenId } = await purchaseKey(
        lock,
        await keyOwner.getAddress(),
        true
      ))
      const tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      await lock.connect(keyOwner).extend(keyPrice, tokenId, ADDRESS_ZERO, '0x')
      const { args } = (await testEventHooks.queryFilter('OnKeyExtend')).filter(
        ({ fragment }) => fragment.name === 'OnKeyExtend'
      )[0]
      assert.equal(args.msgSender, await lock.getAddress())
      assert.equal(args.tokenId, tokenId)
      assert.equal(args.from, await keyOwner.getAddress())
      assert.equal(tsBefore + expirationDuration, args.newTimestamp)
      assert.equal(tsBefore, args.prevTimestamp)
    })
  })

  describe('grantKeyExtension', () => {
    it('key cancels should log the hook event', async () => {
      ;({ tokenId } = await purchaseKey(
        lock,
        await keyOwner.getAddress(),
        true
      ))
      const tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      await lock.grantKeyExtension(tokenId, expirationDuration)
      const { args } = (await testEventHooks.queryFilter('OnKeyExtend')).filter(
        ({ fragment }) => fragment.name === 'OnKeyExtend'
      )[1]
      assert.equal(args.msgSender, await lock.getAddress())
      assert.equal(args.tokenId, tokenId)
      assert.equal(args.from, await lockOwner.getAddress())
      assert.equal(tsBefore + expirationDuration, args.newTimestamp)
      assert.equal(tsBefore, args.prevTimestamp)
    })
  })

  describe('renewMembershipFor', () => {
    it('key cancels should log the hook event', async () => {
      ;({ tokenId } = await purchaseKey(
        lock,
        await keyOwner.getAddress(),
        true
      ))
      // expire key
      const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await increaseTimeTo(newExpirationTs - 1n)
      // renew
      const tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
      const { args } = (await testEventHooks.queryFilter('OnKeyExtend')).filter(
        ({ fragment }) => fragment.name === 'OnKeyExtend'
      )[2]
      assert.equal(args.msgSender, await lock.getAddress())
      assert.equal(args.tokenId, tokenId)
      assert.equal(args.from, await lockOwner.getAddress())
      assert(almostEqual(tsBefore + expirationDuration, args.newTimestamp))
      assert.equal(tsBefore, args.prevTimestamp)
    })
  })

  it('cannot set the hook to a non-contract address', async () => {
    await canNotSetNonContractAddress({ lock, index: 5 })
  })
})
