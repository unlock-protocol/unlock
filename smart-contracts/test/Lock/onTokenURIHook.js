const { deployLock, reverts, purchaseKey, ADDRESS_ZERO } = require('../helpers')

const TestEventHooks = artifacts.require('TestEventHooks.sol')

let lock
let testEventHooks

contract('Lock / onTokenURIHook', (accounts) => {
  const keyOwner = accounts[1]
  let tokenId
  let tx

  before(async () => {
    lock = await deployLock()
    testEventHooks = await TestEventHooks.new()
    tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
  })

  it('emit the correct event', async () => {
    const { args } = tx.logs.find(({ event }) => event === 'EventHooksUpdated')
    assert.equal(args.onKeyPurchaseHook, ADDRESS_ZERO)
    assert.equal(args.onKeyCancelHook, ADDRESS_ZERO)
    assert.equal(args.onValidKeyHook, ADDRESS_ZERO)
    assert.equal(args.onTokenURIHook, testEventHooks.address)
    assert.equal(args.onKeyTransferHook, ADDRESS_ZERO)
    assert.equal(args.onKeyExtendHook, ADDRESS_ZERO)
    assert.equal(args.onKeyGrantHook, ADDRESS_ZERO)
  })

  it('tokenURI should returns a custom value', async () => {
    const baseTokenURI = 'https://unlock-uri-hook.test/'
    const expirationTimestamp = await lock.keyExpirationTimestampFor(tokenId)
    const params = [
      lock.address.toLowerCase(), // lockAddress
      keyOwner.toLowerCase(), // owner
      accounts[3].toLowerCase(), // operator
      expirationTimestamp, // expirationTimestamp
      tokenId, // tokenId
    ]

    const tokenURI = `${baseTokenURI}${params.join('/')}`
    assert.equal(await lock.tokenURI(tokenId, { from: accounts[3] }), tokenURI)
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        accounts[3],
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO
      ),
      'INVALID_HOOK(3)'
    )
  })
})
