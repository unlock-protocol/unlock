const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks

contract('Lock / erc721 / balanceOf', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock, accounts[0])
      })
      .then(_locks => {
        locks = _locks
      })
  })

  it('should fail if the user address is 0', async () => {
    await shouldFail(locks['FIRST'].balanceOf.call(Web3Utils.padLeft(0, 40)), 'INVALID_ADDRESS')
  })

  it('should return 0 if the user has no key', async () => {
    const balance = new BigNumber(await locks['FIRST'].balanceOf.call(accounts[3]))
    assert.equal(balance.toFixed(), 0)
  })

  it('should return 1 if the user has a non expired key', async () => {
    await locks['FIRST'].purchaseFor(accounts[1], {
      value: Units.convert('0.01', 'eth', 'wei'),
      from: accounts[1]
    })
    const balance = new BigNumber(await locks['FIRST'].balanceOf.call(accounts[1]))
    assert.equal(balance.toFixed(), 1)
  })

  it('should return 1 if the user has an expired key', async () => {
    await locks['FIRST'].purchaseFor(accounts[5], {
      value: Units.convert('0.01', 'eth', 'wei'),
      from: accounts[5]
    })
    await locks['FIRST'].expireKeyFor(accounts[5], {
      from: accounts[0]
    })
    const balance = new BigNumber(await locks['FIRST'].balanceOf.call(accounts[5]))
    assert.equal(balance.toFixed(), 1)
  })
})
