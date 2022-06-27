const { deployLock, reverts, purchaseKeys } = require('../helpers')

let lock

contract('Lock / soldOut', () => {
  beforeEach(async () => {
    lock = await deployLock()
    await lock.setMaxKeysPerAddress(10)
  })

  it('should revert if we reached the max number of keys', async () => {
    await purchaseKeys(lock, 8)
    await reverts(purchaseKeys(lock, 3), 'LOCK_SOLD_OUT')
  })
})
