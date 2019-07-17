const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock, locks

contract('Lock / erc721 / Non_Public_getApproved', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  let lockOwner

  before(() => {
    return locks['FIRST'].owner.call().then(_owner => {
      lockOwner = _owner
    })
  })
  // from approve.js, ln# 27:
  it.skip('should return the address of the approved owner for a key', () => {
    return locks['FIRST']
      .approve(accounts[3], accounts[3], {
        from: lockOwner,
      })
      .then(() => {
        return locks['FIRST'].getApproved.call(accounts[3])
      })
      .then(approved => {
        assert.equal(accounts[3], approved)
      })
  })
})
