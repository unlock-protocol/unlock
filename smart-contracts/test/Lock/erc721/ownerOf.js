const deployLocks = require('../../helpers/deployLocks')
const { ADDRESS_ZERO, purchaseKey } = require('../../helpers')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../../helpers/truffle-artifacts')

let unlock
let lock

contract('Lock / erc721 / ownerOf', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.setMaxKeysPerAddress(10)
  })

  it('should return 0x0 when key is nonexistent', async () => {
    let address = await lock.ownerOf(42)
    assert.equal(address, ADDRESS_ZERO)
  })

  it('should return the owner of the key', async () => {
    const { tokenId } = await purchaseKey(lock, accounts[1])
    let address = await lock.ownerOf(tokenId)
    assert.equal(address, accounts[1])
  })

  it('should work correctly after a transfer', async () => {
    const { tokenId } = await purchaseKey(lock, accounts[1])
    let address = await lock.ownerOf(tokenId)
    assert.equal(address, accounts[1])

    // transfer
    await lock.transferFrom(accounts[1], accounts[7], tokenId, {
      from: accounts[1],
    })
    assert.equal(await lock.ownerOf(tokenId), accounts[7])
  })
})
