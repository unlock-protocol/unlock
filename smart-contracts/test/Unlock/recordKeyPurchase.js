
const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock)
      })
      .then(_locks => {
        locks = _locks
      })
  })

  describe('recordKeyPurchase', () => {
    it('should fail if not invoked by a previously deployed lock')
    it('should increase the grossNetworkProduct with the price of the key (ignoring the discount)')
    it('should grant discount tokens to the referrer based on the key price')
  })
})
