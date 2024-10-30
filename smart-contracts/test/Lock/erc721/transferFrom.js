const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployLock,
  reverts,
  ADDRESS_ZERO,
  purchaseKey,
} = require('../../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

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
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    ;({ tokenId: anotherTokenId } = await purchaseKey(
      lock,
      await anotherKeyOwner.getAddress()
    ))
  })

  // / @dev Throws unless `msg.sender` is the current owner, an authorized
  // /  operator, or the approved address for this NFT Throws if `_from` is
  // /  not the current owner Throws if `_to` is the zero address Throws if
  // /  `_tokenId` is not a valid NFT.

  describe('when the lock is public', () => {
    it('should abort when there is no key to transfer', async () => {
      await reverts(
        lock.transferFrom(
          await keyOwner.getAddress(),
          await keyRecipient.getAddress(),
          999
        ),
        'KEY_NOT_VALID'
      )
    })

    it('should abort if token owner (from) is incorrect', async () => {
      await reverts(
        lock
          .connect(keyOwner)
          .transferFrom(
            await keyOwner.getAddress(),
            await keyRecipient.getAddress(),
            anotherTokenId
          ),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })

    it('should only allow owner without LM, KM, KM or approved to transfer', async () => {
      await reverts(
        lock
          .connect(keyOwner)
          .transferFrom(
            await anotherKeyOwner.getAddress(),
            await keyRecipient.getAddress(),
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
          .transferFrom(
            await keyOwner.getAddress(),
            await keyRecipient.getAddress(),
            tokenId
          ),
        'KEY_NOT_VALID'
      )
    })

    describe('when the key owner is the sender', () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .transferFrom(
            await keyOwner.getAddress(),
            await keyRecipient.getAddress(),
            tokenId
          )
      })

      it('should transfer ownership correctly', async () => {
        assert.equal(
          await lock.ownerOf(tokenId),
          await keyRecipient.getAddress()
        )
      })

      it('update balances properly', async () => {
        assert.equal(await lock.balanceOf(await keyRecipient.getAddress()), 1)
        assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(
          await lock.getHasValidKey(await keyRecipient.getAddress()),
          true
        )
        assert.equal(
          await lock.getHasValidKey(await keyOwner.getAddress()),
          false
        )
      })
    })

    describe('when the key owner is the sender and a key manager is set', async () => {
      it('should revert if a key manager is set', async () => {
        await lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, await keyManager.getAddress())
        await reverts(
          lock
            .connect(keyOwner)
            .transferFrom(
              await keyOwner.getAddress(),
              await keyRecipient.getAddress(),
              tokenId
            ),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })
    })

    describe('when the key owner is not the sender', async () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .approve(await accountApproved.getAddress(), tokenId)
      })

      it('should fail if the sender has not been approved for that key', async () => {
        await reverts(
          lock
            .connect(accountApproved)
            .transferFrom(
              await keyOwner.getAddress(),
              await accountApproved.getAddress(),
              anotherTokenId
            ),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })

      it('should succeed if the sender has been approved for that key', async () => {
        await lock
          .connect(accountApproved)
          .transferFrom(
            await keyOwner.getAddress(),
            await keyRecipient.getAddress(),
            tokenId
          )
        assert.equal(
          await lock.ownerOf(tokenId),
          await keyRecipient.getAddress()
        )
        assert.equal(await lock.balanceOf(await keyRecipient.getAddress()), 1)
      })

      it('approval should be cleared after a transfer', async () => {
        await lock
          .connect(accountApproved)
          .transferFrom(
            await keyOwner.getAddress(),
            await keyRecipient.getAddress(),
            tokenId
          )
        assert.equal(await lock.getApproved(tokenId), ADDRESS_ZERO)
      })
    })

    describe('when the sender is a key manager', async () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, await keyManager.getAddress())
        await lock
          .connect(keyManager)
          .transferFrom(
            await keyOwner.getAddress(),
            await anotherKeyRecipient.getAddress(),
            tokenId
          )
      })
      it('should transfer ownership correctly to the sender', async () => {
        assert.equal(
          await lock.ownerOf(tokenId),
          await anotherKeyRecipient.getAddress()
        )
      })

      it('update balances properly', async () => {
        assert.equal(
          await lock.balanceOf(await anotherKeyRecipient.getAddress()),
          1
        )
        assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(
          await lock.getHasValidKey(await anotherKeyRecipient.getAddress()),
          true
        )
        assert.equal(
          await lock.getHasValidKey(await keyOwner.getAddress()),
          false
        )
      })
      it('reset the key manager to address zero', async () => {
        assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
      })
    })

    describe('when the sender is a lock manager', async () => {
      beforeEach(async () => {
        await lock
          .connect(keyOwner)
          .setKeyManagerOf(tokenId, await lockManager.getAddress())
        await lock
          .connect(lockManager)
          .transferFrom(
            await keyOwner.getAddress(),
            await anotherKeyRecipient.getAddress(),
            tokenId
          )
      })
      it('should transfer ownership correctly to the sender', async () => {
        assert.equal(
          await lock.ownerOf(tokenId),
          await anotherKeyRecipient.getAddress()
        )
      })

      it('update balances properly', async () => {
        assert.equal(
          await lock.balanceOf(await anotherKeyRecipient.getAddress()),
          1
        )
        assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(
          await lock.getHasValidKey(await anotherKeyRecipient.getAddress()),
          true
        )
        assert.equal(
          await lock.getHasValidKey(await keyOwner.getAddress()),
          false
        )
      })
      it('reset the key manager to address zero', async () => {
        assert.equal(await lock.keyManagerOf(tokenId), ADDRESS_ZERO)
      })
    })

    describe('when the lock is sold out', () => {
      it('should still allow the transfer of keys', async () => {
        // first we create a lock with only 1 key
        const { tokenId } = await purchaseKey(
          lockSingleKey,
          await keyOwner.getAddress()
        )

        // confirm that the lock is sold out
        await reverts(
          purchaseKey(lockSingleKey, await keyOwner.getAddress()),
          'LOCK_SOLD_OUT'
        )

        // check ownership
        assert.equal(
          await lockSingleKey.ownerOf(tokenId),
          await keyOwner.getAddress()
        )

        // transfer
        await lockSingleKey
          .connect(keyOwner)
          .transferFrom(
            await keyOwner.getAddress(),
            await keyRecipient.getAddress(),
            tokenId
          )

        assert.equal(
          await lockSingleKey.ownerOf(tokenId),
          await keyRecipient.getAddress()
        )
      })
    })
  })

  it('can transfer a FREE key', async () => {
    const lockFree = await deployLock({ name: 'FREE' })
    const tx = await lockFree.purchase(
      [],
      [await keyOwner.getAddress()],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      ['0x']
    )
    const receipt = await tx.wait()
    const { args } = await getEvent(receipt, 'Transfer')
    const { tokenId: newTokenId } = args

    await lockFree
      .connect(keyOwner)
      .transferFrom(
        await keyOwner.getAddress(),
        await keyRecipient.getAddress(),
        newTokenId
      )
    assert.equal(
      await lockFree.ownerOf(newTokenId),
      await keyRecipient.getAddress()
    )
  })
})
