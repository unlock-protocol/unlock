const { reverts } = require('../../helpers/errors')
const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../../helpers/truffle-artifacts')

let locks

contract('Lock / erc721 / getApproved', (accounts) => {
  before(async () => {
    this.unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(this.unlock, accounts[0])
  })

  it('should fail if the key does not exist', async () => {
    await reverts(locks.FIRST.getApproved(42), 'NO_SUCH_KEY')
  })
})
