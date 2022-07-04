const { ethers } = require('hardhat')
const { assert } = require('chai')
const { reverts, ADDRESS_ZERO, deployLock, purchaseKey } = require('../helpers')

let lock
let tokenId

let keyOwner, receiver, keyManager, anotherAccount, yetAnotherAccount
let balanceKeyOwnerBefore
let balanceKeyReceiverBefore

describe('Lock / lendKey', () => {
  before(async () => {
    ;[, keyOwner, receiver, keyManager, anotherAccount, yetAnotherAccount] =
      await ethers.getSigners()

    // deploy some locks
    lock = await deployLock()

    await lock.updateTransferFee(0) // disable the lend fee for this test
    await lock.setMaxKeysPerAddress(10)
  })

  describe('failures', () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
    })
    it('should abort when there is no key to lend', async () => {
      await reverts(
        lock.lendKey(keyOwner.address, anotherAccount.address, 999),
        'UNAUTHORIZED'
      )
    })

    it('should abort if the recipient is 0x', async () => {
      await reverts(
        lock.connect(keyOwner).lendKey(keyOwner.address, ADDRESS_ZERO, tokenId),
        'INVALID_ADDRESS'
      )
    })

    it('should only allow key manager or owner', async () => {
      // testing an id mismatch
      await reverts(
        lock
          .connect(anotherAccount)
          .lendKey(keyOwner.address, anotherAccount.address, tokenId),
        'UNAUTHORIZED'
      )

      // testing a mismatched _from address
      await reverts(
        lock
          .connect(keyOwner)
          .lendKey(anotherAccount.address, anotherAccount.address, tokenId),
        'UNAUTHORIZED'
      )
    })

    it('should prevent lending an expired key', async () => {
      // Then let's expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      await reverts(
        lock
          .connect(receiver)
          .lendKey(receiver.address, receiver.address, tokenId)
      )
    })

    it('should fail if the sender has been approved for that key', async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
      await lock.connect(keyOwner).approve(anotherAccount.address, tokenId)

      await reverts(
        lock
          .connect(anotherAccount)
          .lendKey(keyOwner.address, receiver.address, tokenId),
        'UNAUTHORIZED'
      )
    })

    it('should fail if the sender has been approved for all owner keys', async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
      await lock
        .connect(keyOwner)
        .setApprovalForAll(anotherAccount.address, true)

      assert.equal(
        await lock.isApprovedForAll(keyOwner.address, anotherAccount.address),
        true
      )
      await reverts(
        lock
          .connect(anotherAccount)
          .lendKey(keyOwner.address, anotherAccount.address, tokenId),
        'UNAUTHORIZED'
      )
    })
  })

  describe('when the sender is the key owner', () => {
    describe('no key manager is set', () => {
      before(async () => {
        balanceKeyOwnerBefore = await lock.balanceOf(keyOwner.address)
        balanceKeyReceiverBefore = await lock.balanceOf(receiver.address)
        ;({ tokenId } = await purchaseKey(lock, keyOwner))
        await lock
          .connect(keyOwner)
          .lendKey(keyOwner.address, receiver.address, tokenId)
      })

      it('should lend ownership correctly', async () => {
        assert.equal(await lock.ownerOf(tokenId), receiver.address)
      })

      it('update balances properly', async () => {
        assert.equal(
          balanceKeyReceiverBefore
            .add(await lock.balanceOf(receiver.address))
            .toNumber(),
          1
        )
        assert.equal(
          balanceKeyOwnerBefore
            .sub(await lock.balanceOf(keyOwner.address))
            .toNumber(),
          0
        )
      })

      it('should set previous owner as key manager', async () => {
        assert.equal(await lock.keyManagerOf(tokenId), keyOwner.address)
      })
    })

    describe('a key manager is set', () => {
      it('should prevent from lending a key', async () => {
        await lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, keyManager.address)

        await reverts(
          lock
            .connect(keyOwner)
            .lendKey(keyOwner.address, receiver.address, tokenId),
          'UNAUTHORIZED'
        )
      })
    })
  })

  describe('when the sender is a key manager', async () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
      balanceKeyOwnerBefore = await lock.balanceOf(keyOwner.address)
      balanceKeyReceiverBefore = await lock.balanceOf(receiver.address)

      await lock.connect(keyOwner).setKeyManagerOf(tokenId, keyManager.address)
      await lock
        .connect(keyManager)
        .lendKey(keyOwner.address, receiver.address, tokenId)
    })

    it('should lend ownership correctly', async () => {
      assert.equal(await lock.ownerOf(tokenId), receiver.address)
    })

    it('update balances properly', async () => {
      assert.equal(
        (await lock.balanceOf(receiver.address))
          .sub(balanceKeyReceiverBefore)
          .toNumber(),
        1
      )
      assert.equal(
        (await lock.balanceOf(keyOwner.address))
          .sub(balanceKeyOwnerBefore)
          .toNumber(),
        -1
      )
    })

    it('retains the correct key manager', async () => {
      assert.equal(await lock.keyManagerOf(tokenId), keyManager.address)
    })
  })

  describe('when the lock is sold out', () => {
    it('should still allow the lend of keys', async () => {
      const lockSingleKey = await deployLock({ name: 'SINGLE KEY' })
      await lockSingleKey.updateTransferFee(0) // disable the lend fee for this test
      ;({ tokenId } = await purchaseKey(lockSingleKey, keyOwner))

      // confirm that the lock is sold out
      await reverts(purchaseKey(lockSingleKey, anotherAccount), 'LOCK_SOLD_OUT')

      // set default key owner as key manager
      await lockSingleKey
        .connect(keyOwner)
        .setKeyManagerOf(tokenId, keyOwner.address)

      // check ownership
      assert.equal(await lockSingleKey.ownerOf(tokenId), keyOwner.address)

      // lend
      await lockSingleKey
        .connect(keyOwner)
        .lendKey(keyOwner.address, receiver.address, tokenId)

      assert.equal(await lockSingleKey.ownerOf(tokenId), receiver.address)
      assert.equal(await lockSingleKey.keyManagerOf(tokenId), keyOwner.address)
    })
  })

  it('can lend a FREE key', async () => {
    const lockFree = await deployLock({ name: 'FREE' })
    const { tokenId: newTokenId } = await purchaseKey(lockFree, keyOwner)

    await lockFree
      .connect(keyOwner)
      .lendKey(keyOwner.address, receiver.address, newTokenId)

    assert.equal(await lockFree.ownerOf(newTokenId), receiver.address)
    assert.equal(await lockFree.keyManagerOf(newTokenId), keyOwner.address)
  })

  describe('approvals with lent key', () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
      await lock
        .connect(keyOwner)
        .lendKey(keyOwner.address, receiver.address, tokenId)
    })

    it('can not approve another account to lend the key', async () => {
      await reverts(
        lock.connect(receiver).approve(yetAnotherAccount.address, tokenId),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })

    it('can not used an "approved for all" account to transfer the key', async () => {
      await lock
        .connect(receiver)
        .setApprovalForAll(yetAnotherAccount.address, true)

      await reverts(
        lock
          .connect(yetAnotherAccount)
          .transferFrom(receiver.address, yetAnotherAccount.address, tokenId),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
  })

  describe('a lent key', () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))

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
          .lendKey(receiver.address, anotherAccount.address, tokenId),
        'UNAUTHORIZED'
      )
    })
    it('can not be transferred by owner', async () => {
      await reverts(
        lock
          .connect(receiver)
          .transferFrom(receiver.address, anotherAccount.address, tokenId),
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
      const { tokenId: anotherTokenId } = await purchaseKey(lock, keyOwner)
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
