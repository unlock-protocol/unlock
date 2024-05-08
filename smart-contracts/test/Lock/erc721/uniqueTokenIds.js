const {
  ADDRESS_ZERO,
  purchaseKeys,
  deployLock,
  compareBigNumbers,
} = require('../../helpers')
const { ethers } = require('hardhat')

describe('Lock / uniqueTokenIds', () => {
  let lock
  let tokenIds

  before(async () => {
    lock = await deployLock()
    // buy some keys
    ;({ tokenIds } = await purchaseKeys(lock, 5))
  })

  describe('extending keys', () => {
    it('should not duplicate tokenIDs', async () => {
      compareBigNumbers(tokenIds[tokenIds.length - 1], await lock.totalSupply())

      // extend a key
      await lock.extend(0, tokenIds[1], ADDRESS_ZERO, '0x', {
        value: ethers.parseUnits('0.01', 'ether'),
      })

      // make sure no new keys have been created
      compareBigNumbers(tokenIds[tokenIds.length - 1], await lock.totalSupply())
    })
  })
})
