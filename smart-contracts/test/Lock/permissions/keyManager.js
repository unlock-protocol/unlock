const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  reverts,
  deployLock,
  ADDRESS_ZERO,
  purchaseKey,
} = require('../../helpers')

let lock
let keyOwner, keyManager, keyRecipient, keyGrantee
let tokenId
const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const oneDay = 60 * 60 * 24

describe('Permissions / KeyManager', () => {
  let validExpirationTimestamp

  before(async () => {
    ;[, keyOwner, keyManager, keyRecipient, keyGrantee] =
      await ethers.getSigners()
    lock = await deployLock()
  })

  beforeEach(async () => {
    // get time
    const blockNumber = await ethers.provider.getBlockNumber()
    const latestBlock = await ethers.provider.getBlock(blockNumber)
    validExpirationTimestamp = Math.round(latestBlock.timestamp + 600)
  })

  it('should leave the KM == 0x00(default) for new purchases', async () => {
    const { tokenId } = await purchaseKey(lock, keyOwner.address)
    const keyManager = await lock.keyManagerOf(tokenId)
    assert.equal(keyManager, ADDRESS_ZERO)
  })

  describe('Key Purchases', () => {
    it('should allow to set KM when buying new keys', async () => {
      const tx = await lock.purchase(
        [],
        [keyOwner.address],
        [ADDRESS_ZERO],
        [keyManager.address],
        [[]],
        {
          value: keyPrice,
        }
      )
      const { events } = await tx.wait()
      const { args } = events.find(({ event }) => event === 'Transfer')
      assert.equal(await lock.keyManagerOf(args.tokenId), keyManager.address)
    })
  })

  describe('Key Renewal / extend', () => {
    let tokenId
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    })

    it('should left key manager untouched when referrer is specified', async () => {
      assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
      assert.equal(await lock.isValidKey(tokenId), true)
      await lock.extend(0, tokenId, keyManager.address, [], {
        value: keyPrice,
      })
      assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
    })

    it('should left untouched when not specified', async () => {
      await lock.connect(keyOwner).setKeyManagerOf(tokenId, keyManager.address)
      assert.equal(await lock.keyManagerOf(tokenId), keyManager.address)
      await lock.extend(0, tokenId, ADDRESS_ZERO, [], {
        value: keyPrice,
      })
      assert.equal(await lock.keyManagerOf(tokenId), keyManager.address)
    })
  })

  describe('Key Transfers', () => {
    let tokenId
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    })
    it('should leave the KM == 0x00(default) when transferring', async () => {
      const tx = await lock
        .connect(keyOwner)
        .transferFrom(keyOwner.address, keyRecipient.address, tokenId)
      const { events } = await tx.wait()
      const { args } = events.find(({ event }) => event === 'Transfer')
      assert.equal(await lock.keyManagerOf(args.tokenId), ADDRESS_ZERO)
    })
  })

  describe('Key Sharing', () => {
    let newTokenId
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))

      // share key creates a new key
      const tx = await lock
        .connect(keyOwner)
        .shareKey(keyRecipient.address, tokenId, oneDay)
      const { events } = await tx.wait()
      ;({
        args: { tokenId: newTokenId },
      } = events.find((v) => v.event === 'Transfer' && v.from !== ADDRESS_ZERO))
    })

    it('should leave the KM == 0x00(default) for new recipients', async () => {
      const newKeyManager = await lock.keyManagerOf(newTokenId)
      assert.equal(newKeyManager, ADDRESS_ZERO)
    })

    /*
    it('should not change KM for existing valid key owners', async () => {
      keyManagerBefore = await lock.keyManagerOf(tokenId)
      await lock.shareKey(keyOwner2, tokenId, oneDay, {
        from: keyOwner,
      })
      tokenId = await lock.getTokenIdFor(keyOwner2)
      keyManager = await lock.keyManagerOf(tokenId)
      assert.equal(keyManagerBefore, keyManager)
    })

    it('should reset the KM to 0x00 for expired key owners', async () => {
      tokenId = await lock.getTokenIdFor(keyOwner)
      assert.notEqual(tokenId, 0)
      let keyManager = await lock.keyManagerOf(tokenId)
      assert.equal(keyManager, ADDRESS_ZERO)
      const owner = await lock.ownerOf(tokenId)
      assert.equal(owner, keyOwner)
      await lock.setKeyManagerOf(tokenId, keyManager.address, { from: keyOwner })
      keyManager = await lock.keyManagerOf(tokenId)
      assert.equal(keyManager, keyManager.address)
      await lock.expireAndRefundFor(keyOwner, 0, { from: lockCreator })
      assert.equal(await lock.getHasValidKey(keyOwner), false)
      tokenId = await lock.getTokenIdFor(keyOwner2)
      await lock.shareKey(keyOwner, tokenId, oneDay, {
        from: keyOwner2,
      })
      tokenId = await lock.getTokenIdFor(keyOwner)
      keyManager = await lock.keyManagerOf(tokenId)
      assert.equal(await lock.getHasValidKey(keyOwner), true)
      assert.equal(keyManager, ADDRESS_ZERO)
    })
    */
  })

  describe('Key Granting', () => {
    it('should let KeyGranter set an arbitrary KM for new keys', async () => {
      const tx = await lock.grantKeys(
        [keyGrantee.address],
        [validExpirationTimestamp],
        [keyManager.address]
      )
      const { events } = await tx.wait()
      const { args } = events.find(({ event }) => event === 'Transfer')
      assert.equal(await lock.keyManagerOf(args.tokenId), keyManager.address)
    })
  })

  describe('configuring the key manager', () => {
    before(async () => {
      lock = await deployLock()
    })
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    })
    it('should allow the current keyManager to set a new KM', async () => {
      assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
      await lock.connect(keyOwner).setKeyManagerOf(tokenId, keyManager.address)
      assert.equal(await lock.keyManagerOf(tokenId), keyManager.address)
    })

    it('should allow a LockManager to set a new KM', async () => {
      assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
      await lock.setKeyManagerOf(tokenId, keyManager.address)
      assert.equal(await lock.keyManagerOf(tokenId), keyManager.address)
    })

    it('should fail to allow anyone else to set a new KM', async () => {
      await reverts(
        lock.connect(keyGrantee).setKeyManagerOf(tokenId, keyManager.address),
        'UNAUTHORIZED_KEY_MANAGER_UPDATE'
      )
    })
  })
})
