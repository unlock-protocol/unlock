const { ethers } = require('ethers')
const {
  reverts,
  ADDRESS_ZERO,
  deployLock,
  purchaseKeys,
} = require('../helpers')

let lock
let lockFree
let lockSingleKey
let tokenIds
let keyOwners
let accountApproved
let keyManager

contract('Lock / lendKey', (accounts) => {
  const from = accounts[0]
  keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]
  accountApproved = accounts[8]
  keyManager = accounts[9]

  beforeEach(async () => {
    // deploy some locks
    lock = await deployLock()
    lockFree = await deployLock({ name: 'FREE' })
    lockSingleKey = await deployLock({ name: 'SINGLE KEY' })

    await lock.updateTransferFee(0) // disable the lend fee for this test
    await lockSingleKey.updateTransferFee(0) // disable the lend fee for this test
    ;({ tokenIds } = await purchaseKeys(lock, keyOwners.length))
  })

  describe('failures', () => {
    it('should abort when there is no key to lend', async () => {
      await reverts(
        lock.lendKey(keyOwners[0], accounts[9], 999),
        'UNAUTHORIZED'
      )
    })

    it('should only allow key manager or owner', async () => {
      // testing an id mismatch
      await reverts(
        lock.lendKey(keyOwners[0], accounts[9], tokenIds[0], {
          from: keyOwners[5],
        }),
        'UNAUTHORIZED'
      )
      // testing a mismatched _from address
      await reverts(
        lock.lendKey(keyOwners[2], accounts[9], tokenIds[0], {
          from: keyOwners[0],
        }),
        'UNAUTHORIZED'
      )
    })

    it('should prevent lending an expired key', async () => {
      // Then let's expire the key
      await lock.expireAndRefundFor(tokenIds[0], 0, {
        from: accounts[0],
      })
      await reverts(
        lock.lendKey(keyOwners[1], accounts[7], tokenIds[0], {
          from: keyOwners[1],
        })
      )
    })

    it('should fail if the sender has been approved for that key', async () => {
      await lock.approve(accountApproved, tokenIds[0], {
        from: keyOwners[0],
      })
      await reverts(
        lock.lendKey(keyOwners[0], accounts[9], tokenIds[0], {
          from: accountApproved,
        }),
        'UNAUTHORIZED'
      )
    })

    it('should fail if the sender has been approved for all owner keys', async () => {
      await lock.setApprovalForAll(accountApproved, true, {
        from: keyOwners[0],
      })
      assert.equal(
        await lock.isApprovedForAll(keyOwners[0], accountApproved),
        true
      )
      await reverts(
        lock.lendKey(keyOwners[0], accounts[9], tokenIds[0], {
          from: accountApproved,
        }),
        'UNAUTHORIZED'
      )
    })
  })

  describe('when the sender is the key owner', () => {
    describe('no key manager is set', () => {
      beforeEach(async () => {
        await lock.lendKey(keyOwners[0], accounts[7], tokenIds[0], {
          from: keyOwners[0],
        })
      })

      it('should lend ownership correctly', async () => {
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

      it('should set previous owner as key manager', async () => {
        assert.equal(await lock.keyManagerOf(tokenIds[0]), keyOwners[0])
      })
    })

    describe('a key manager is set', () => {
      beforeEach(async () => {
        await lock.setKeyManagerOf(tokenIds[0], keyManager, {
          from: keyOwners[0],
        })
      })

      it('should prevent from lending a key', async () => {
        await reverts(
          lock.lendKey(keyOwners[0], accounts[7], tokenIds[0], {
            from: keyOwners[0],
          }),
          'UNAUTHORIZED'
        )
      })
    })
  })

  describe('when the sender is a key manager', async () => {
    beforeEach(async () => {
      await lock.setKeyManagerOf(tokenIds[0], keyManager, {
        from: keyOwners[0],
      })
      await lock.lendKey(keyOwners[0], accounts[7], tokenIds[0], {
        from: keyManager,
      })
    })

    it('should lend ownership correctly', async () => {
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

    it('retains the correct key manager', async () => {
      assert.equal(await lock.keyManagerOf(tokenIds[0]), keyManager)
    })
  })

  describe('when the lock is sold out', () => {
    it('should still allow the lend of keys', async () => {
      // first we create a lock with only 1 key
      const tx = await lockSingleKey.purchase(
        [],
        [keyOwners[0]],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.utils.parseUnits('0.01', 'ether'),
          from,
        }
      )

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId } = args

      // confirm that the lock is sold out
      await reverts(
        lockSingleKey.purchase(
          [],
          [accounts[8]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: ethers.utils.parseUnits('0.01', 'ether'),
            from: accounts[8],
          }
        ),
        'LOCK_SOLD_OUT'
      )

      // set default key owner as key manager
      await lockSingleKey.setKeyManagerOf(tokenId, accounts[1], {
        from: accounts[1],
      })

      // check ownership
      assert.equal(await lockSingleKey.ownerOf.call(tokenId), keyOwners[0])

      // lend
      await lockSingleKey.lendKey(keyOwners[0], accounts[9], tokenId, {
        from: keyOwners[0],
      })

      assert.equal(await lockSingleKey.ownerOf.call(tokenId), accounts[9])
    })
  })

  it('can lend a FREE key', async () => {
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

    await lockFree.lendKey(accounts[1], accounts[2], newTokenId, {
      from: accounts[1],
    })
    assert.equal(await lockFree.ownerOf(newTokenId), accounts[2])
    assert.equal(await lockFree.keyManagerOf(newTokenId), accounts[1])
  })

  describe('approvals with lent key', () => {
    const approvedUser = accounts[8]
    beforeEach(async () => {
      await lock.lendKey(keyOwners[0], accounts[7], tokenIds[0], {
        from: keyOwners[0],
      })
    })

    it('can not approve another account to lend the key', async () => {
      await reverts(
        lock.approve(approvedUser, tokenIds[0], {
          from: accounts[7],
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })

    it('can not used an "approved for all" account to transfer the key', async () => {
      await lock.setApprovalForAll(approvedUser, true, {
        from: accounts[7],
      })
      await reverts(
        lock.transferFrom(accounts[7], accounts[9], tokenIds[0], {
          from: approvedUser,
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
  })

  describe('a lent key', () => {
    beforeEach(async () => {
      await lock.lendKey(keyOwners[2], accounts[7], tokenIds[2], {
        from: keyOwners[2],
      })
    })
    it('has correct ownership', async () => {
      assert.equal(await lock.ownerOf(tokenIds[2]), accounts[7])
      assert.equal(await lock.keyManagerOf(tokenIds[2]), keyOwners[2])
    })
    it('can not be lent by owner', async () => {
      await reverts(
        lock.lendKey(accounts[7], accounts[8], tokenIds[2], {
          from: accounts[7],
        }),
        'UNAUTHORIZED'
      )
    })
    it('can not be transferred by owner', async () => {
      await reverts(
        lock.transferFrom(accounts[7], accounts[8], tokenIds[2], {
          from: accounts[7],
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
    it('can not be burn by owner', async () => {
      await reverts(
        lock.burn(tokenIds[2], {
          from: accounts[7],
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
    it('can not be merged by owner', async () => {
      await reverts(
        lock.mergeKeys(tokenIds[2], tokenIds[3], 10, {
          from: accounts[7],
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
    it('can not be cancelled by owner', async () => {
      await reverts(
        lock.cancelAndRefund(tokenIds[2], {
          from: accounts[7],
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
  })
})
