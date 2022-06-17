const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../../helpers/truffle-artifacts')

let unlock
let locks

contract('Lock / erc721 / compliance', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should support the erc721 interface()', async () => {
    // Note: the ERC-165 identifier for the erc721 interface is "0x80ac58cd"
    const result = await locks.FIRST.supportsInterface('0x80ac58cd')
    assert.equal(result, true)
  })
})
