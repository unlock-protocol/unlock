const assert = require('assert')
const {
  deployLock,
  ADDRESS_ZERO,
  reverts,
  purchaseKey,
} = require('../../helpers')
const { ethers } = require('hardhat')

let lock
let tokenId
let keyOwner, keyManager, anotherKeyManager

describe('Permissions / KeyManager', () => {
  before(async () => {
    lock = await deployLock()
    ;[, keyOwner, keyManager, anotherKeyManager] = await ethers.getSigners()
  })

  beforeEach(async () => {
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
  })

  it('should have a default KM of 0x00', async () => {
    assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
  })

  describe('setting the key manager', () => {
    it('should allow the key owner to set a new KM', async () => {
      await lock
        .connect(keyOwner)
        .setKeyManagerOf(tokenId, await keyManager.getAddress())
      assert.equal(
        await lock.keyManagerOf(tokenId),
        await keyManager.getAddress()
      )
    })

    it('should allow a keyManager to set another KM', async () => {
      await lock
        .connect(keyOwner)
        .setKeyManagerOf(tokenId, await keyManager.getAddress())
      assert.equal(
        await lock.keyManagerOf(tokenId),
        await keyManager.getAddress()
      )
      await lock
        .connect(keyManager)
        .setKeyManagerOf(tokenId, await anotherKeyManager.getAddress())
      assert.equal(
        await lock.keyManagerOf(tokenId),
        await anotherKeyManager.getAddress()
      )
    })

    it('should allow a LockManager to set a new KM', async () => {
      assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
      await lock.setKeyManagerOf(tokenId, await keyManager.getAddress())
      assert.equal(
        await lock.keyManagerOf(tokenId),
        await keyManager.getAddress()
      )
      assert.notEqual(
        await lock.keyManagerOf(tokenId),
        await anotherKeyManager.getAddress()
      )
    })

    it('should clear any erc721-approvals for expired keys', async () => {
      await lock
        .connect(keyOwner)
        .approve(await anotherKeyManager.getAddress(), tokenId)
      assert.equal(
        await lock.getApproved(tokenId),
        await anotherKeyManager.getAddress()
      )
      await lock.setKeyManagerOf(tokenId, await keyManager.getAddress())
      assert.equal(await lock.getApproved(tokenId), 0)
    })

    it('should fail to allow anyone else to set a new KM', async () => {
      await reverts(
        lock
          .connect(anotherKeyManager)
          .setKeyManagerOf(tokenId, await keyManager.getAddress()),
        'UNAUTHORIZED_KEY_MANAGER_UPDATE'
      )
    })

    it('should disallow owner to set a new KM if a KM is already set', async () => {
      await lock.setKeyManagerOf(tokenId, await keyManager.getAddress())
      await reverts(
        lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, await keyOwner.getAddress()),
        'UNAUTHORIZED_KEY_MANAGER_UPDATE'
      )
    })

    describe('setting the KM to 0x00', () => {
      it('should reset to the default KeyManager of 0x00', async () => {
        await lock.setKeyManagerOf(tokenId, await keyManager.getAddress())
        assert.equal(
          await lock.keyManagerOf(tokenId),
          await keyManager.getAddress()
        )
        await lock.connect(keyManager).setKeyManagerOf(tokenId, ADDRESS_ZERO)
        assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
      })
    })
  })
})
