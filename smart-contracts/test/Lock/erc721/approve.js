const {
  deployLock,
  ADDRESS_ZERO,
  purchaseKey,
  reverts,
} = require('../../helpers')
let lock
let tokenId
let keyOwner

contract('Lock / erc721 / approve', (accounts) => {
  before(async () => {
    keyOwner = accounts[1]
    lock = await deployLock()
  })

  describe('when the token does not exist', () => {
    it('should fail', async () => {
      await reverts(
        lock.approve(accounts[2], 42, {
          from: keyOwner,
        }),
        'ONLY_KEY_MANAGER_OR_APPROVED'
      )
    })
  })

  describe('when the key exists', () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
    })

    describe('when the sender is not the token owner', () => {
      it('should fail', async () => {
        await reverts(
          lock.approve(accounts[2], tokenId, {
            from: accounts[2],
          }),
          'ONLY_KEY_MANAGER_OR_APPROVED'
        )
      })
    })

    describe('when the sender is self approving', () => {
      it('should fail', async () => {
        await reverts(
          lock.approve(keyOwner, tokenId, {
            from: keyOwner,
          }),
          'APPROVE_SELF'
        )
      })
    })

    describe('when the approval succeeds', () => {
      let event
      before(async () => {
        let result = await lock.approve(accounts[2], tokenId, {
          from: keyOwner,
        })
        event = result.logs[0]
      })

      it('should assign the approvedForTransfer value', async () => {
        const approved = await lock.getApproved(tokenId)
        assert.equal(approved, accounts[2])
      })

      it('should trigger the Approval event', () => {
        assert.equal(event.event, 'Approval')
        assert.equal(event.args.owner, keyOwner)
        assert.equal(event.args.approved, accounts[2])
        assert.equal(event.args.tokenId.toString(), tokenId.toString())
      })

      describe('when reaffirming the approved address', () => {
        before(async () => {
          let result = await lock.approve(accounts[2], tokenId, {
            from: keyOwner,
          })
          event = result.logs[0]
        })

        it('Approval emits when the approved address is reaffirmed', async () => {
          assert.equal(event.event, 'Approval')
          assert.equal(event.args.owner, keyOwner)
          assert.equal(event.args.approved, accounts[2])
          assert.equal(event.args.tokenId.toString(), tokenId.toString())
        })
      })

      describe('when clearing the approved address', () => {
        before(async () => {
          let result = await lock.approve(ADDRESS_ZERO, tokenId, {
            from: keyOwner,
          })
          event = result.logs[0]
        })

        it('The zero address indicates there is no approved address', async () => {
          assert.equal(await lock.getApproved(tokenId), ADDRESS_ZERO)
        })
      })
    })
  })
})
