const assert = require('assert')
const { ethers } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const {
  deployLock,
  ADDRESS_ZERO,
  purchaseKey,
  reverts,
  compareBigNumbers,
} = require('../../helpers')

let lock
let tokenId
let keyOwner, approvedAccount

describe('Lock / erc721 / approve', () => {
  before(async () => {
    ;[, keyOwner, approvedAccount] = await ethers.getSigners()
    lock = await deployLock()
  })

  describe('when the token does not exist', () => {
    it('should fail', async () => {
      await reverts(
        lock.connect(keyOwner).approve(await approvedAccount.getAddress(), 42),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
  })

  describe('when the key exists', () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    })

    describe('when the sender is not the token owner', () => {
      it('should fail', async () => {
        await reverts(
          lock
            .connect(approvedAccount)
            .approve(await approvedAccount.getAddress(), tokenId),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })
    })

    describe('when the sender is self approving', () => {
      it('should fail', async () => {
        await reverts(
          lock.connect(keyOwner).approve(await keyOwner.getAddress(), tokenId),
          'APPROVE_SELF'
        )
      })
    })

    describe('when the approval succeeds', () => {
      let event
      before(async () => {
        const tx = await lock
          .connect(keyOwner)
          .approve(await approvedAccount.getAddress(), tokenId)
        const receipt = await tx.wait()
        event = await getEvent(receipt, 'Approval')
      })

      it('should assign the approvedForTransfer value', async () => {
        const approved = await lock.getApproved(tokenId)
        assert.equal(approved, await approvedAccount.getAddress())
      })

      it('should trigger the Approval event', async () => {
        assert.equal(event.event.fragment.name, 'Approval')
        assert.equal(event.args.owner, await keyOwner.getAddress())
        assert.equal(event.args.approved, await approvedAccount.getAddress())
        compareBigNumbers(event.args.tokenId, tokenId)
      })

      describe('when reaffirming the approved address', () => {
        before(async () => {
          let tx = await lock
            .connect(keyOwner)
            .approve(await approvedAccount.getAddress(), tokenId)
          const receipt = await tx.wait()
          event = await getEvent(receipt, 'Approval')
        })

        it('Approval emits when the approved address is reaffirmed', async () => {
          assert.equal(event.event.fragment.name, 'Approval')
          assert.equal(event.args.owner, await keyOwner.getAddress())
          assert.equal(event.args.approved, await approvedAccount.getAddress())
          compareBigNumbers(event.args.tokenId, tokenId)
        })
      })

      describe('when clearing the approved address', () => {
        before(async () => {
          let tx = await lock.connect(keyOwner).approve(ADDRESS_ZERO, tokenId)
          const receipt = await tx.wait()
          event = await getEvent(receipt, 'Approval')
        })

        it('The zero address indicates there is no approved address', async () => {
          assert.equal(await lock.getApproved(tokenId), ADDRESS_ZERO)
        })
      })
    })
  })
})
