const {
  deployLock,
  reverts,
  ADDRESS_ZERO,
  purchaseKeys,
  purchaseKey,
} = require('../../helpers')

let tokenIds
let keyOwners

contract('Lock / erc721 / transferFrom', (accounts) => {
  let lock
  let lockSingleKey
  keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]

  beforeEach(async () => {
    lock = await deployLock()
    lockSingleKey = await deployLock({ name: 'SINGLE KEY' })
    await lock.updateTransferFee(0) // disable the transfer fee for this test
    await lockSingleKey.updateTransferFee(0) // disable the transfer fee for this test
    ;({ tokenIds } = await purchaseKeys(lock, keyOwners.length))
  })

  // / @dev Throws unless `msg.sender` is the current owner, an authorized
  // /  operator, or the approved address for this NFT. Throws if `_from` is
  // /  not the current owner. Throws if `_to` is the zero address. Throws if
  // /  `_tokenId` is not a valid NFT.

  describe('when the lock is public', () => {
    it('should abort when there is no key to transfer', async () => {
      await reverts(
        lock.transferFrom(keyOwners[0], accounts[9], 999),
        'KEY_NOT_VALID'
      )
    })

    it('should abort if the recipient is 0x', async () => {
      await reverts(
        lock.transferFrom(keyOwners[0], ADDRESS_ZERO, tokenIds[0], {
          from: keyOwners[0],
        }),
        'INVALID_ADDRESS'
      )
    })

    it('should abort if token owner (from) is incorrect', async () => {
      await reverts(
        locks.FIRST.transferFrom(keyOwners[0], accounts[9], tokenIds[2], {
          from: keyOwners[0],
        lock.transferFrom(keyOwners[0], accounts[9], tokenIds[2], {
          from: keyOwners[0],
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })

    it('should only allow owner without KM, KM or approved to transfer', async () => {
      await reverts(
        lock.transferFrom(keyOwners[2], accounts[9], tokenIds[2], {
          from: keyOwners[5],
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })

    it('should prevent transfering an expired key', async () => {
      // Then let's expire the key
      await lock.expireAndRefundFor(tokenIds[0], 0, {
        from: accounts[0],
      })
      await reverts(
        lock.transferFrom(keyOwners[1], accounts[7], tokenIds[0], {
          from: keyOwners[1],
        })
      )
    })

    describe('when the key owner is the sender', () => {
      beforeEach(async () => {
        await lock.transferFrom(keyOwners[0], accounts[7], tokenIds[0], {
          from: keyOwners[0],
        })
      })

      it('should transfer ownership correctly', async () => {
        assert.equal(await lock.ownerOf(tokenIds[0]), accounts[7])
      })

      it('update balances properly', async () => {
        assert.equal(await lock.balanceOf(accounts[7]), 1)
        assert.equal(await lock.balanceOf(keyOwners[0]), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(await lock.getHasValidKey(accounts[7]), true)
        assert.equal(await lock.getHasValidKey(keyOwners[0]), false)
      })
    })

    describe('when the key owner is the sender and a key manager is set', async () => {
      it('should revert if a key manager is set', async () => {
        const keyManager = accounts[8]
        await lock.setKeyManagerOf(tokenIds[0], keyManager, {
          from: keyOwners[0],
        })
        await reverts(
          lock.transferFrom(keyOwners[0], accounts[9], tokenIds[0], {
            from: keyManager,
          }),
          'UNAUTHORIZED'
        )
      })
    })

    describe('when the key owner is not the sender', async () => {
      let accountApproved

      beforeEach(async () => {
        accountApproved = accounts[8]
        await lock.approve(accountApproved, tokenIds[0], {
          from: keyOwners[0],
        })
      })

      it('should fail if the sender has not been approved for that key', async () => {
        await reverts(
          lock.transferFrom(keyOwners[0], accountApproved, tokenIds[2], {
            from: accountApproved,
          }),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })

      it('should succeed if the sender has been approved for that key', async () => {
        await lock.transferFrom(keyOwners[0], accounts[9], tokenIds[0], {
          from: accountApproved,
        })
        assert.equal(await lock.ownerOf(tokenIds[0]), accounts[9])
        assert.equal(await lock.balanceOf(accounts[9]), 1)
      })

      it('approval should be cleared after a transfer', async () => {
        await lock.transferFrom(keyOwners[0], accounts[9], tokenIds[0], {
          from: accountApproved,
        })
        assert.equal(await lock.getApproved(tokenIds[0]), ADDRESS_ZERO)
      })
    })

    describe('when the sender is a key manager', async () => {
      let keyManager
      beforeEach(async () => {
        keyManager = accounts[8]
        await lock.setKeyManagerOf(tokenIds[0], keyManager, {
          from: keyOwners[0],
        })
      })
      it('should revert if a key manager is set', async () => {
        await reverts(
          lock.transferFrom(keyOwners[0], accounts[9], tokenIds[0], {
            from: keyManager,
          }),
          'UNAUTHORIZED'
        )
      })
    })

    describe('when the sender is approved', async () => {
      let approved
      beforeEach(async () => {
        approved = accounts[8]
        await lock.setApprovalForAll(approved, true, {
          from: keyOwners[0],
        })
        assert.equal(await lock.isApprovedForAll(keyOwners[0], approved), true)
      })
      it('should allow the transfer', async () => {
        await lock.transferFrom(keyOwners[0], accounts[9], tokenIds[0], {
          from: approved,
        })
        assert.equal(await lock.isApprovedForAll(keyOwners[0], approved), true)
        await reverts(
          lock.transferFrom(accounts[9], approved, tokenIds[0], {
            from: approved,
          })
        )
      })
    })

    describe('when the lock is sold out', () => {
      it('should still allow the transfer of keys', async () => {
        // first we create a lock with only 1 key
        const { tokenId } = await purchaseKey(lockSingleKey, keyOwners[0])

        // confirm that the lock is sold out
        await reverts(purchaseKey(lockSingleKey, keyOwners[0]), 'LOCK_SOLD_OUT')

        // check ownership
        assert.equal(await lockSingleKey.ownerOf(tokenId), keyOwners[0])

        // transfer
        await lockSingleKey.transferFrom(keyOwners[0], accounts[9], tokenId, {
          from: keyOwners[0],
        })

        assert.equal(await lockSingleKey.ownerOf(tokenId), accounts[9])
      })
    })
  })

  it('can transfer a FREE key', async () => {
    const lockFree = await deployLock({ name: 'FREE' })
    const tx = await lockFree.purchase(
      [],
      [accounts[1]],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        from: accounts[1],
      }
    )
    const { args } = tx.logs.find(
      (v) => v.event === 'Transfer' && v.args.from === ADDRESS_ZERO
    )
    const { tokenId: newTokenId } = args

    await lockFree.transferFrom(accounts[1], accounts[2], newTokenId, {
      from: accounts[1],
    })
    assert.equal(await lockFree.ownerOf(newTokenId), accounts[2])
  })
})
