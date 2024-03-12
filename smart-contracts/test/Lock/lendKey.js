const { assert } = require('chai')
const { ethers } = require('hardhat')
const { reverts, deployLock, purchaseKey } = require('../helpers')

let lock
let tokenId, anotherTokenId
let lockManager,
  keyOwner,
  anotherKeyOwner,
  accountApproved,
  keyManager,
  receiver,
  random

describe('Lock / lendKey', () => {
  beforeEach(async () => {
    ;[
      lockManager,
      keyOwner,
      anotherKeyOwner,
      accountApproved,
      keyManager,
      receiver,
      random,
    ] = await ethers.getSigners()
    lock = await deployLock()
    await lock.updateTransferFee(0) // disable the lend fee for this test
    ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    ;({ tokenId: anotherTokenId } = await purchaseKey(
      lock,
      anotherKeyOwner.address
    ))
  })

  describe('failures', () => {
    it('should abort when there is no key to lend', async () => {
      await reverts(
        lock.lendKey(keyOwner.address, random.address, 999),
        'UNAUTHORIZED'
      )
    })

    it('should only allow key manager or owner', async () => {
      // testing an id mismatch
      await reverts(
        lock
          .connect(keyOwner)
          .lendKey(keyOwner.address, random.address, anotherTokenId),
        'UNAUTHORIZED'
      )
      // testing a mismatched _from address
      await reverts(
        lock
          .connect(anotherKeyOwner)
          .lendKey(keyOwner.address, random.address, tokenId),
        'UNAUTHORIZED'
      )
    })

    it('should prevent lending an expired key', async () => {
      // Then let's expire the key
      await lock.connect(lockManager).expireAndRefundFor(tokenId, 0)
      await reverts(
        lock
          .connect(keyOwner)
          .lendKey(keyOwner.address, random.address, tokenId),
        'KEY_NOT_VALID'
      )
    })

    it('should fail if the sender has been approved for that key', async () => {
      await lock.connect(keyOwner).approve(accountApproved.address, tokenId)
      await reverts(
        lock
          .connect(accountApproved)
          .lendKey(keyOwner.address, random.address, tokenId),
        'UNAUTHORIZED'
      )
    })

    it('should fail if the sender has been approved for all owner keys', async () => {
      await lock
        .connect(keyOwner)
        .setApprovalForAll(accountApproved.address, true)
      assert.equal(
        await lock.isApprovedForAll(keyOwner.address, accountApproved.address),
        true
      )
      await reverts(
        lock
          .connect(accountApproved)
          .lendKey(keyOwner.address, random.address, tokenId),
        'UNAUTHORIZED'
      )
    })
  })

  describe('when the sender is the key owner', () => {
    describe('no key manager is set', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .lendKey(keyOwner.address, random.address, tokenId)
      })

      it('should lend ownership correctly', async () => {
        assert.equal(await lock.ownerOf(tokenId), random.address)
      })

      it('update balances properly', async () => {
        assert.equal(await lock.balanceOf(random.address), 1)
        assert.equal(await lock.balanceOf(keyOwner.address), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(await lock.getHasValidKey(random.address), true)
        assert.equal(await lock.getHasValidKey(keyOwner.address), false)
      })

      it('should set previous owner as key manager', async () => {
        assert.equal(await lock.keyManagerOf(tokenId), keyOwner.address)
      })
    })

    describe('a key manager is set', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, keyManager.address)
      })

      it('should prevent from lending a key', async () => {
        await reverts(
          lock
            .connect(keyOwner)
            .lendKey(keyOwner.address, random.address, tokenId),
          'UNAUTHORIZED'
        )
      })
    })
  })

  describe('when the sender is a key manager', async () => {
    beforeEach(async () => {
      await lock.connect(keyOwner).setKeyManagerOf(tokenId, keyManager.address)
      await lock
        .connect(keyManager)
        .lendKey(keyOwner.address, random.address, tokenId)
    })

    it('should lend ownership correctly', async () => {
      assert.equal(await lock.ownerOf(tokenId), random.address)
    })

    it('update balances properly', async () => {
      assert.equal(await lock.balanceOf(random.address), 1)
      assert.equal(await lock.balanceOf(keyOwner.address), 0)
    })

    it('update key validity properly', async () => {
      assert.equal(await lock.getHasValidKey(random.address), true)
      assert.equal(await lock.getHasValidKey(keyOwner.address), false)
    })

    it('retains the correct key manager', async () => {
      assert.equal(await lock.keyManagerOf(tokenId), keyManager.address)
    })
  })

  describe('when the lock is sold out', () => {
    it('should still allow the lend of keys', async () => {
      // first we create a lock with only 1 key
      const lockSingleKey = await deployLock({ name: 'SINGLE KEY' })
      const { tokenId: singleTokenId } = await purchaseKey(
        lockSingleKey,
        keyOwner.address
      )

      // confirm that the lock is sold out
      await reverts(purchaseKey(lockSingleKey, random.address), 'LOCK_SOLD_OUT')

      // check ownership
      assert.equal(await lockSingleKey.ownerOf(singleTokenId), keyOwner.address)

      // lend
      await lockSingleKey
        .connect(keyOwner)
        .lendKey(keyOwner.address, random.address, singleTokenId)

      assert.equal(await lockSingleKey.ownerOf(singleTokenId), random.address)
    })
  })

  it('can lend a FREE key', async () => {
    const lockFree = await deployLock({ name: 'FREE' })
    const { tokenId: freeTokenId } = await purchaseKey(
      lockFree,
      keyOwner.address
    )

    await lockFree
      .connect(keyOwner)
      .lendKey(keyOwner.address, receiver.address, freeTokenId)

    assert.equal(await lockFree.ownerOf(freeTokenId), receiver.address)
    assert.equal(await lockFree.keyManagerOf(freeTokenId), keyOwner.address)
  })

  describe('approvals with lent key', () => {
    beforeEach(async () => {
      await lock
        .connect(keyOwner)
        .lendKey(keyOwner.address, receiver.address, tokenId)
    })

    it('can not approve another account to lend the key', async () => {
      await reverts(
        lock.connect(receiver).approve(accountApproved.address, tokenId),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })

    it('can not used an "approved for all" account to transfer the key', async () => {
      await lock
        .connect(receiver)
        .setApprovalForAll(accountApproved.address, true)
      await reverts(
        lock
          .connect(receiver)
          .transferFrom(receiver.address, random.address, tokenId),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
  })

  describe('a lent key', () => {
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
      await lock
        .connect(keyOwner)
        .lendKey(keyOwner.address, receiver.address, tokenId)
    })
    it('has correct ownership', async () => {
      assert.equal(await lock.ownerOf(tokenId), receiver.address)
      assert.equal(await lock.keyManagerOf(tokenId), keyOwner.address)
    })
    it('can not be lent by owner', async () => {
      await reverts(
        lock
          .connect(receiver)
          .lendKey(receiver.address, random.address, tokenId),
        'UNAUTHORIZED'
      )
    })
    it('can not be transferred by owner', async () => {
      await reverts(
        lock
          .connect(receiver)
          .transferFrom(receiver.address, random.address, tokenId),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
    it('can not be burn by owner', async () => {
      await reverts(
        lock.connect(receiver).burn(tokenId),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
    it('can not be merged by owner', async () => {
      await reverts(
        lock.connect(receiver).mergeKeys(tokenId, anotherTokenId, 10),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
    it('can not be cancelled by owner', async () => {
      await reverts(
        lock.connect(receiver).cancelAndRefund(tokenId),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
  })
})
