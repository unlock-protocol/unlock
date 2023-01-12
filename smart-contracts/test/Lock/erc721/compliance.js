const { deployLock } = require('../../helpers')

contract('Lock / erc721 / compliance', () => {
  let lock
  before(async () => {
    lock = await deployLock()
  })

  it('should support the erc721 interface()', async () => {
    // Note: the ERC-165 identifier for the erc721 interface is "0x80ac58cd"
    const result = await lock.supportsInterface('0x80ac58cd')
    assert.equal(result, true)
  })
})
