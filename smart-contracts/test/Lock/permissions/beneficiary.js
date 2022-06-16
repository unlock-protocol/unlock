const { reverts } = require('../../helpers/errors')
const deployLocks = require('../../helpers/deployLocks')
const getContractInstance = require('../../helpers/truffle-artifacts')

const unlockContract = artifacts.require('Unlock.sol')

let unlock
let locks
let lock
let lockCreator
let notAuthorized
let currentBeneficiary
let newBeneficiary

contract('Permissions / Beneficiary', (accounts) => {
  lockCreator = accounts[0]
  notAuthorized = accounts[9]
  newBeneficiary = accounts[1]

  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, lockCreator)
    lock = locks.FIRST
  })

  describe('default permissions on a new lock', () => {
    it('should make the lock creator the beneficiary as well', async () => {
      const defaultBeneficiary = await lock.beneficiary()
      assert.equal(defaultBeneficiary, lockCreator)
    })
  })
  describe('modifying permissions on an existing lock', () => {
    it('should allow a lockManager to update the beneficiary', async () => {
      await lock.updateBeneficiary(newBeneficiary, { from: lockCreator })
      currentBeneficiary = await lock.beneficiary()
      assert.equal(currentBeneficiary, newBeneficiary)
    })

    it('should allow Beneficiary to update the beneficiary', async () => {
      currentBeneficiary = await lock.beneficiary()
      await lock.updateBeneficiary(accounts[8], { from: currentBeneficiary })
      currentBeneficiary = await lock.beneficiary()
      assert.equal(currentBeneficiary, accounts[8])
    })

    it('should not allow anyone else to update the beneficiary', async () => {
      await reverts(
        lock.updateBeneficiary(accounts[5], { from: notAuthorized }),
        'ONLY_LOCK_MANAGER_OR_BENEFICIARY'
      )
    })
  })
})
