const zos = require('zos-lib')
const Unlock = artifacts.require('Unlock')
const UnlockTestV2 = artifacts.require('UnlockTestV2')
const UnlockTestV3 = artifacts.require('UnlockTestV3')
const Zos = require('zos')
const TestHelper = Zos.TestHelper
const shared = require('./behaviors/shared')
const Units = require('ethereumjs-units')

contract('Unlock', function (accounts) {
  const proxyAdmin = accounts[1]
  const unlockOwner = accounts[2]

  describe('Proxy Unlock contract', function () {
    beforeEach(async function () {
      this.project = await TestHelper({ from: proxyAdmin })
      this.proxy = await this.project.createProxy(Unlock, { initMethod: 'initialize', initArgs: [unlockOwner], initFrom: unlockOwner })
      this.unlock = await Unlock.at(this.proxy.address)
    })

    describe('should function as a proxy', function () {
      // see note regarding _logIndex in Unlock.js
      let _logIndex = 0
      shared.shouldBehaveLikeV1(accounts, unlockOwner, _logIndex)

      it('should fail if called from the proxy owner\'s account', async function () {
        try {
          await this.unlock.grossNetworkProduct({ from: proxyAdmin })
        } catch (e) {
          return
        }

        assert.fail()
      })
    })

    describe('should function after upgrade', function () {
      beforeEach(async function () {
        await this.project.upgradeProxy(this.proxy, UnlockTestV2, { initMethod: 'initializeV2', initArgs: [], initFrom: unlockOwner })
        this.unlock = await UnlockTestV2.at(this.proxy.address)
      })
      // see note regarding _logIndex in Unlock.js
      let _logIndex = 2
      shared.shouldBehaveLikeV1(accounts, unlockOwner, _logIndex)

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
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
        100 // maxNumberOfKeys
        , {
          from: accounts[0]
        })
      const resultsBefore = await this.proxy.locks(transaction.logs[0].args.newLockAddress)
      await this.project.upgradeProxy(this.proxy, UnlockTestV2, { initMethod: 'initializeV2', initArgs: [], initFrom: unlockOwner })
      this.unlock = await UnlockTestV2.at(this.proxy.address)
      const resultsAfter = await this.unlock.locks(transaction.logs[0].args.newLockAddress)
      assert.equal(JSON.stringify(resultsAfter), JSON.stringify(resultsBefore))
    })

    describe('should allow you to make significant changes to the contract', function () {
      beforeEach(async function () {
        await this.project.upgradeProxy(this.proxy, UnlockTestV3, { initMethod: 'initializeV3', initArgs: [], initFrom: unlockOwner })
        this.unlock = await UnlockTestV3.at(this.proxy.address)
      })

      it('should allow new functions', async function () {
        const results = await this.unlock.testNewMethod()
        assert.equal(results.toString(), '42')
      })

      it('should allow removing functions', async function () {
        try {
          await this.unlock.createLock(
            60 * 60 * 24 * 30,
            Units.convert(1, 'eth', 'wei'),
            100
            , {
              from: accounts[0]
            })
        } catch (e) {
          return
        }
        assert.fail()
      })

      it('should allow changing functions', async function () {
        await this.unlock.recordConsumedDiscount(0)
      })
    })
  })
})
