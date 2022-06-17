const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')
const BigNumber = require('bignumber.js')

const unlockContract = artifacts.require('Unlock.sol')
const TestEventHooks = artifacts.require('TestEventHooks.sol')
const getContractInstance = require('../helpers/truffle-artifacts')
const { ADDRESS_ZERO } = require('../helpers/constants')
const { assert } = require('chai')

let lock
let locks
let unlock
let testEventHooks

contract('Lock / onKeyTransfer hook', (accounts) => {
  const keyOwner = accounts[1]
  const to = accounts[2]
  let keyPrice
  let tokenId

  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    testEventHooks = await TestEventHooks.new()
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
    const tx = await lock.purchase(
      [],
      [keyOwner],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        from: accounts[0],
        value: keyPrice,
      }
    )
    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    tokenId = args.tokenId
  })

  it('is not fired when a key is created', async () => {
    const tx = await lock.purchase(
      [],
      [accounts[5]],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        from: keyOwner,
        value: keyPrice,
      }
    )
    const evt = tx.logs.find((v) => v.event === 'OnKeyTransfer')
    assert.equal(evt, null)
  })

  it('is fired when using transferFrom', async () => {
    await lock.transferFrom(keyOwner, to, tokenId, { from: keyOwner })
    const args = (await testEventHooks.getPastEvents('OnKeyTransfer'))[0]
      .returnValues
    assert.equal(args.lock, lock.address)
    assert.equal(args.tokenId, tokenId)
    assert.equal(args.operator, keyOwner)
    assert.equal(args.from, keyOwner)
    assert.equal(args.to, to)
    const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
    assert.equal(args.time, expirationTs)
  })

  it('not fired when a key manager is set', async () => {
    await lock.setKeyManagerOf(tokenId, accounts[6], { from: keyOwner })
    await reverts(
      lock.transferFrom(keyOwner, accounts[3], tokenId, {
        from: accounts[6],
      }),
      'UNAUTHORIZED'
    )
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        accounts[1]
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
