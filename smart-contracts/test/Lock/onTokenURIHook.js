const { ethers } = require('hardhat')
const { assert } = require('chai')
const { deployLock, reverts, purchaseKey, ADDRESS_ZERO } = require('../helpers')

let lock
let testEventHooks
let keyOwner, operator
let tokenId

describe('Lock / onTokenURIHook', () => {
  before(async () => {
    lock = await deployLock()
    ;[, keyOwner, operator] = await ethers.getSigners()
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    await testEventHooks.deployed()

    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO
    )
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
  })

  it('tokenURI should returns a custom value', async () => {
    const baseTokenURI = 'https://unlock-uri-hook.test/'
    const expirationTimestamp = await lock.keyExpirationTimestampFor(tokenId)
    const params = [
      lock.address.toLowerCase(), // lockAddress
      keyOwner.address.toLowerCase(), // owner
      operator.address.toLowerCase(), // operator
      expirationTimestamp, // expirationTimestamp
      tokenId, // tokenId
    ]

    const tokenURI = `${baseTokenURI}${params.join('/')}`
    assert.equal(await lock.connect(operator).tokenURI(tokenId), tokenURI)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        operator.address,
        ADDRESS_ZERO
      ),
      'INVALID_HOOK(3)'
    )
  })
})
