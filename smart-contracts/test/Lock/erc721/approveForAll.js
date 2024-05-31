const assert = require('assert')
const { ethers } = require('hardhat')
const { deployLock, purchaseKey, reverts } = require('../../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

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
      ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    })

    it('isApprovedForAll defaults to false', async () => {
      assert.equal(
        await lock.isApprovedForAll(
          await keyOwner.getAddress(),
          await approvedAccount.getAddress()
        ),
        false
      )
    })

    describe('when the sender is self approving', () => {
      it('should fail', async () => {
        await reverts(
          lock
            .connect(keyOwner)
            .setApprovalForAll(await keyOwner.getAddress(), true),
          'APPROVE_SELF'
        )
      })
    })

    describe('when the approval succeeds', () => {
      let event
      before(async () => {
        const tx = await lock
          .connect(keyOwner)
          .setApprovalForAll(await approvedAccount.getAddress(), true)
        const receipt = await tx.wait()
        event = await getEvent(receipt, 'ApprovalForAll')
      })

      it('isApprovedForAll is true', async () => {
        assert.equal(
          await lock.isApprovedForAll(
            await keyOwner.getAddress(),
            await approvedAccount.getAddress()
          ),
          true
        )
      })

      it('should trigger the ApprovalForAll event', async () => {
        assert.equal(event.event.fragment.name, 'ApprovalForAll')
        assert.equal(event.args.owner, await keyOwner.getAddress())
        assert.equal(event.args.operator, await approvedAccount.getAddress())
        assert.equal(event.args.approved, true)
      })

      it('an authorized operator may set the approved address for an NFT', async () => {
        await lock
          .connect(approvedAccount)
          .approve(await newApprovedAccount.getAddress(), tokenId)
        assert.equal(
          await lock.getApproved(tokenId),
          await newApprovedAccount.getAddress()
        )
      })

      it('should allow the approved user to transferFrom', async () => {
        await lock
          .connect(approvedAccount)
          .transferFrom(
            await keyOwner.getAddress(),
            await newApprovedAccount.getAddress(),
            tokenId
          )

        // Transfer it back to the original keyOwner for other tests
        await lock
          .connect(newApprovedAccount)
          .transferFrom(
            await newApprovedAccount.getAddress(),
            await keyOwner.getAddress(),
            tokenId
          )
      })

      it('isApprovedForAll is still true (not lost after transfer)', async () => {
        assert.equal(
          await lock.isApprovedForAll(
            await keyOwner.getAddress(),
            await approvedAccount.getAddress()
          ),
          true
        )
      })

      describe('allows for multiple operators per keyOwner', () => {
        before(async () => {
          await lock
            .connect(keyOwner)
            .setApprovalForAll(await newApprovedAccount.getAddress(), true)
        })

        it('new operator is approved', async () => {
          assert.equal(
            await lock.isApprovedForAll(
              await keyOwner.getAddress(),
              await newApprovedAccount.getAddress()
            ),
            true
          )
        })

        it('original operator is still approved', async () => {
          assert.equal(
            await lock.isApprovedForAll(
              await keyOwner.getAddress(),
              await approvedAccount.getAddress()
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
          .setApprovalForAll(await approvedAccount.getAddress(), true)
        // unset key approval
        const tx = await lock
          .connect(keyOwner)
          .setApprovalForAll(await approvedAccount.getAddress(), false)
        const receipt = await tx.wait()
        event = await getEvent(receipt, 'ApprovalForAll')
      })

      it('isApprovedForAll is false again', async () => {
        assert.equal(
          await lock.isApprovedForAll(
            await keyOwner.getAddress(),
            await approvedAccount.getAddress()
          ),
          false
        )
      })

      it('This emits when an operator is (enabled or) disabled for an owner.', async () => {
        assert.equal(event.event.fragment.name, 'ApprovalForAll')
        assert.equal(event.args.owner, await keyOwner.getAddress())
        assert.equal(event.args.operator, await approvedAccount.getAddress())
        assert.equal(event.args.approved, false)
      })
    })
  })

  describe('when the owner does not have a key', () => {
    it('allows the owner to call approveForAll', async () => {
      const ownerWithoutAKey = signers[8]
      // owner has no key
      assert.equal(await lock.balanceOf(await ownerWithoutAKey.getAddress()), 0)
      // approval works
      await lock
        .connect(ownerWithoutAKey)
        .setApprovalForAll(await approvedAccount.getAddress(), true)
      assert.equal(
        await lock.isApprovedForAll(
          await ownerWithoutAKey.getAddress(),
          await approvedAccount.getAddress()
        ),
        true
      )
    })
  })
})
