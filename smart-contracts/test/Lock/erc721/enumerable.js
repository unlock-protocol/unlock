const assert = require('assert')
const { reverts } = require('../../helpers/errors')
const { deployLock, purchaseKeys, compareBigNumbers } = require('../../helpers')

let lock
let tokenIds
let keyOwners

describe('Lock / erc721 / enumerable', () => {
  before(async () => {
    lock = await deployLock()

    // Buy test keys for each account
    ;({ tokenIds, keyOwners } = await purchaseKeys(lock, 5))
  })

  it('tokenByIndex is a no-op', async () => {
    for (let i = 0; i < keyOwners.length; i++) {
      const id = await lock.tokenByIndex(i)
      assert.equal(id, i)
    }
  })

  it('tokenByIndex greater than totalSupply shouldFail', async () => {
    await reverts(lock.tokenByIndex(5))
  })

  it('tokenOfOwnerByIndex forwards to when index == 0', async () => {
    for (let i = 0; i < keyOwners.length; i++) {
      const id = await lock.tokenOfOwnerByIndex(keyOwners[i], 0)
      const expected = tokenIds[i]
      compareBigNumbers(id, expected)
    }
  })

  it('tokenOfOwnerByIndex fails when index > 0', async () => {
    await reverts(lock.tokenOfOwnerByIndex(keyOwners[0], 1))
  })
})
