const { constants } = require('hardlydifficult-ethereum-contracts')
const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock
let locks

contract('Lock / erc721 / ownerOf', (accounts) => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should return 0x0 when key is nonexistent', async () => {
    let address = await locks.FIRST.ownerOf.call(42)
    assert.equal(address, constants.ZERO_ADDRESS)
  })

  it('should return the owner of the key', async () => {
    const tx = await locks.FIRST.purchase(
      [],
      [accounts[1]],
      [web3.utils.padLeft(0, 40)],
      [web3.utils.padLeft(0, 40)],
      [],
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
      [web3.utils.padLeft(0, 40)],
      [web3.utils.padLeft(0, 40)],
      [],
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
