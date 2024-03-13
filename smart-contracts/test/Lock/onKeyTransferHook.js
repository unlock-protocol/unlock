const { deployLock, purchaseKey, compareBigNumbers } = require('../helpers')
const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')

const { ethers } = require('hardhat')
const { assert } = require('chai')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

describe('Lock / onKeyTransfer hook', () => {
  let lock
  let testEventHooks
  let events
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
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    keyPrice = await lock.keyPrice()
    ;({ events } = await tx.wait())
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      events,
      hookName: 'onKeyTransferHook',
      hookAddress: testEventHooks.address,
    })
  })

  beforeEach(async () => {
    ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
  })

  it('is not fired when a key is created', async () => {
    const tx = await lock
      .connect(keyOwner)
      .purchase([], [random.address], [ADDRESS_ZERO], [ADDRESS_ZERO], [[]], {
        value: keyPrice,
      })
    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'OnKeyTransfer')
    assert.equal(evt, null)
  })

  it('is fired when using transferFrom', async () => {
    await lock
      .connect(keyOwner)
      .transferFrom(keyOwner.address, to.address, tokenId)
    const { args } = (await testEventHooks.queryFilter('OnKeyTransfer')).filter(
      ({ event }) => event === 'OnKeyTransfer'
    )[0]
    assert.equal(args.lock, lock.address)
    compareBigNumbers(args.tokenId, tokenId)
    assert.equal(args.operator, keyOwner.address)
    assert.equal(args.from, keyOwner.address)
    assert.equal(args.to, to.address)
    const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
    compareBigNumbers(args.time, expirationTs)
  })

  it('is fired when a key manager is set', async () => {
    await lock.connect(keyOwner).setKeyManagerOf(tokenId, random2.address)
    await lock
      .connect(random2)
      .transferFrom(keyOwner.address, random.address, tokenId)
    const { args } = (await testEventHooks.queryFilter('OnKeyTransfer')).filter(
      ({ event }) => event === 'OnKeyTransfer'
    )[1]

    assert.equal(args.lock, lock.address)
    compareBigNumbers(args.tokenId, tokenId)
    assert.equal(args.operator, random2.address)
    assert.equal(args.from, keyOwner.address)
    assert.equal(args.to, random.address)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await canNotSetNonContractAddress({ lock, index: 4 })
  })

  /*
  it('is fired when using transfer', async () => {
    await lock.transfer(tokenId, to, 100, { from: keyOwner })
    const args = (await testEventHooks.getPastEvents('OnKeyTransfer'))[0].returnValues
    assert.equal(args.lock, lock.address)
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
    assert.equal(args.lock, lock.address)
    assert.equal(args.operator, keyOwner)
    assert.equal(args.from, keyOwner)
    assert.equal(args.to, to)
    
    const expirationAfter = await lock.keyExpirationTimestampFor(tokenId)
    assert.equal(args.time, expirationAfter.toString())
    assert.equal(args.time, expirationBefore + Math.floor(duration / 4))
  })
  */
})
