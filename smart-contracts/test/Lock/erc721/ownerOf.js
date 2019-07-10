const Units = require('ethereumjs-units')

const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../../helpers/proxy')

let unlock, locks

contract('Lock / erc721 / ownerOf', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should abort when the key has no owner', async () => {
    await shouldFail(locks['FIRST'].ownerOf.call(accounts[3]), 'NO_SUCH_KEY')
  })

  it('should return the owner of the key', async () => {
    await locks['FIRST'].purchase(accounts[1], web3.utils.padLeft(0, 40), {
      value: Units.convert('0.01', 'eth', 'wei'),
      from: accounts[1],
    })
    let ID = await locks['FIRST'].getTokenIdFor.call(accounts[1])
    let address = await locks['FIRST'].ownerOf.call(ID)
    assert.equal(address, accounts[1])
  })
})
