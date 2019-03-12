const deployLocks = require('../../helpers/deployLocks')
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../../helpers/proxy')

let unlock, locks

contract('Lock / erc721 / compliance', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should support the erc721 interface()', async function () {
    // Note: the ERC-165 identifier for the erc721 interface is "0x80ac58cd"
    const result = await locks['FIRST'].supportsInterface.call('0x80ac58cd')
    assert.equal(result, true)
  })
})
