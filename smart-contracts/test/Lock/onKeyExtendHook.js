const { ethers } = require('hardhat')
const {
  deployERC20,
  deployLock,
  ADDRESS_ZERO,
  purchaseKey,
  reverts,
} = require('../helpers')

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const someTokens = ethers.utils.parseUnits('10', 'ether')

contract('Lock / onKeyExtendHook', (accounts) => {
  let lock
  let tsBefore
  let tokenId
  let keyOwner
  let lockOwner
  let testEventHooks

  before(async () => {
    ;[lockOwner, keyOwner] = await ethers.getSigners()

    // ERC20 token setup
    const testToken = await deployERC20(lockOwner.address)
    await testToken.mint(keyOwner.address, someTokens, {
      from: lockOwner.address,
    })

    // deploy ERC20 token
    const { address } = await deployLock({ tokenAddress: testToken.address })
    lock = await ethers.getContractAt('PublicLock', address)
    await testToken.approve(lock.address, someTokens, {
      from: keyOwner.address,
    })

    // deploy mock events contract
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    await testEventHooks.deployed()

    // set events in lock
    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      testEventHooks.address
    )
    ;({ tokenId } = await purchaseKey(lock, keyOwner.address, true))
    tsBefore = await lock.keyExpirationTimestampFor(tokenId)

    // extend the key
    await lock.connect(keyOwner).extend(keyPrice, tokenId, ADDRESS_ZERO, [])
  })

  it('key cancels should log the hook event', async () => {
    const { args } = (await testEventHooks.queryFilter('OnKeyExtend')).find(
      ({ event }) => event === 'OnKeyExtend'
    )
    console.log(args)
    assert.equal(args.msgSender, lock.address)
    assert.equal(args.tokenId.toString(), tokenId.toString())
    assert.equal(args.from, keyOwner.address)
    const expirationDuration = await lock.expirationDuration()
    assert.equal(
      tsBefore.add(expirationDuration).toString(),
      args.newTimestamp.toString()
    )
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        accounts[1]
      ),
      'INVALID_HOOK(5)'
    )
  })
})
