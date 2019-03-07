const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const dev1984 = require('../../zos.dev-1984.json')
const ProxyAddress = dev1984.proxies['unlock-protocol/Unlock'][0].address
const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock / Lock', accounts => {
  before(async () => {
    console.log(ProxyAddress)
    unlock = await Unlock.at(ProxyAddress)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should have created locks with the correct value', () => {
    const lock = locks['FIRST']
    return Promise.all([
      lock.owner.call(),
      lock.expirationDuration.call(),
      lock.keyPrice.call(),
      lock.maxNumberOfKeys.call(),
      lock.outstandingKeys.call(),
      lock.numberOfOwners.call(),
      lock.publicLockVersion.call(),
      lock.isAlive.call()
    ]).then(
      ([
        owner,
        expirationDuration,
        keyPrice,
        maxNumberOfKeys,
        outstandingKeys,
        numberOfOwners,
        publicLockVersion,
        isAlive
      ]) => {
        expirationDuration = new BigNumber(expirationDuration)
        keyPrice = new BigNumber(keyPrice)
        maxNumberOfKeys = new BigNumber(maxNumberOfKeys)
        outstandingKeys = new BigNumber(outstandingKeys)
        numberOfOwners = new BigNumber(numberOfOwners)
        publicLockVersion = new BigNumber(publicLockVersion)
        assert.strictEqual(owner, accounts[0])
        assert.equal(expirationDuration.toFixed(), 60 * 60 * 24 * 30)
        assert.strictEqual(Units.convert(keyPrice, 'wei', 'eth'), '0.01')
        assert.equal(maxNumberOfKeys.toFixed(), 10)
        assert.equal(outstandingKeys.toFixed(), 0)
        assert.equal(numberOfOwners.toFixed(), 0)
        assert.equal(publicLockVersion.toFixed(), 1) // needs updating each lock-version change
        assert.equal(isAlive, true)
      }
    )
  })
})
