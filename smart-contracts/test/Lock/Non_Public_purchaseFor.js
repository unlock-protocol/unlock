const Units = require('ethereumjs-units')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / Non_Public_purchaseFor', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  // from purchaseFor.js, ln#23:
  describe.skip('if the contract has a private key release', () => {
    it('should fail', async () => {
      const lock = locks['PRIVATE']
      await shouldFail(
        lock.purchase(accounts[0]),
        web3.utils.padLeft(0, 40),
        ''
      )
      // Making sure we do not have a key set!
      await shouldFail(lock.keyExpirationTimestampFor.call(accounts[0]), '')
    })
  })

  // from purchaseFor.js, ln#184:
  describe.skip('if the contract has a restricted key release', () => {
    let owner

    before(() => {
      return locks['RESTRICTED'].owner.call().then(_owner => {
        owner = _owner
      })
    })

    it('should fail if the sending account was not pre-approved', async () => {
      await shouldFail(
        locks['RESTRICTED'].purchase(accounts[1], web3.utils.padLeft(0, 40), {
          value: Units.convert('0.01', 'eth', 'wei'),
        }),
        ''
      )
    })

    // TODO this test is flaky
    it('should succeed if the sending account was pre-approved', () => {
      return locks['RESTRICTED']
        .approve(accounts[3], accounts[3], {
          from: owner,
        })
        .then(() => {
          locks['RESTRICTED'].purchase(accounts[3], web3.utils.padLeft(0, 40), {
            value: Units.convert('0.01', 'eth', 'wei'),
          })
        })
    })
  })
})
