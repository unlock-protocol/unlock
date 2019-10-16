const Units = require('ethereumjs-units')

const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock, locks

contract('Lock / erc721 / ownerOf', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should return 0 when there is no owner', async () => {
    const owner = await locks['FIRST'].ownerOf.call(accounts[3])
    assert.equal(owner, web3.utils.padLeft(0, 40))
  })

  it('should return the owner of the key', async () => {
    await locks['FIRST'].purchase(
      0,
      accounts[1],
      web3.utils.padLeft(0, 40),
      [],
      {
        value: Units.convert('0.01', 'eth', 'wei'),
        from: accounts[1],
      }
    )
    let ID = await locks['FIRST'].getTokenIdFor.call(accounts[1])
    let address = await locks['FIRST'].ownerOf.call(ID)
    assert.equal(address, accounts[1])
  })
})
