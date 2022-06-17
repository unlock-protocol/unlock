const { reverts } = require('../../helpers/errors')
const deployLocks = require('../../helpers/deployLocks')
const { purchaseKeys } = require('../../helpers')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../../helpers/truffle-artifacts')

let unlock
let locks
let lock
let tokenIds
let keyOwners

contract('Lock / erc721 / enumerable', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST

    // Buy test keys for each account
    keyOwners = accounts.slice(1, 6)
    ;({ tokenIds } = await purchaseKeys(lock, keyOwners.length))
  })

  it('tokenByIndex is a no-op', async () => {
    for (let i = 0; i < keyOwners.length; i++) {
      const id = await lock.tokenByIndex(i)
      assert.equal(id.toString(), i)
    }
  })

  it('tokenByIndex greater than totalSupply shouldFail', async () => {
    await reverts(lock.tokenByIndex(5))
  })

  it('tokenOfOwnerByIndex forwards to when index == 0', async () => {
    for (let i = 0; i < keyOwners.length; i++) {
      const id = await lock.tokenOfOwnerByIndex(keyOwners[i], 0)
      const expected = tokenIds[i]
      assert.equal(id.toString(), expected.toString())
    }
  })

  it('tokenOfOwnerByIndex fails when index > 0', async () => {
    await reverts(lock.tokenOfOwnerByIndex(accounts[0], 1))
  })
})
