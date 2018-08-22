const zos = require('zos-lib')
const Unlock = artifacts.require('Unlock')
const UnlockTestV2 = artifacts.require('UnlockTestV2')
const AdminUpgradeabilityProxy = zos.Contracts.getFromNodeModules('zos-lib', 'AdminUpgradeabilityProxy')
const shared = require('./behaviors/shared')
const Units = require('ethereumjs-units')

contract('Unlock', function (accounts) {
  const proxyOwner = accounts[1]
  const unlockOwner = accounts[2]

  describe('Proxy Unlock contract', function () {
    before(async function () {
      const implV1 = await Unlock.new()
      this.proxy = await AdminUpgradeabilityProxy.new(implV1.address, { from: proxyOwner })
      this.unlock = await Unlock.at(this.proxy.address)
      await this.unlock.initialize(unlockOwner)
    })

    describe('should function as a proxy', function () {
      shared.shouldBehaveLikeV1(accounts, unlockOwner)

      it('should fail if called from the proxy owner\'s account', async function () {
        try {
          await this.unlock.grossNetworkProduct({from: proxyOwner})
        } catch (e) {
          return
        }

        assert.fail()
      })
    })

    describe('should function after upgrade', function () {
      before(async function () {
        const implV2 = await UnlockTestV2.new()
        await this.proxy.upgradeTo(implV2.address, {from: proxyOwner})
        this.unlock = await UnlockTestV2.at(this.proxy.address)
      })

      shared.shouldBehaveLikeV1(accounts, unlockOwner)

      it('should allow new functions', async function () {
        const results = await this.unlock.testNewMethod()
        assert.equal(results.toString(), '42')
      })

      it('should allow changing functions', async function () {
        const results = await this.unlock.computeAvailableDiscountFor(0, 0)
        assert.equal(results[0].toString(), '42')
        assert.equal(results[1].toString(), '42')
      })
    })

    it('should persist state between upgrades', async function () {
      const transaction = await this.unlock.createLock(
        0, // keyReleaseMechanism: KeyReleaseMechanisms.Public
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
        100 // maxNumberOfKeys
        , {
          from: accounts[0]
        })
      const resultsBefore = await this.unlock.locks(transaction.logs[0].args.newLockAddress)
      const implV2 = await UnlockTestV2.new()
      await this.proxy.upgradeTo(implV2.address, {from: proxyOwner})
      this.unlock = await UnlockTestV2.at(this.proxy.address)
      const resultsAfter = await this.unlock.locks(transaction.logs[0].args.newLockAddress)
      assert.equal(JSON.stringify(resultsAfter), JSON.stringify(resultsBefore))
    })
  })
})
