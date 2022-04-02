const { constants } = require('hardlydifficult-ethereum-contracts')
const { reverts } = require('truffle-assertions')
const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock
let locks
let tokenIds
let keyOwners

contract('Lock / erc721 / transferFrom', (accounts) => {
  before(async () => {
    unlock = await getProxy(unlockContract)
  })

  const from = accounts[0]
  keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]

  beforeEach(async () => {
    locks = await deployLocks(unlock, accounts[0])
    await locks.FIRST.updateTransferFee(0) // disable the transfer fee for this test
    await locks['SINGLE KEY'].updateTransferFee(0) // disable the transfer fee for this test

    const tx = await locks.FIRST.purchase(
      [],
      keyOwners,
      keyOwners.map(() => web3.utils.padLeft(0, 40)),
      keyOwners.map(() => web3.utils.padLeft(0, 40)),
      keyOwners.map(() => []),
      {
        value: web3.utils.toWei(`${0.01 * keyOwners.length}`, 'ether'),
        from,
      }
    )

    tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
  })

  // / @dev Throws unless `msg.sender` is the current owner, an authorized
  // /  operator, or the approved address for this NFT. Throws if `_from` is
  // /  not the current owner. Throws if `_to` is the zero address. Throws if
  // /  `_tokenId` is not a valid NFT.

  describe('when the lock is public', () => {
    it('should abort when there is no key to transfer', async () => {
      await reverts(
        locks.FIRST.transferFrom(keyOwners[0], accounts[9], 999),
        'KEY_NOT_VALID'
      )
    })

    it('should abort if the recipient is 0x', async () => {
      await reverts(
        locks.FIRST.transferFrom(
          keyOwners[0],
          web3.utils.padLeft(0, 40),
          tokenIds[0],
          {
            from: keyOwners[0],
          }
        ),
        'INVALID_ADDRESS'
      )
    })

    it('should only allow key manager, approved or owner to transfer', async () => {
      // testing an id mismatch
      await reverts(
        locks.FIRST.transferFrom(keyOwners[0], accounts[9], tokenIds[0], {
          from: keyOwners[5],
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
      // testing a mismatched _from address
      await reverts(
        locks.FIRST.transferFrom(keyOwners[2], accounts[9], tokenIds[0], {
          from: keyOwners[0],
        }),
        'TRANSFER_FROM: NOT_KEY_OWNER'
      )
    })

    it('should prevent transfering an expired key', async () => {
      // Then let's expire the key
      await locks.FIRST.expireAndRefundFor(tokenIds[0], 0, {
        from: accounts[0],
      })
      await reverts(
        locks.FIRST.transferFrom(keyOwners[1], accounts[7], tokenIds[0], {
          from: keyOwners[1],
        })
      )
    })

    describe('when the key owner is the sender', () => {
      beforeEach(async () => {
        await locks.FIRST.transferFrom(keyOwners[0], accounts[7], tokenIds[0], {
          from: keyOwners[0],
        })
      })

      it('should transfer ownership correctly', async () => {
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
    })

    describe('when the key owner is not the sender', async () => {
      let accountApproved

      beforeEach(async () => {
        accountApproved = accounts[8]
        await locks.FIRST.approve(accountApproved, tokenIds[0], {
          from: keyOwners[0],
        })
      })

      it('should fail if the sender has not been approved for that key', async () => {
        await reverts(
          locks.FIRST.transferFrom(keyOwners[0], accountApproved, tokenIds[2], {
            from: accountApproved,
          }),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })

      it('should succeed if the sender has been approved for that key', async () => {
        await locks.FIRST.transferFrom(keyOwners[0], accounts[9], tokenIds[0], {
          from: accountApproved,
        })
        assert.equal(await locks.FIRST.ownerOf(tokenIds[0]), accounts[9])
        assert.equal(await locks.FIRST.balanceOf.call(accounts[9]), 1)
      })

      it('approval should be cleared after a transfer', async () => {
        await locks.FIRST.transferFrom(keyOwners[0], accounts[9], tokenIds[0], {
          from: accountApproved,
        })
        assert.equal(
          await locks.FIRST.getApproved(tokenIds[0]),
          constants.ZERO_ADDRESS
        )
      })
    })

    describe('when the sender is a key manager', async () => {
      let keyManager
      beforeEach(async () => {
        keyManager = accounts[8]
        await locks.FIRST.setKeyManagerOf(tokenIds[0], keyManager, {
          from: keyOwners[0],
        })
      })
      it('should reset the key manager', async () => {
        await locks.FIRST.transferFrom(keyOwners[0], accounts[9], tokenIds[0], {
          from: keyManager,
        })
        assert.equal(
          await locks.FIRST.keyManagerOf(tokenIds[0]),
          constants.ZERO_ADDRESS
        )
      })
    })

    describe('when the lock is sold out', () => {
      it('should still allow the transfer of keys', async () => {
        // first we create a lock with only 1 key
        const tx = await locks['SINGLE KEY'].purchase(
          [],
          [keyOwners[0]],
          [web3.utils.padLeft(0, 40)],
          [web3.utils.padLeft(0, 40)],
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
            [web3.utils.padLeft(0, 40)],
            [web3.utils.padLeft(0, 40)],
            [[]],
            {
              value: web3.utils.toWei('0.01', 'ether'),
              from: accounts[8],
            }
          ),
          'LOCK_SOLD_OUT'
        )

        // check ownership
        assert.equal(
          await locks['SINGLE KEY'].ownerOf.call(tokenId),
          keyOwners[0]
        )

        // transfer
        await locks['SINGLE KEY'].transferFrom(
          keyOwners[0],
          accounts[9],
          tokenId,
          {
            from: keyOwners[0],
          }
        )

        assert.equal(
          await locks['SINGLE KEY'].ownerOf.call(tokenId),
          accounts[9]
        )
      })
    })
  })

  it('can transfer a FREE key', async () => {
    const tx = await locks.FREE.purchase(
      [],
      [accounts[1]],
      [web3.utils.padLeft(0, 40)],
      [web3.utils.padLeft(0, 40)],
      [[]],
      {
        from: accounts[1],
      }
    )
    const { args } = tx.logs.find(
      (v) => v.event === 'Transfer' && v.args.from === constants.ZERO_ADDRESS
    )
    const { tokenId: newTokenId } = args

    await locks.FREE.transferFrom(accounts[1], accounts[2], newTokenId, {
      from: accounts[1],
    })
    assert.equal(await locks.FREE.ownerOf(newTokenId), accounts[2])
  })
})
