// const Units = require('ethereumjs-units')
const deployLocks = require('../helpers/deployLocks')
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

  describe('Supports ERC165 Interface', () => {
    it('should support the erc165 interface()', async function () {
      // 0x01ffc9a7 === bytes4(keccak256('supportsInterface(bytes4)'))
      const result = await locks['FIRST'].supportsInterface.call('0x01ffc9a7')
      assert.equal(result, true)
    })
  })
})
