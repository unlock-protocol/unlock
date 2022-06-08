const deployLocks = require('../../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../../helpers/constants')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../../helpers/truffle-artifacts')

let unlock
let locks

contract('Lock / erc721 / ownerOf', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    await locks.FIRST.setMaxKeysPerAddress(10)
  })

  it('should return 0x0 when key is nonexistent', async () => {
    let address = await locks.FIRST.ownerOf.call(42)
    assert.equal(address, ADDRESS_ZERO)
  })

  it('should return the owner of the key', async () => {
    const tx = await locks.FIRST.purchase(
      [],
      [accounts[1]],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: web3.utils.toWei('0.01', 'ether'),
        from: accounts[1],
      }
    )
    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    let address = await locks.FIRST.ownerOf.call(args.tokenId)
    assert.equal(address, accounts[1])
  })

  it('should work correctly after a transfer', async () => {
    const tx = await locks.FIRST.purchase(
      [],
      [accounts[1]],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: web3.utils.toWei('0.01', 'ether'),
        from: accounts[1],
      }
    )
    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    let address = await locks.FIRST.ownerOf.call(args.tokenId)
    assert.equal(address, accounts[1])

    // transfer
    await locks.FIRST.transferFrom(accounts[1], accounts[7], args.tokenId, {
      from: accounts[1],
    })
    assert.equal(await locks.FIRST.ownerOf.call(args.tokenId), accounts[7])
  })
})
