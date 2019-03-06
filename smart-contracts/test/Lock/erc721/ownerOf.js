const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks

contract('Lock / erc721 / ownerOf', accounts => {
  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should abort when the key has no owner', async () => {
    await shouldFail(locks['FIRST'].ownerOf.call(accounts[3]), 'NO_SUCH_KEY')
  })

  it('should return the owner of the key', async () => {
    await locks['FIRST'].purchaseFor(
      accounts[1],
      Web3Utils.toHex('Satoshi'),
      {
        value: Units.convert('0.01', 'eth', 'wei'),
        from: accounts[1]
      }
    )
    let ID = await locks['FIRST'].getTokenIdFor.call(accounts[1])
    let address = await locks['FIRST'].ownerOf.call(ID)
    assert.equal(address, accounts[1])
  })
})
