const { ethers } = require('hardhat')
const { assert } = require('chai')
const { deployLock, reverts, purchaseKey, ADDRESS_ZERO } = require('../helpers')

let lock
let testEventHooks

describe('Lock / onKeyTransfer hook', () => {
  let keyOwner, to, keyManager, anotherAccount
  let keyPrice
  let tokenId

  before(async () => {
    lock = await deployLock()
    ;[, keyOwner, to, keyManager, anotherAccount] = await ethers.getSigners()

    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    await testEventHooks.deployed()

    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address
    )

    keyPrice = await lock.keyPrice()
    await lock.setMaxKeysPerAddress(10)
  })

  beforeEach(async () => {
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
  })

  it('is not fired when a key is created', async () => {
    const tx = await lock.purchase(
      [],
      [anotherAccount.address],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: keyPrice,
      }
    )
    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'OnKeyTransfer')
    assert.equal(evt, null)
  })

  it('is fired when using transferFrom', async () => {
    await lock
      .connect(keyOwner)
      .transferFrom(keyOwner.address, to.address, tokenId)

    const [event] = await testEventHooks.queryFilter('OnKeyTransfer')
    const { args } = event

    assert.equal(args.lock, lock.address)
    assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
    assert.equal(args.operator, keyOwner.address)
    assert.equal(args.from, keyOwner.address)
    assert.equal(args.to, to.address)
    const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
    assert.equal(args.time.toNumber(), expirationTs.toNumber())
  })

  it('is fired when a key manager is set', async () => {
    await lock.connect(keyOwner).setKeyManagerOf(tokenId, keyManager.address)
    await lock
      .connect(keyManager)
      .transferFrom(keyOwner.address, to.address, tokenId)
    const [, event] = await testEventHooks.queryFilter('OnKeyTransfer')
    const { args } = event

    assert.equal(args.lock, lock.address)
    assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
    assert.equal(args.operator, keyManager.address)
    assert.equal(args.from, keyOwner.address)
    assert.equal(args.to, to.address)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        to.address
      ),
      'INVALID_HOOK(4)'
    )
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
