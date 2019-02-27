const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const Unlock = artifacts.require('./Unlock.sol')
const PublicLock = artifacts.require('../../PublicLock.sol')
const Zos = require('zos')
const TestHelper = Zos.TestHelper

contract('PublicLock', accounts => {
  const proxyAdmin = accounts[1]
  const unlockOwner = accounts[2]

  describe('Locks with infinite or 0 keys', function () {
    before(async function () {
      this.project = await TestHelper({ from: proxyAdmin })
      this.proxy = await this.project.createProxy(Unlock, { initMethod: 'initialize', initArgs: [unlockOwner], initFrom: unlockOwner })
      this.unlock = await Unlock.at(this.proxy.address)
    })

    describe('Create a Lock with infinite keys', function () {
      let transaction
      before(async function () {
        transaction = await this.unlock.createLock(
          60 * 60 * 24 * 30, // expirationDuration: 30 days
          Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
          -1 // maxNumberOfKeys
          , {
            from: accounts[0],
            gas: 4000000
          })
      })

      it('should have created the lock with an infinite number of keys', async function () {
        let publicLock = await PublicLock.at(transaction.logs[0].args.newLockAddress)
        const maxNumberOfKeys = new BigNumber(await publicLock.maxNumberOfKeys())
        assert.equal(maxNumberOfKeys.toFixed(), new BigNumber(2).pow(256).minus(1).toFixed())
      })
    })

    describe('Create a Lock with 0 keys', function () {
      let transaction
      before(async function () {
        transaction = await this.unlock.createLock(
          60 * 60 * 24 * 30, // expirationDuration: 30 days
          Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
          0 // maxNumberOfKeys
          , {
            from: accounts[0],
            gas: 4000000
          })
      })

      it('should have created the lock with 0 keys', async function () {
        let publicLock = await PublicLock.at(transaction.logs[0].args.newLockAddress)
        const maxNumberOfKeys = new BigNumber(await publicLock.maxNumberOfKeys())
        assert.equal(maxNumberOfKeys.toFixed(), 0)
      })
    })
  })
})
