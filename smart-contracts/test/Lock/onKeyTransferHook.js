const { deployLock, purchaseKey, compareBigNumbers } = require('../helpers')
const { ADDRESS_ZERO, getEvent } = require('@unlock-protocol/hardhat-helpers')

const { ethers } = require('hardhat')
const assert = require('assert')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

describe('Lock / onKeyTransfer hook', () => {
  let lock
  let testEventHooks
  let receipt
  let keyOwner, to, random, random2
  let keyPrice
  let tokenId

  before(async () => {
    ;[, keyOwner, to, random, random2] = await ethers.getSigners()
    lock = await deployLock({ isEthers: true })
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    const tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      await testEventHooks.getAddress(),
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    keyPrice = await lock.keyPrice()
    receipt = await tx.wait()
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      receipt,
      hookName: 'onKeyTransferHook',
      hookAddress: await testEventHooks.getAddress(),
    })
  })

  beforeEach(async () => {
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
  })

  it('is not fired when a key is created', async () => {
    const tx = await lock
      .connect(keyOwner)
      .purchase(
        [],
        [await random.getAddress()],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        ['0x'],
        {
          value: keyPrice,
        }
      )
    const receipt = await tx.wait()
    const evt = await getEvent(receipt, 'OnKeyTransfer')
    assert.equal(evt, null)
  })

  it('is fired when using transferFrom', async () => {
    await lock
      .connect(keyOwner)
      .transferFrom(await keyOwner.getAddress(), await to.getAddress(), tokenId)
    const { args } = (await testEventHooks.queryFilter('OnKeyTransfer')).filter(
      ({ fragment }) => fragment.name === 'OnKeyTransfer'
    )[0]
    assert.equal(args.lock, await lock.getAddress())
    compareBigNumbers(args.tokenId, tokenId)
    assert.equal(args.operator, await keyOwner.getAddress())
    assert.equal(args.from, await keyOwner.getAddress())
    assert.equal(args.to, await to.getAddress())
    const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
    compareBigNumbers(args.time, expirationTs)
  })

  it('is fired when a key manager is set', async () => {
    await lock
      .connect(keyOwner)
      .setKeyManagerOf(tokenId, await random2.getAddress())
    await lock
      .connect(random2)
      .transferFrom(
        await keyOwner.getAddress(),
        await random.getAddress(),
        tokenId
      )
    const { args } = (await testEventHooks.queryFilter('OnKeyTransfer')).filter(
      ({ fragment }) => fragment.name === 'OnKeyTransfer'
    )[1]

    assert.equal(args.lock, await lock.getAddress())
    compareBigNumbers(args.tokenId, tokenId)
    assert.equal(args.operator, await random2.getAddress())
    assert.equal(args.from, await keyOwner.getAddress())
    assert.equal(args.to, await random.getAddress())
  })

  it('cannot set the hook to a non-contract address', async () => {
    await canNotSetNonContractAddress({ lock, index: 4 })
  })

  /*
  it('is fired when using transfer', async () => {
    await lock.transfer(tokenId, to, 100, { from: keyOwner })
    const args = (await testEventHooks.getPastEvents('OnKeyTransfer'))[0].returnValues
    assert.equal(args.lock, await lock.getAddress())
    assert.equal(args.operator, keyOwner)
    assert.equal(args.tokenId, tokenId)
    assert.equal(args.from, keyOwner)
    assert.equal(args.to, to)
    assert.equal(args.time, 100)
  })
  
  it('is fired when using shareKey', async () => {
    const expirationBefore = new BigNumber(
      await lock.keyExpirationTimestampFor(tokenId)
    )
    const { timestamp } = await ethers.provider.getBlock('latest')
    const duration = expirationBefore - timestamp

    await lock.shareKey(to, tokenId, 2500, { from: keyOwner })
    const args = (await testEventHooks.getPastEvents('OnKeyTransfer'))[0].returnValues
    assert.equal(args.lock, await lock.getAddress())
    assert.equal(args.operator, keyOwner)
    assert.equal(args.from, keyOwner)
    assert.equal(args.to, to)
    
    const expirationAfter = await lock.keyExpirationTimestampFor(tokenId)
    assert.equal(args.time, expirationAfter)
    assert.equal(args.time, expirationBefore + Math.floor(duration / 4))
  })
  */
})
