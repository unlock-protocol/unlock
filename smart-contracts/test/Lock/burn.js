const deployLocks = require('../helpers/deployLocks')
const { reverts, ADDRESS_ZERO, purchaseKey } = require('../helpers')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

let unlock
let locks
let tokenId

contract('Lock / burn', (accounts) => {
  let keyOwner = accounts[1]
  let lock

  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    lock.setMaxKeysPerAddress(10)
  })

  beforeEach(async () => {
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
  })

  it('should delete ownership record', async () => {
    assert.equal(await lock.getHasValidKey(keyOwner), true)
    assert.equal(await lock.ownerOf(tokenId), keyOwner)
    await lock.burn(tokenId, { from: keyOwner })
    assert.equal(await lock.getHasValidKey(keyOwner), false)
    assert.equal(await lock.ownerOf(tokenId), ADDRESS_ZERO)
  })

  it('emit a transfer event', async () => {
    const tx = await lock.burn(tokenId, { from: keyOwner })
    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
    assert.equal(args.to, ADDRESS_ZERO)
    assert.equal(args.from, keyOwner)
  })

  it('allow key manager to burn a key', async () => {
    await lock.setKeyManagerOf(tokenId, accounts[9], { from: keyOwner })
    assert.equal(await lock.getHasValidKey(keyOwner), true)
    assert.equal(await lock.ownerOf(tokenId), keyOwner)
    await lock.burn(tokenId, { from: accounts[9] })
    assert.equal(await lock.getHasValidKey(keyOwner), false)
    assert.equal(await lock.ownerOf(tokenId), ADDRESS_ZERO)
  })

  it('should work only on existing keys', async () => {
    await reverts(lock.burn(123), 'NO_SUCH_KEY')
  })

  it('should be callable only by owner', async () => {
    await reverts(
      lock.burn(tokenId, { from: accounts[5] }),
      'ONLY_KEY_MANAGER_OR_APPROVED'
    )
  })
})
