const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const PublicLock = artifacts.require('../../PublicLock.sol')
const Zos = require('zos')
const TestHelper = Zos.TestHelper
const { ZWeb3, Contracts } = require('zos-lib')
ZWeb3.initialize(web3.currentProvider)
const Unlock = Contracts.getFromLocal('Unlock')

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
        transaction = await this.unlock.methods.createLock(
          60 * 60 * 24 * 30, // expirationDuration: 30 days
          Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
          -1 // maxNumberOfKeys
        ).send({
          from: accounts[0],
          gas: 4000000
        })
      })

      it('should have created the lock with an infinite number of keys', async function () {
        let publicLock = await PublicLock.at(transaction.events.NewLock.returnValues.newLockAddress)
        const maxNumberOfKeys = new BigNumber(await publicLock.maxNumberOfKeys())
        assert.equal(maxNumberOfKeys.toFixed(), new BigNumber(2).pow(256).minus(1).toFixed())
      })
    })

    describe('Create a Lock with 0 keys', function () {
      let transaction
      before(async function () {
        transaction = await this.unlock.methods.createLock(
          60 * 60 * 24 * 30, // expirationDuration: 30 days
          Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
          0 // maxNumberOfKeys
        ).send({
          from: accounts[0],
          gas: 4000000
        })
      })

      it('should have created the lock with 0 keys', async function () {
        let publicLock = await PublicLock.at(transaction.events.NewLock.returnValues.newLockAddress)
        const maxNumberOfKeys = new BigNumber(await publicLock.maxNumberOfKeys())
        assert.equal(maxNumberOfKeys.toFixed(), 0)
      })
    })
  })
})
