const { deployLock } = require('../helpers')

contract('Lock / erc165', () => {
  let lock
  before(async () => {
    lock = await deployLock()
  })

  it('should support the erc165 interface()', async () => {
    // 0x01ffc9a7 === bytes4(keccak256('supportsInterface(bytes4)'))
    const result = await lock.supportsInterface('0x01ffc9a7')
    assert.equal(result, true)
  })

  it('should support the erc721 metadata interface', async () => {
    // ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    const result = await lock.supportsInterface('0x5b5e139f')
    assert.equal(result, true)
  })

  it('should support the erc721 enumerable interface', async () => {
    // ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    const result = await lock.supportsInterface('0x780e9d63')
    assert.equal(result, true)
  })
})
