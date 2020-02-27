const unlockContract = artifacts.require('Unlock.sol')

const { reverts } = require('truffle-assertions')
const getProxy = require('../helpers/proxy')

let unlock

contract('Unlock / initializers', accounts => {
  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
  })

  it('There is only 1 public initializer in Unlock', async () => {
    const count = unlockContract.abi.filter(x =>
      x.name.toLowerCase().includes('initialize')
    ).length
    assert.equal(count, 1)
  })

  it('initialize may not be called again', async () => {
    await reverts(
      unlock.initialize(accounts[0]),
      'Contract instance has already been initialized.'
    )
  })
})
