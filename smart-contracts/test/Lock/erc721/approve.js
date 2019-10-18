const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock, locks, ID

contract('Lock / erc721 / approve', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  describe('when the token does not exist', () => {
    it('should fail', async () => {
      await shouldFail(
        locks['FIRST'].approve(accounts[2], 42, {
          from: accounts[1],
        }),
        'ONLY_KEY_OWNER_OR_APPROVED'
      )
    })
  })

  describe('when the key exists', () => {
    before(() => {
      return locks['FIRST'].purchase(
        0,
        accounts[1],
        web3.utils.padLeft(0, 40),
        [],
        {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accounts[1],
        }
      )
    })

    describe('when the sender is not the token owner', () => {
      it('should fail', async () => {
        ID = await locks['FIRST'].getTokenIdFor.call(accounts[1])
        await shouldFail(
          locks['FIRST'].approve(accounts[2], ID, {
            from: accounts[2],
          }),
          'ONLY_KEY_OWNER_OR_APPROVED'
        )
      })
    })

    describe('when the sender is self approving', () => {
      it('should fail', async () => {
        await shouldFail(
          locks['FIRST'].approve(accounts[1], ID, {
            from: accounts[1],
          }),
          'APPROVE_SELF'
        )
      })
    })

    describe('when the approval succeeds', () => {
      let event
      before(async () => {
        let result = await locks['FIRST'].approve(accounts[2], ID, {
          from: accounts[1],
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

      describe('when reaffirming the approved address', () => {
        before(async () => {
          let result = await locks['FIRST'].approve(accounts[2], ID, {
            from: accounts[1],
          })
          event = result.logs[0]
        })

        it('Approval emits when the approved address is reaffirmed', async () => {
          assert.equal(event.event, 'Approval')
          assert.equal(event.args._owner, accounts[1])
          assert.equal(event.args._approved, accounts[2])
          assert(event.args._tokenId.eq(ID))
        })
      })

      describe('when clearing the approved address', () => {
        before(async () => {
          let result = await locks['FIRST'].approve(
            Web3Utils.padLeft(0, 40),
            ID,
            {
              from: accounts[1],
            }
          )
          event = result.logs[0]
        })

        it('The zero address indicates there is no approved address', async () => {
          await shouldFail(locks['FIRST'].getApproved.call(ID), 'NONE_APPROVED')
        })
      })
    })
  })
})
