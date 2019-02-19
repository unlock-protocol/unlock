const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks, ID

contract('Lock ERC721', accounts => {
  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock)
  })

  describe('approve', () => {
    describe('when the token does not exist', () => {
      it('should fail', async () => {
        await shouldFail(
          locks['FIRST'].approve(accounts[2], 42, {
            from: accounts[1]
          }),
          'ONLY_KEY_OWNER'
        )
      })
    })

    describe('when the key exists', () => {
      before(() => {
        return locks['FIRST'].purchaseFor(
          accounts[1],
          Web3Utils.toHex('Satoshi'),
          {
            value: Units.convert('0.01', 'eth', 'wei'),
            from: accounts[1]
          }
        )
      })

      describe('when the sender is not the token owner', () => {
        it('should fail', async () => {
          ID = await locks['FIRST'].getTokenIdFor.call(accounts[1])
          await shouldFail(
            locks['FIRST'].approve(accounts[2], ID, {
              from: accounts[2]
            }),
            'ONLY_KEY_OWNER'
          )
        })
      })

      describe('when the sender is self approving', () => {
        it('should fail', async () => {
          await shouldFail(
            locks['FIRST'].approve(accounts[1], ID, {
              from: accounts[1]
            }),
            'APPROVE_SELF'
          )
        })
      })

      describe('when the approval succeeds', () => {
        let event
        before(async () => {
          let result = await locks['FIRST'].approve(accounts[2], ID, {
            from: accounts[1]
          })
          event = result.logs[0]
        })

        it('should assign the approvedForTransfer value', () => {
          return locks['FIRST'].getApproved.call(ID).then(approved => {
            assert.equal(approved, accounts[2])
          })
        })

        it('should trigger the Approval event', () => {
          assert.equal(event.event, 'Approval')
          assert.equal(event.args._owner, accounts[1])
          assert.equal(event.args._approved, accounts[2])
          assert(event.args._tokenId.eq(ID))
        })
      })
    })
  })
})
