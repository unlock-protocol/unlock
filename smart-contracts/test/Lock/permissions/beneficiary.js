const { reverts } = require('truffle-assertions')
const deployLocks = require('../../helpers/deployLocks')
const getProxy = require('../../helpers/proxy')

const unlockContract = artifacts.require('Unlock.sol')

let unlock
let locks
let lock
let lockCreator
let notAuthorised
let currentBenficiary
let newBeneficiary

contract('Permissions / Beneficiary', accounts => {
  lockCreator = accounts[0]
  notAuthorised = accounts[9]
  newBeneficiary = accounts[1]

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, lockCreator)
    lock = locks.FIRST
  })

  describe('default permissions on a new lock', () => {
    it('should make the lock creator the beneficiary as well', async () => {
      const defaultBeneficiary = await lock.beneficiary.call()
      assert.equal(defaultBeneficiary, lockCreator)
    })
  })
  describe('modifying permissions on an existing lock', () => {
    it('should allow a lockManager to update the beneficiary', async () => {
      await lock.updateBeneficiary(newBeneficiary, { from: lockCreator })
      currentBenficiary = await lock.beneficiary.call()
      assert.equal(currentBenficiary, newBeneficiary)
    })

    it('should allow Beneficiary to update the beneficiary', async () => {
      currentBenficiary = await lock.beneficiary.call()
      await lock.updateBeneficiary(accounts[8], { from: currentBenficiary })
      currentBenficiary = await lock.beneficiary.call()
      assert.equal(currentBenficiary, accounts[8])
    })

    it('should not allow anyone else to update the beneficiary', async () => {
      await reverts(
        lock.updateBeneficiary(accounts[5], { from: notAuthorised }),
        'ONLY_BENEFICIARY_OR_LOCKMANAGER'
      )
    })
  })
})
