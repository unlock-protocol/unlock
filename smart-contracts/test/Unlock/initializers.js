const unlockContract = artifacts.require('Unlock.sol')

const { reverts } = require('truffle-assertions')
const getProxy = require('../helpers/proxy')

const TRUFFLE_VM_ERROR = 'VM Exception while processing transaction: reverted with reason string'

let unlock

contract('Unlock / initializers', (accounts) => {
  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
  })

  it('There is only 1 public initializer in Unlock', async () => {
    const count = unlockContract.abi.filter(
      (x) => x.name.toLowerCase() === 'initialize'
    ).length
    assert.equal(count, 1)
  })

  it('initialize may not be called again', async () => {
    await reverts(
      unlock.initialize(accounts[0]),
      `${TRUFFLE_VM_ERROR} 'Contract instance has already been initialized'`
    )
  })
})
