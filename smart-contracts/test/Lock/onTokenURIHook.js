const assert = require('assert')
const { deployLock, purchaseKey, ADDRESS_ZERO } = require('../helpers')
const { ethers } = require('hardhat')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

let lock
let testEventHooks

describe('Lock / onTokenURIHook', () => {
  let tokenId
  let receipt
  let keyOwner, lockOwner

  before(async () => {
    ;[lockOwner, keyOwner] = await ethers.getSigners()
    lock = await deployLock({ isEthers: true })
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    const tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      await testEventHooks.getAddress(),
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    receipt = await tx.wait()
  })

  it('is set correctly', async () => {
    assert.equal(await lock.onTokenURIHook(), await testEventHooks.getAddress())
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      receipt,
      hookName: 'onTokenURIHook',
      hookAddress: await testEventHooks.getAddress(),
    })
  })

  it('tokenURI should returns a custom value', async () => {
    const baseTokenURI = await testEventHooks.baseURI()
    const expirationTimestamp = await lock.keyExpirationTimestampFor(tokenId)
    const params = [
      (await lock.getAddress()).toLowerCase(), // lockAddress
      (await keyOwner.getAddress()).toLowerCase(), // owner
      (await lockOwner.getAddress()).toLowerCase(), // operator
      expirationTimestamp, // expirationTimestamp
      tokenId, // tokenId
    ]

    assert.equal(await lock.ownerOf(tokenId), await keyOwner.getAddress())
    const tokenURI = await lock.tokenURI(tokenId)
    assert.equal(tokenURI, `${baseTokenURI}${params.join('/')}`)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await canNotSetNonContractAddress({ lock, index: 3 })
  })
})
