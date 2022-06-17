const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../helpers/constants')
const getContractInstance = require('../helpers/truffle-artifacts')
const unlockContract = artifacts.require('Unlock.sol')

let unlock
let locks
let tokenIds
let keyOwners
let accountApproved
let keyManager

contract('Lock / lendKey', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
  })

  const from = accounts[0]
  keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]
  accountApproved = accounts[8]
  keyManager = accounts[9]

  beforeEach(async () => {
    locks = await deployLocks(unlock, accounts[0])
    await locks.FIRST.updateTransferFee(0) // disable the lend fee for this test
    await locks['SINGLE KEY'].updateTransferFee(0) // disable the lend fee for this test

    const tx = await locks.FIRST.purchase(
      [],
      keyOwners,
      keyOwners.map(() => ADDRESS_ZERO),
      keyOwners.map(() => ADDRESS_ZERO),
      keyOwners.map(() => []),
      {
        value: web3.utils.toWei(`${0.01 * keyOwners.length}`, 'ether'),
        from,
      }
    )

    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)

    // set default key owner as key manager
    await locks.FIRST.setKeyManagerOf(tokenIds[0], keyOwners[0], {
      from: keyOwners[0],
    })
  })

  describe('when the lock is public', () => {
    describe('failures', () => {
      it('should abort when there is no key to lend', async () => {
        await reverts(
          locks.FIRST.lendKey(keyOwners[0], accounts[9], 999),
          'KEY_NOT_VALID'
        )
      })

      it('should abort if the recipient is 0x', async () => {
        await reverts(
          locks.FIRST.lendKey(keyOwners[0], ADDRESS_ZERO, tokenIds[0], {
            from: keyOwners[0],
          }),
          'INVALID_ADDRESS'
        )
      })

      it('should only allow key manager or owner', async () => {
        // testing an id mismatch
        await reverts(
          locks.FIRST.lendKey(keyOwners[0], accounts[9], tokenIds[0], {
            from: keyOwners[5],
          }),
          'UNAUTHORIZED'
        )
        // testing a mismatched _from address
        await reverts(
          locks.FIRST.lendKey(keyOwners[2], accounts[9], tokenIds[0], {
            from: keyOwners[0],
          }),
          'UNAUTHORIZED'
        )
      })

      it('should prevent lending an expired key', async () => {
        // Then let's expire the key
        await locks.FIRST.expireAndRefundFor(tokenIds[0], 0, {
          from: accounts[0],
        })
        await reverts(
          locks.FIRST.lendKey(keyOwners[1], accounts[7], tokenIds[0], {
            from: keyOwners[1],
          })
        )
      })

      it('should fail if the sender has been approved for that key', async () => {
        await locks.FIRST.approve(accountApproved, tokenIds[0], {
          from: keyOwners[0],
        })
        await reverts(
          locks.FIRST.lendKey(keyOwners[0], accounts[9], tokenIds[0], {
            from: accountApproved,
          }),
          'UNAUTHORIZED'
        )
      })

      it('should fail if the sender has been approved for all owner keys', async () => {
        await locks.FIRST.setApprovalForAll(accountApproved, true, {
          from: keyOwners[0],
        })
        assert.equal(
          await locks.FIRST.isApprovedForAll(keyOwners[0], accountApproved),
          true
        )
        await reverts(
          locks.FIRST.lendKey(keyOwners[0], accounts[9], tokenIds[0], {
            from: accountApproved,
          }),
          'UNAUTHORIZED'
        )
      })
    })

    describe('when the sender is the key owner', () => {
      describe('no key manager is set', () => {
        beforeEach(async () => {
          await locks.FIRST.lendKey(keyOwners[0], accounts[7], tokenIds[0], {
            from: keyOwners[0],
          })
        })

        it('should lend ownership correctly', async () => {
          assert.equal(await locks.FIRST.ownerOf(tokenIds[0]), accounts[7])
        })

        it('update balances properly', async () => {
          assert.equal(await locks.FIRST.balanceOf(accounts[7]), 1)
          assert.equal(await locks.FIRST.balanceOf(keyOwners[0]), 0)
        })

        it('update key validity properly', async () => {
          assert.equal(await locks.FIRST.getHasValidKey(accounts[7]), true)
          assert.equal(await locks.FIRST.getHasValidKey(keyOwners[0]), false)
        })

        it('should set previous owner as key manager', async () => {
          assert.equal(
            await locks.FIRST.keyManagerOf(tokenIds[0]),
            keyOwners[0]
          )
        })
      })

      describe('a key manager is set', () => {
        beforeEach(async () => {
          await locks.FIRST.setKeyManagerOf(tokenIds[0], keyManager, {
            from: keyOwners[0],
          })
          await locks.FIRST.lendKey(keyOwners[0], accounts[7], tokenIds[0], {
            from: keyOwners[0],
          })
        })

        it('should lend ownership correctly', async () => {
          assert.equal(await locks.FIRST.ownerOf(tokenIds[0]), accounts[7])
        })

        it('update balances properly', async () => {
          assert.equal(await locks.FIRST.balanceOf(accounts[7]), 1)
          assert.equal(await locks.FIRST.balanceOf(keyOwners[0]), 0)
        })

        it('update key validity properly', async () => {
          assert.equal(await locks.FIRST.getHasValidKey(accounts[7]), true)
          assert.equal(await locks.FIRST.getHasValidKey(keyOwners[0]), false)
        })

        it('retains the correct key manager', async () => {
          assert.equal(await locks.FIRST.keyManagerOf(tokenIds[0]), keyManager)
        })
      })
    })

    describe('when the sender is a key manager', async () => {
      beforeEach(async () => {
        await locks.FIRST.setKeyManagerOf(tokenIds[0], keyManager, {
          from: keyOwners[0],
        })
        await locks.FIRST.lendKey(keyOwners[0], accounts[7], tokenIds[0], {
          from: keyManager,
        })
      })

      it('should lend ownership correctly', async () => {
        assert.equal(await locks.FIRST.ownerOf(tokenIds[0]), accounts[7])
      })

      it('update balances properly', async () => {
        assert.equal(await locks.FIRST.balanceOf(accounts[7]), 1)
        assert.equal(await locks.FIRST.balanceOf(keyOwners[0]), 0)
      })

      it('update key validity properly', async () => {
        assert.equal(await locks.FIRST.getHasValidKey(accounts[7]), true)
        assert.equal(await locks.FIRST.getHasValidKey(keyOwners[0]), false)
      })

      it('retains the correct key manager', async () => {
        assert.equal(await locks.FIRST.keyManagerOf(tokenIds[0]), keyManager)
      })
    })

    describe('when the lock is sold out', () => {
      it('should still allow the lend of keys', async () => {
        // first we create a lock with only 1 key
        const tx = await locks['SINGLE KEY'].purchase(
          [],
          [keyOwners[0]],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: web3.utils.toWei('0.01', 'ether'),
            from,
          }
        )

        const { args } = tx.logs.find((v) => v.event === 'Transfer')
        const { tokenId } = args

        // confirm that the lock is sold out
        await reverts(
          locks['SINGLE KEY'].purchase(
            [],
            [accounts[8]],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]],
            {
              value: web3.utils.toWei('0.01', 'ether'),
              from: accounts[8],
            }
          ),
          'LOCK_SOLD_OUT'
        )

        // set default key owner as key manager
        await locks['SINGLE KEY'].setKeyManagerOf(tokenId, accounts[1], {
          from: accounts[1],
        })

        // check ownership
        assert.equal(
          await locks['SINGLE KEY'].ownerOf.call(tokenId),
          keyOwners[0]
        )

        // lend
        await locks['SINGLE KEY'].lendKey(keyOwners[0], accounts[9], tokenId, {
          from: keyOwners[0],
        })

        assert.equal(
          await locks['SINGLE KEY'].ownerOf.call(tokenId),
          accounts[9]
        )
      })
    })
  })

  it('can lend a FREE key', async () => {
    const tx = await locks.FREE.purchase(
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

    // set default key owner as key manager
    await locks.FREE.setKeyManagerOf(newTokenId, accounts[1], {
      from: accounts[1],
    })

    await locks.FREE.lendKey(accounts[1], accounts[2], newTokenId, {
      from: accounts[1],
    })
    assert.equal(await locks.FREE.ownerOf(newTokenId), accounts[2])
  })
})
