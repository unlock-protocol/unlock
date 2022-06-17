const deployLocks = require('../../helpers/deployLocks')
const { purchaseKey, reverts } = require('../../helpers')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../../helpers/truffle-artifacts')

let unlock
let lock
let tokenId

contract('Lock / erc721 / approveForAll', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.updateTransferFee(0) // disable the transfer fee for this test
  })

  let keyOwner = accounts[1]
  let approvedUser = accounts[2]

  describe('when the key exists', () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
    })

    it('isApprovedForAll defaults to false', async () => {
      assert.equal(await lock.isApprovedForAll(keyOwner, approvedUser), false)
    })

    describe('when the sender is self approving', () => {
      it('should fail', async () => {
        await reverts(
          lock.setApprovalForAll(keyOwner, true, {
            from: keyOwner,
          }),
          'APPROVE_SELF'
        )
      })
    })

    describe('when the approval succeeds', () => {
      let event
      before(async () => {
        let result = await lock.setApprovalForAll(approvedUser, true, {
          from: keyOwner,
        })
        event = result.logs[0]
      })

      it('isApprovedForAll is true', async () => {
        assert.equal(await lock.isApprovedForAll(keyOwner, approvedUser), true)
      })

      it('should trigger the ApprovalForAll event', () => {
        assert.equal(event.event, 'ApprovalForAll')
        assert.equal(event.args.owner, keyOwner)
        assert.equal(event.args.operator, approvedUser)
        assert.equal(event.args.approved, true)
      })

      it('an authorized operator may set the approved address for an NFT', async () => {
        let newApprovedUser = accounts[8]

        await lock.approve(newApprovedUser, tokenId, {
          from: approvedUser,
        })

        assert.equal(await lock.getApproved(tokenId), newApprovedUser)
      })

      it('should allow the approved user to transferFrom', async () => {
        await lock.transferFrom(keyOwner, accounts[3], tokenId, {
          from: approvedUser,
        })

        // Transfer it back to the original keyOwner for other tests
        await lock.transferFrom(accounts[3], keyOwner, tokenId, {
          from: accounts[3],
        })
      })

      it('isApprovedForAll is still true (not lost after transfer)', async () => {
        assert.equal(await lock.isApprovedForAll(keyOwner, approvedUser), true)
      })

      describe('allows for multiple operators per keyOwner', () => {
        let newApprovedUser = accounts[8]

        before(async () => {
          await lock.setApprovalForAll(newApprovedUser, true, {
            from: keyOwner,
          })
        })

        it('new operator is approved', async () => {
          assert.equal(
            await lock.isApprovedForAll(keyOwner, newApprovedUser),
            true
          )
        })

        it('original operator is still approved', async () => {
          assert.equal(await lock.isApprovedForAll(keyOwner, approvedUser), true)
        })
      })
    })

    describe('can cancel an outstanding approval', () => {
      let event

      before(async () => {
        await lock.setApprovalForAll(approvedUser, true, {
          from: keyOwner,
        })
        let result = await lock.setApprovalForAll(approvedUser, false, {
          from: keyOwner,
        })
        event = result.logs[0]
      })

      it('isApprovedForAll is false again', async () => {
        assert.equal(await lock.isApprovedForAll(keyOwner, approvedUser), false)
      })

      it('This emits when an operator is (enabled or) disabled for an owner.', async () => {
        assert.equal(event.event, 'ApprovalForAll')
        assert.equal(event.args.owner, keyOwner)
        assert.equal(event.args.operator, approvedUser)
        assert.equal(event.args.approved, false)
      })
    })
  })

  describe('when the owner does not have a key', () => {
    let ownerWithoutAKey = accounts[7]

    it('owner has no keys', async () => {
      assert.equal(await lock.balanceOf(ownerWithoutAKey), 0)
    })

    describe('allows the owner to call approveForAll', () => {
      before(async () => {
        await lock.setApprovalForAll(approvedUser, true, {
          from: ownerWithoutAKey,
        })
      })

      it('operator is approved', async () => {
        assert.equal(
          await lock.isApprovedForAll(ownerWithoutAKey, approvedUser),
          true
        )
      })
    })
  })
})
