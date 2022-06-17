const { reverts } = require('../../helpers/errors')
const deployLocks = require('../../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../../helpers/constants')

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

  let owner = accounts[1]
  let approvedUser = accounts[2]

  describe('when the key exists', () => {
    before(async () => {
      const tx = await lock.purchase(
        [],
        [owner],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: web3.utils.toWei('0.01', 'ether'),
          from: owner,
        }
      )
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      tokenId = args.tokenId
    })

    it('isApprovedForAll defaults to false', async () => {
      assert.equal(await lock.isApprovedForAll(owner, approvedUser), false)
    })

    describe('when the sender is self approving', () => {
      it('should fail', async () => {
        await reverts(
          lock.setApprovalForAll(owner, true, {
            from: owner,
          }),
          'APPROVE_SELF'
        )
      })
    })

    describe('when the approval succeeds', () => {
      let event
      before(async () => {
        let result = await lock.setApprovalForAll(approvedUser, true, {
          from: owner,
        })
        event = result.logs[0]
      })

      it('isApprovedForAll is true', async () => {
        assert.equal(await lock.isApprovedForAll(owner, approvedUser), true)
      })

      it('should trigger the ApprovalForAll event', () => {
        assert.equal(event.event, 'ApprovalForAll')
        assert.equal(event.args.owner, owner)
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
        await lock.transferFrom(owner, accounts[3], tokenId, {
          from: approvedUser,
        })

        // Transfer it back to the original owner for other tests
        await lock.transferFrom(accounts[3], owner, tokenId, {
          from: accounts[3],
        })
      })

      it('isApprovedForAll is still true (not lost after transfer)', async () => {
        assert.equal(await lock.isApprovedForAll(owner, approvedUser), true)
      })

      describe('allows for multiple operators per owner', () => {
        let newApprovedUser = accounts[8]

        before(async () => {
          await lock.setApprovalForAll(newApprovedUser, true, {
            from: owner,
          })
        })

        it('new operator is approved', async () => {
          assert.equal(
            await lock.isApprovedForAll(owner, newApprovedUser),
            true
          )
        })

        it('original operator is still approved', async () => {
          assert.equal(await lock.isApprovedForAll(owner, approvedUser), true)
        })
      })
    })

    describe('can cancel an outstanding approval', () => {
      let event

      before(async () => {
        await lock.setApprovalForAll(approvedUser, true, {
          from: owner,
        })
        let result = await lock.setApprovalForAll(approvedUser, false, {
          from: owner,
        })
        event = result.logs[0]
      })

      it('isApprovedForAll is false again', async () => {
        assert.equal(await lock.isApprovedForAll(owner, approvedUser), false)
      })

      it('This emits when an operator is (enabled or) disabled for an owner.', async () => {
        assert.equal(event.event, 'ApprovalForAll')
        assert.equal(event.args.owner, owner)
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
