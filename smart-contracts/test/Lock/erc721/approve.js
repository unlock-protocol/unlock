const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks

contract('Lock ERC721', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock)
      })
      .then(_locks => {
        locks = _locks
      })
  })

  describe('approve', () => {
    describe('when the token does not exist', () => {
      it('should fail', async () => {
        await shouldFail(locks['FIRST']
          .approve(accounts[2], accounts[1], {
            from: accounts[1]
          }), '')
      })
    })

    describe('when the key exists', () => {
      before(() => {
        return locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('Satoshi'), {
          value: Units.convert('0.01', 'eth', 'wei'),
          from: accounts[1]
        })
      })

      describe('when the sender is not the token owner', () => {
        it('should fail', async () => {
          await shouldFail(locks['FIRST']
            .approve(accounts[2], accounts[1], {
              from: accounts[2]
            }), '')
        })
      })

      describe('when the sender is self approving', () => {
        it('should fail', async () => {
          await shouldFail(locks['FIRST']
            .approve(accounts[1], accounts[1], {
              from: accounts[1]
            }), 'You can\'t approve yourself')
        })
      })

      describe('when the approval succeeds', () => {
        let event
        before(() => {
          return locks['FIRST']
            .approve(accounts[2], accounts[1], {
              from: accounts[1]
            })
            .then((result) => {
              event = result.logs[0]
            })
        })

        it('should assign the approvedForTransfer value', () => {
          return locks['FIRST'].getApproved.call(accounts[1])
            .then((approved) => {
              assert.equal(approved, accounts[2])
            })
        })

        it('should trigger the Approval event', () => {
          assert.equal(event.event, 'Approval')
          assert.equal(event.args._owner, accounts[1])
          assert.equal(event.args._approved, accounts[2])
          assert.equal(Web3Utils.toChecksumAddress(Web3Utils.numberToHex(event.args._tokenId)), Web3Utils.toChecksumAddress(accounts[1]))
        })
      })
    })
  })
})
