const { assert } = require('chai')
const { ethers } = require('hardhat')

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
        lock.connect(keyOwner).approve(approvedAccount.address, 42),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
  })

  describe('when the key exists', () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    })

    describe('when the sender is not the token owner', () => {
      it('should fail', async () => {
        await reverts(
          lock
            .connect(approvedAccount)
            .approve(approvedAccount.address, tokenId),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })
    })

    describe('when the sender is self approving', () => {
      it('should fail', async () => {
        await reverts(
          lock.connect(keyOwner).approve(keyOwner.address, tokenId),
          'APPROVE_SELF'
        )
      })
    })

    describe('when the approval succeeds', () => {
      let event
      before(async () => {
        const tx = await lock
          .connect(keyOwner)
          .approve(approvedAccount.address, tokenId)
        const { events } = await tx.wait()
        event = events.find((v) => v.event === 'Approval')
      })

      it('should assign the approvedForTransfer value', async () => {
        const approved = await lock.getApproved(tokenId)
        assert.equal(approved, approvedAccount.address)
      })

      it('should trigger the Approval event', () => {
        assert.equal(event.event, 'Approval')
        assert.equal(event.args.owner, keyOwner.address)
        assert.equal(event.args.approved, approvedAccount.address)
        compareBigNumbers(event.args.tokenId, tokenId)
      })

      describe('when reaffirming the approved address', () => {
        before(async () => {
          let tx = await lock
            .connect(keyOwner)
            .approve(approvedAccount.address, tokenId)
          const { events } = await tx.wait()
          event = events.find((v) => v.event === 'Approval')
        })

        it('Approval emits when the approved address is reaffirmed', async () => {
          assert.equal(event.event, 'Approval')
          assert.equal(event.args.owner, keyOwner.address)
          assert.equal(event.args.approved, approvedAccount.address)
          compareBigNumbers(event.args.tokenId, tokenId)
        })
      })

      describe('when clearing the approved address', () => {
        before(async () => {
          let tx = await lock.connect(keyOwner).approve(ADDRESS_ZERO, tokenId)
          const { events } = await tx.wait()
          event = events.find((v) => v.event === 'Approval')
        })

        it('The zero address indicates there is no approved address', async () => {
          assert.equal(await lock.getApproved(tokenId), ADDRESS_ZERO)
        })
      })
    })
  })
})
