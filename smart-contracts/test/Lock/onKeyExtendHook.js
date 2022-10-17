const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
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
  let tokenId
  let keyOwner
  let lockOwner
  let testEventHooks
  let expirationDuration

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
      testEventHooks.address,
      ADDRESS_ZERO
    )
    expirationDuration = await lock.expirationDuration()
  })

  describe('extend', () => {
    it('key cancels should log the hook event', async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address, true))
      const tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      await lock.connect(keyOwner).extend(keyPrice, tokenId, ADDRESS_ZERO, [])
      const { args } = (await testEventHooks.queryFilter('OnKeyExtend')).filter(
        ({ event }) => event === 'OnKeyExtend'
      )[0]
      assert.equal(args.msgSender, lock.address)
      assert.equal(args.tokenId.toString(), tokenId.toString())
      assert.equal(args.from, keyOwner.address)
      assert.equal(
        tsBefore.add(expirationDuration).toString(),
        args.newTimestamp.toString()
      )
      assert.equal(tsBefore.toString(), args.prevTimestamp.toString())
    })
  })

  describe('grantKeyExtension', () => {
    it('key cancels should log the hook event', async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address, true))
      const tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      await lock.grantKeyExtension(tokenId, expirationDuration)
      const { args } = (await testEventHooks.queryFilter('OnKeyExtend')).filter(
        ({ event }) => event === 'OnKeyExtend'
      )[1]
      assert.equal(args.msgSender, lock.address)
      assert.equal(args.tokenId.toString(), tokenId.toString())
      assert.equal(args.from, lockOwner.address)
      assert.equal(
        tsBefore.add(expirationDuration).toString(),
        args.newTimestamp.toString()
      )
      assert.equal(tsBefore.toString(), args.prevTimestamp.toString())
    })
  })

  describe('renewMembershipFor', () => {
    it('key cancels should log the hook event', async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address, true))
      // expire key
      const newExpirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await time.increaseTo(newExpirationTs.toNumber() - 1)
      // renew
      const tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
      const { args } = (await testEventHooks.queryFilter('OnKeyExtend')).filter(
        ({ event }) => event === 'OnKeyExtend'
      )[2]
      assert.equal(args.msgSender, lock.address)
      assert.equal(args.tokenId.toString(), tokenId.toString())
      assert.equal(args.from, lockOwner.address)
      assert.equal(
        tsBefore.add(expirationDuration).toString(),
        args.newTimestamp.toString()
      )
      assert.equal(tsBefore.toString(), args.prevTimestamp.toString())
    })
  })

  it('cannot set the hook to a non-contract address', async () => {
    await reverts(
      lock.setEventHooks(
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        ADDRESS_ZERO,
        accounts[1],
        ADDRESS_ZERO
      ),
      'INVALID_HOOK(5)'
    )
  })
})
