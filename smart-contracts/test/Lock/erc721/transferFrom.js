const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  deployLock,
  reverts,
  ADDRESS_ZERO,
  purchaseKey,
} = require('../../helpers')

let lock
let lockSingleKey
let tokenId, anotherTokenId
let lockManager,
  keyOwner,
  anotherKeyOwner,
  keyRecipient,
  anotherKeyRecipient,
  keyManager,
  accountApproved,
  approvedAllAccount

describe('Lock / erc721 / transferFrom', () => {
  beforeEach(async () => {
    // init 2 locks
    lock = await deployLock()
    lockSingleKey = await deployLock({ name: 'SINGLE KEY' })

    // disable the transfer fee for this test
    await lock.updateTransferFee(0)
    await lockSingleKey.updateTransferFee(0)

    // fetch signers
    ;[
      lockManager,
      keyOwner,
      anotherKeyOwner,
      keyRecipient,
      anotherKeyRecipient,
      keyManager,
      accountApproved,
      approvedAllAccount,
    ] = await ethers.getSigners()

    // purchase some keys
    ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    ;({ tokenId: anotherTokenId } = await purchaseKey(
      lock,
      anotherKeyOwner.address
    ))
  })

  // / @dev Throws unless `msg.sender` is the current owner, an authorized
  // /  operator, or the approved address for this NFT. Throws if `_from` is
  // /  not the current owner. Throws if `_to` is the zero address. Throws if
  // /  `_tokenId` is not a valid NFT.

  describe('when the lock is public', () => {
    it('should abort when there is no key to transfer', async () => {
      await reverts(
        lock.transferFrom(keyOwner.address, keyRecipient.address, 999),
        'KEY_NOT_VALID'
      )
    })

    it('should abort if token owner (from) is incorrect', async () => {
      await reverts(
        lock
          .connect(keyOwner)
          .transferFrom(keyOwner.address, keyRecipient.address, anotherTokenId),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })

    it('should only allow owner without LM, KM, KM or approved to transfer', async () => {
      await reverts(
        lock
          .connect(keyOwner)
          .transferFrom(
            anotherKeyOwner.address,
            keyRecipient.address,
            anotherTokenId
          ),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })

    it('should prevent transfering an expired key', async () => {
      // Then let's expire the key
      await lock.connect(lockManager).expireAndRefundFor(tokenId, 0)
      await reverts(
        lock
          .connect(keyOwner)
          .transferFrom(keyOwner.address, keyRecipient.address, tokenId),
        'KEY_NOT_VALID'
      )
    })

    describe('when the key owner is the sender', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .transferFrom(keyOwner.address, keyRecipient.address, tokenId)
      })

      it('should transfer ownership correctly', async () => {
        assert.equal(await lock.ownerOf(tokenId), keyRecipient.address)
      })

      it('update balances properly', async () => {
        assert.equal(await lock.balanceOf(keyRecipient.address), 1)
        assert.equal(await lock.balanceOf(keyOwner.address), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(await lock.getHasValidKey(keyRecipient.address), true)
        assert.equal(await lock.getHasValidKey(keyOwner.address), false)
      })
    })

    describe('when the key owner is the sender and a key manager is set', async () => {
      it('should revert if a key manager is set', async () => {
        await lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, keyManager.address)
        await reverts(
          lock
            .connect(keyOwner)
            .transferFrom(keyOwner.address, keyRecipient.address, tokenId),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })
    })

    describe('when the key owner is not the sender', async () => {
      beforeEach(async () => {
        await lock.connect(keyOwner).approve(accountApproved.address, tokenId)
      })

      it('should fail if the sender has not been approved for that key', async () => {
        await reverts(
          lock
            .connect(accountApproved)
            .transferFrom(
              keyOwner.address,
              accountApproved.address,
              anotherTokenId
            ),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })

      it('should succeed if the sender has been approved for that key', async () => {
        await lock
          .connect(accountApproved)
          .transferFrom(keyOwner.address, keyRecipient.address, tokenId)
        assert.equal(await lock.ownerOf(tokenId), keyRecipient.address)
        assert.equal(await lock.balanceOf(keyRecipient.address), 1)
      })

      it('approval should be cleared after a transfer', async () => {
        await lock
          .connect(accountApproved)
          .transferFrom(keyOwner.address, keyRecipient.address, tokenId)
        assert.equal(await lock.getApproved(tokenId), ADDRESS_ZERO)
      })
    })

    describe('when the sender is a key manager', async () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, keyManager.address)
        await lock
          .connect(keyManager)
          .transferFrom(keyOwner.address, anotherKeyRecipient.address, tokenId)
      })
      it('should transfer ownership correctly to the sender', async () => {
        assert.equal(await lock.ownerOf(tokenId), anotherKeyRecipient.address)
      })

      it('update balances properly', async () => {
        assert.equal(await lock.balanceOf(anotherKeyRecipient.address), 1)
        assert.equal(await lock.balanceOf(keyOwner.address), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(
          await lock.getHasValidKey(anotherKeyRecipient.address),
          true
        )
        assert.equal(await lock.getHasValidKey(keyOwner.address), false)
      })
      it('reset the key manager to address zero', async () => {
        assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
      })
    })

    describe('when the sender is a lock manager', async () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, lockManager.address)
        await lock
          .connect(lockManager)
          .transferFrom(keyOwner.address, anotherKeyRecipient.address, tokenId)
      })
      it('should transfer ownership correctly to the sender', async () => {
        assert.equal(await lock.ownerOf(tokenId), anotherKeyRecipient.address)
      })

      it('update balances properly', async () => {
        assert.equal(await lock.balanceOf(anotherKeyRecipient.address), 1)
        assert.equal(await lock.balanceOf(keyOwner.address), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(
          await lock.getHasValidKey(anotherKeyRecipient.address),
          true
        )
        assert.equal(await lock.getHasValidKey(keyOwner.address), false)
      })
      it('reset the key manager to address zero', async () => {
        assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
      })
    })

    describe('when the sender is approved', async () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .setApprovalForAll(approvedAllAccount.address, true)
        assert.equal(
          await lock.isApprovedForAll(
            keyOwner.address,
            approvedAllAccount.address
          ),
          true
        )
      })
      it('should allow the transfer', async () => {
        await lock
          .connect(approvedAllAccount)
          .transferFrom(keyOwner.address, keyRecipient.address, tokenId)
        assert.equal(
          await lock.isApprovedForAll(
            keyOwner.address,
            approvedAllAccount.address
          ),
          true
        )
        await reverts(
          lock
            .connect(approvedAllAccount)
            .transferFrom(
              keyRecipient.address,
              approvedAllAccount.address,
              tokenId
            )
        )
      })
    })

    describe('when the lock is sold out', () => {
      it('should still allow the transfer of keys', async () => {
        // first we create a lock with only 1 key
        const { tokenId } = await purchaseKey(lockSingleKey, keyOwner.address)

        // confirm that the lock is sold out
        await reverts(
          purchaseKey(lockSingleKey, keyOwner.address),
          'LOCK_SOLD_OUT'
        )

        // check ownership
        assert.equal(await lockSingleKey.ownerOf(tokenId), keyOwner.address)

        // transfer
        await lockSingleKey
          .connect(keyOwner)
          .transferFrom(keyOwner.address, keyRecipient.address, tokenId)

        assert.equal(await lockSingleKey.ownerOf(tokenId), keyRecipient.address)
      })
    })
  })

  it('can transfer a FREE key', async () => {
    const lockFree = await deployLock({ name: 'FREE' })
    const tx = await lockFree.purchase(
      [],
      [keyOwner.address],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]]
    )
    const { events } = await tx.wait()
    const { args } = events.find(
      (v) => v.event === 'Transfer' && v.args.from === ADDRESS_ZERO
    )
    const { tokenId: newTokenId } = args

    await lockFree
      .connect(keyOwner)
      .transferFrom(keyOwner.address, keyRecipient.address, newTokenId)
    assert.equal(await lockFree.ownerOf(newTokenId), keyRecipient.address)
  })
})
