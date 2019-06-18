const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')

let unlock, locks

contract('Lock / Lock', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should have created locks with the correct value', () => {
    const lock = locks['FIRST']
    return Promise.all([
      lock.owner.call(),
      lock.expirationDuration.call(),
      lock.keyPrice.call(),
      lock.maxNumberOfKeys.call(),
      lock.totalSupply.call(),
      lock.numberOfOwners.call(),
      lock.publicLockVersion.call(),
      lock.isAlive.call(),
    ]).then(
      ([
        owner,
        expirationDuration,
        keyPrice,
        maxNumberOfKeys,
        totalSupply,
        numberOfOwners,
        publicLockVersion,
        isAlive,
      ]) => {
        expirationDuration = new BigNumber(expirationDuration)
        keyPrice = new BigNumber(keyPrice)
        maxNumberOfKeys = new BigNumber(maxNumberOfKeys)
        totalSupply = new BigNumber(totalSupply)
        numberOfOwners = new BigNumber(numberOfOwners)
        publicLockVersion = new BigNumber(publicLockVersion)
        assert.strictEqual(owner, accounts[0])
        assert.equal(expirationDuration.toFixed(), 60 * 60 * 24 * 30)
        assert.strictEqual(Units.convert(keyPrice, 'wei', 'eth'), '0.01')
        assert.equal(maxNumberOfKeys.toFixed(), 10)
        assert.equal(totalSupply.toFixed(), 0)
        assert.equal(numberOfOwners.toFixed(), 0)
        assert.equal(publicLockVersion.toFixed(), 5) // needs updating each lock-version change
        assert.equal(isAlive, true)
      }
    )
  })
})
