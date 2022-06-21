const { reverts, purchaseKeys, ADDRESS_ZERO } = require('../helpers')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let unlock
let lock

contract('Lock / soldOut', (accounts) => {
  beforeEach(async () => {
    unlock = await getContractInstance(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.setMaxKeysPerAddress(10)
  })

  it('should revert if we reached the max number of keys', async () => {
    await purchaseKeys(lock, 8)
    await reverts(purchaseKeys(lock, 3), 'LOCK_SOLD_OUT')
  })
})
