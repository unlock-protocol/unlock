const assert = require('assert')
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
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    ;({ tokenId: anotherTokenId } = await purchaseKey(
      lock,
      await anotherKeyOwner.getAddress()
    ))
  })

  describe('failures', () => {
    it('should abort when there is no key to lend', async () => {
      await reverts(
        lock.lendKey(
          await keyOwner.getAddress(),
          await random.getAddress(),
          999
        ),
        'UNAUTHORIZED'
      )
    })

    it('should only allow key manager or owner', async () => {
      // testing an id mismatch
      await reverts(
        lock
          .connect(keyOwner)
          .lendKey(
            await keyOwner.getAddress(),
            await random.getAddress(),
            anotherTokenId
          ),
        'UNAUTHORIZED'
      )
      // testing a mismatched _from address
      await reverts(
        lock
          .connect(anotherKeyOwner)
          .lendKey(
            await keyOwner.getAddress(),
            await random.getAddress(),
            tokenId
          ),
        'UNAUTHORIZED'
      )
    })

    it('should prevent lending an expired key', async () => {
      // Then let's expire the key
      await lock.connect(lockManager).expireAndRefundFor(tokenId, 0)
      await reverts(
        lock
          .connect(keyOwner)
          .lendKey(
            await keyOwner.getAddress(),
            await random.getAddress(),
            tokenId
          ),
        'KEY_NOT_VALID'
      )
    })

    it('should fail if the sender has been approved for that key', async () => {
      await lock
        .connect(keyOwner)
        .approve(await accountApproved.getAddress(), tokenId)
      await reverts(
        lock
          .connect(accountApproved)
          .lendKey(
            await keyOwner.getAddress(),
            await random.getAddress(),
            tokenId
          ),
        'UNAUTHORIZED'
      )
    })
  })

  describe('when the sender is the key owner', () => {
    describe('no key manager is set', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .lendKey(
            await keyOwner.getAddress(),
            await random.getAddress(),
            tokenId
          )
      })

      it('should lend ownership correctly', async () => {
        assert.equal(await lock.ownerOf(tokenId), await random.getAddress())
      })

      it('update balances properly', async () => {
        assert.equal(await lock.balanceOf(await random.getAddress()), 1)
        assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(await lock.getHasValidKey(await random.getAddress()), true)
        assert.equal(
          await lock.getHasValidKey(await keyOwner.getAddress()),
          false
        )
      })

      it('should set previous owner as key manager', async () => {
        assert.equal(
          await lock.keyManagerOf(tokenId),
          await keyOwner.getAddress()
        )
      })
    })

    describe('a key manager is set', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, await keyManager.getAddress())
      })

      it('should prevent from lending a key', async () => {
        await reverts(
          lock
            .connect(keyOwner)
            .lendKey(
              await keyOwner.getAddress(),
              await random.getAddress(),
              tokenId
            ),
          'UNAUTHORIZED'
        )
      })
    })
  })

  describe('when the sender is a key manager', async () => {
    beforeEach(async () => {
      await lock
        .connect(keyOwner)
        .setKeyManagerOf(tokenId, await keyManager.getAddress())
      await lock
        .connect(keyManager)
        .lendKey(
          await keyOwner.getAddress(),
          await random.getAddress(),
          tokenId
        )
    })

    it('should lend ownership correctly', async () => {
      assert.equal(await lock.ownerOf(tokenId), await random.getAddress())
    })

    it('update balances properly', async () => {
      assert.equal(await lock.balanceOf(await random.getAddress()), 1)
      assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 0)
    })

    it('update key validity properly', async () => {
      assert.equal(await lock.getHasValidKey(await random.getAddress()), true)
      assert.equal(
        await lock.getHasValidKey(await keyOwner.getAddress()),
        false
      )
    })

    it('retains the correct key manager', async () => {
      assert.equal(
        await lock.keyManagerOf(tokenId),
        await keyManager.getAddress()
      )
    })
  })

  describe('when the lock is sold out', () => {
    it('should still allow the lend of keys', async () => {
      // first we create a lock with only 1 key
      const lockSingleKey = await deployLock({ name: 'SINGLE KEY' })
      const { tokenId: singleTokenId } = await purchaseKey(
        lockSingleKey,
        await keyOwner.getAddress()
      )

      // confirm that the lock is sold out
      await reverts(
        purchaseKey(lockSingleKey, await random.getAddress()),
        'LOCK_SOLD_OUT'
      )

      // check ownership
      assert.equal(
        await lockSingleKey.ownerOf(singleTokenId),
        await keyOwner.getAddress()
      )

      // lend
      await lockSingleKey
        .connect(keyOwner)
        .lendKey(
          await keyOwner.getAddress(),
          await random.getAddress(),
          singleTokenId
        )

      assert.equal(
        await lockSingleKey.ownerOf(singleTokenId),
        await random.getAddress()
      )
    })
  })

  it('can lend a FREE key', async () => {
    const lockFree = await deployLock({ name: 'FREE' })
    const { tokenId: freeTokenId } = await purchaseKey(
      lockFree,
      await keyOwner.getAddress()
    )

    await lockFree
      .connect(keyOwner)
      .lendKey(
        await keyOwner.getAddress(),
        await receiver.getAddress(),
        freeTokenId
      )

    assert.equal(
      await lockFree.ownerOf(freeTokenId),
      await receiver.getAddress()
    )
    assert.equal(
      await lockFree.keyManagerOf(freeTokenId),
      await keyOwner.getAddress()
    )
  })

  describe('approvals with lent key', () => {
    beforeEach(async () => {
      await lock
        .connect(keyOwner)
        .lendKey(
          await keyOwner.getAddress(),
          await receiver.getAddress(),
          tokenId
        )
    })

    it('can not approve another account to lend the key', async () => {
      await reverts(
        lock
          .connect(receiver)
          .approve(await accountApproved.getAddress(), tokenId),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
  })

  describe('a lent key', () => {
    beforeEach(async () => {
      ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
      await lock
        .connect(keyOwner)
        .lendKey(
          await keyOwner.getAddress(),
          await receiver.getAddress(),
          tokenId
        )
    })
    it('has correct ownership', async () => {
      assert.equal(await lock.ownerOf(tokenId), await receiver.getAddress())
      assert.equal(
        await lock.keyManagerOf(tokenId),
        await keyOwner.getAddress()
      )
    })
    it('can not be lent by owner', async () => {
      await reverts(
        lock
          .connect(receiver)
          .lendKey(
            await receiver.getAddress(),
            await random.getAddress(),
            tokenId
          ),
        'UNAUTHORIZED'
      )
    })
    it('can not be transferred by owner', async () => {
      await reverts(
        lock
          .connect(receiver)
          .transferFrom(
            await receiver.getAddress(),
            await random.getAddress(),
            tokenId
          ),
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
