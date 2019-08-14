const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock, locks

contract('Lock / erc721 / Non_Public_approve', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  // from approve.js, ln#23:
  describe.skip('when the lock is private', () => {
    it('should fail', async () => {
      await shouldFail(
        locks['PRIVATE'].approve(accounts[2], accounts[1], {
          from: accounts[1],
        }),
        ''
      )
    })
  })

  describe.skip('when the lock is permissioned', () => {
    let owner

    before(() => {
      return locks['RESTRICTED'].owner.call().then(_owner => {
        owner = _owner
      })
    })

    describe.skip('if the sender is the owner of the lock', () => {
      it('should allow the owner of the lock to approve a purchase by setting the the _tokenId to the same value as the _approved', () => {
        return locks['RESTRICTED']
          .approve(accounts[1], accounts[1], {
            from: owner,
          })
          .then(() => {
            return locks['RESTRICTED'].getApproved.call(accounts[1])
          })
          .then(approved => {
            assert.equal(approved, accounts[1])
          })
      })

      it('should allow the owner of the lock to approve a transfer of an existing key', () => {
        return locks['RESTRICTED']
          .approve(accounts[2], accounts[2], {
            from: owner,
          })
          .then(() => {
            // accounts[2] purchases a key
            return locks['RESTRICTED'].purchase(
              accounts[2],
              web3.utils.padLeft(0, 40),
              [],
              {
                value: locks['RESTRICTED'].params.keyPrice.toFixed(),
                from: accounts[2],
              }
            )
          })
          .then(() => {
            // Lock owner approves the transfer of accounts[2]'s key
            return locks['RESTRICTED'].approve(accounts[3], accounts[2], {
              from: owner,
            })
          })
          .then(() => {
            // Let's retrieve the approved key
            return locks['RESTRICTED'].getApproved.call(accounts[2])
          })
          .then(approved => {
            // and make sure it is right
            assert.equal(approved, accounts[3])
          })
      })

      it('should allow the owner of the lock to approve a transfer of a non existing key', () => {
        return locks['RESTRICTED']
          .approve(accounts[4], accounts[5], {
            from: owner,
          })
          .then(() => {
            // Let's retrieve the approved key
            return locks['RESTRICTED'].getApproved.call(accounts[5])
          })
          .then(approved => {
            // and make sure it is right
            assert.equal(approved, accounts[4])
          })
      })
    })

    describe.skip('if the sender is the owner of the key', () => {
      it('should fail if the owner of a key tries to approve transfer of her key', async () => {
        await locks['RESTRICTED'].approve(accounts[5], accounts[5], {
          from: owner,
        })
        // accounts[5] purchases a key
        await locks['RESTRICTED'].purchase(
          accounts[5],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: locks['RESTRICTED'].params.keyPrice.toFixed(),
            from: accounts[5],
          }
        )
        // Key owner tries to approve the transfer of her key
        await shouldFail(
          locks['RESTRICTED'].approve(accounts[3], accounts[5], {
            from: accounts[5],
          }),
          ''
        )
      })

      it('should fail if sender is trying to allow another key transfer', async () => {
        await locks['RESTRICTED'].approve(accounts[5], accounts[5], {
          from: owner,
        })
        // accounts[5] purchases a key
        await locks['RESTRICTED'].purchase(
          accounts[5],
          web3.utils.padLeft(0, 40),
          [],
          {
            value: locks['RESTRICTED'].params.keyPrice.toFixed(),
            from: accounts[5],
          }
        )
        // Key owner tries to approve the transfer of her key
        await shouldFail(
          locks['RESTRICTED'].approve(accounts[3], accounts[4], {
            from: accounts[5],
          }),
          ''
        )
      })
    })

    it('should fail if the sender does not own a key', async () => {
      await shouldFail(
        locks['RESTRICTED'].approve(accounts[5], accounts[5], {
          from: accounts[9],
        }),
        ''
      )
    })
  })
})
