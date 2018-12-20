// const Units = require('ethereumjs-units')
const deployLocks = require('../../helpers/deployLocks')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks

contract('Lock ERC165', (accounts) => {
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

  describe('Supports ERC721 Interface', () => {
    it('should support the erc721 interface()', async function () {
      // Note: the ERC-165 identifier for the erc721 interface is "0x80ac58cd"
      const result = await locks['FIRST'].supportsInterface.call('0x80ac58cd')
      // when ERC721-compliant, this will break and we change to `assert.equal(result, true)`
      assert.equal(result, false)
    })
  })
})
