const { assert } = require('chai')
const { ethers } = require('hardhat')
const { deployLock, purchaseKey, reverts } = require('../../helpers')

let lock
let tokenId
let keyOwner, approvedAccount, newApprovedAccount, signers

describe('Lock / erc721 / approveForAll', () => {
  before(async () => {
    lock = await deployLock()
    ;[, keyOwner, approvedAccount, newApprovedAccount, ...signers] =
      await ethers.getSigners()
    await lock.updateTransferFee(0) // disable the transfer fee for this test
  })

  describe('when the key exists', () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    })

    it('isApprovedForAll defaults to false', async () => {
      assert.equal(
        await lock.isApprovedForAll(keyOwner.address, approvedAccount.address),
        false
      )
    })

    describe('when the sender is self approving', () => {
      it('should fail', async () => {
        await reverts(
          lock.connect(keyOwner).setApprovalForAll(keyOwner.address, true),
          'APPROVE_SELF'
        )
      })
    })

    describe('when the approval succeeds', () => {
      let event
      before(async () => {
        const tx = await lock
          .connect(keyOwner)
          .setApprovalForAll(approvedAccount.address, true)
        const { events } = await tx.wait()
        event = events.find((v) => v.event === 'ApprovalForAll')
      })

      it('isApprovedForAll is true', async () => {
        assert.equal(
          await lock.isApprovedForAll(
            keyOwner.address,
            approvedAccount.address
          ),
          true
        )
      })

      it('should trigger the ApprovalForAll event', () => {
        assert.equal(event.event, 'ApprovalForAll')
        assert.equal(event.args.owner, keyOwner.address)
        assert.equal(event.args.operator, approvedAccount.address)
        assert.equal(event.args.approved, true)
      })

      it('an authorized operator may set the approved address for an NFT', async () => {
        await lock
          .connect(approvedAccount)
          .approve(newApprovedAccount.address, tokenId)
        assert.equal(
          await lock.getApproved(tokenId),
          newApprovedAccount.address
        )
      })

      it('should allow the approved user to transferFrom', async () => {
        await lock
          .connect(approvedAccount)
          .transferFrom(keyOwner.address, newApprovedAccount.address, tokenId)

        // Transfer it back to the original keyOwner for other tests
        await lock
          .connect(newApprovedAccount)
          .transferFrom(newApprovedAccount.address, keyOwner.address, tokenId)
      })

      it('isApprovedForAll is still true (not lost after transfer)', async () => {
        assert.equal(
          await lock.isApprovedForAll(
            keyOwner.address,
            approvedAccount.address
          ),
          true
        )
      })

      describe('allows for multiple operators per keyOwner', () => {
        before(async () => {
          await lock
            .connect(keyOwner)
            .setApprovalForAll(newApprovedAccount.address, true)
        })

        it('new operator is approved', async () => {
          assert.equal(
            await lock.isApprovedForAll(
              keyOwner.address,
              newApprovedAccount.address
            ),
            true
          )
        })

        it('original operator is still approved', async () => {
          assert.equal(
            await lock.isApprovedForAll(
              keyOwner.address,
              approvedAccount.address
            ),
            true
          )
        })
      })
    })

    describe('can cancel an outstanding approval', () => {
      let event

      before(async () => {
        // set key approval
        await lock
          .connect(keyOwner)
          .setApprovalForAll(approvedAccount.address, true)
        // unset key approval
        const tx = await lock
          .connect(keyOwner)
          .setApprovalForAll(approvedAccount.address, false)
        const { events } = await tx.wait()
        event = events.find((v) => v.event === 'ApprovalForAll')
      })

      it('isApprovedForAll is false again', async () => {
        assert.equal(
          await lock.isApprovedForAll(
            keyOwner.address,
            approvedAccount.address
          ),
          false
        )
      })

      it('This emits when an operator is (enabled or) disabled for an owner.', async () => {
        assert.equal(event.event, 'ApprovalForAll')
        assert.equal(event.args.owner, keyOwner.address)
        assert.equal(event.args.operator, approvedAccount.address)
        assert.equal(event.args.approved, false)
      })
    })
  })

  describe('when the owner does not have a key', () => {
    it('allows the owner to call approveForAll', async () => {
      const ownerWithoutAKey = signers[8]
      // owner has no key
      assert.equal(await lock.balanceOf(ownerWithoutAKey.address), 0)
      // approval works
      await lock
        .connect(ownerWithoutAKey)
        .setApprovalForAll(approvedAccount.address, true)
      assert.equal(
        await lock.isApprovedForAll(
          ownerWithoutAKey.address,
          approvedAccount.address
        ),
        true
      )
    })
  })
})
