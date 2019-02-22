const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, lock, ID

contract('Lock ERC721', accounts => {
  before(async () => {
    unlock = await Unlock.deployed()
    const locks = await deployLocks(unlock)
    lock = locks['FIRST']
  })

  describe('approveForAll', () => {
    let owner = accounts[1]
    let approvedUser = accounts[2]

    describe('when the key exists', () => {
      before(async () => {
        await lock.purchaseFor(
          owner,
          Web3Utils.toHex('Satoshi'),
          {
            value: Units.convert('0.01', 'eth', 'wei'),
            from: owner
          }
        )
        ID = await lock.getTokenIdFor(owner)
      })

      it('isApprovedForAll defaults to false', async () => {
        assert.equal(
          await lock.isApprovedForAll(owner, approvedUser),
          false
        )
      })

      describe('when the sender is self approving', () => {
        it('should fail', async () => {
          await shouldFail(
            lock.setApprovalForAll(owner, true, {
              from: owner
            }),
            'APPROVE_SELF'
          )
        })
      })

      describe('when the approval succeeds', () => {
        let event
        before(async () => {
          let result = await lock.setApprovalForAll(approvedUser, true, {
            from: owner
          })
          event = result.logs[0]
        })

        it('isApprovedForAll is true', async () => {
          assert.equal(
            await lock.isApprovedForAll(owner, approvedUser),
            true
          )
        })

        it('should trigger the ApprovalForAll event', () => {
          assert.equal(event.event, 'ApprovalForAll')
          assert.equal(event.args._owner, owner)
          assert.equal(event.args._operator, approvedUser)
          assert.equal(event.args._approved, true)
        })

        it('should allow the approved user to transferFrom', async () => {
          await lock.transferFrom(owner, accounts[2], ID, {
            from: approvedUser
          })
        })
      })

      describe('can cancel an outstanding approval', () => {
        before(async () => {
          await lock.setApprovalForAll(approvedUser, true, {
            from: owner
          })
          await lock.setApprovalForAll(approvedUser, false, {
            from: owner
          })
        })

        it('isApprovedForAll is false again', async () => {
          assert.equal(
            await lock.isApprovedForAll(owner, approvedUser),
            false
          )
        })
      })
    })
  })
})
