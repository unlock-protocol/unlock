
const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks

contract('Lock ERC721', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock)
      })
      .then(_locks => {
        locks = _locks
      })
  })

  // from  transferFrom.js, ln#59:
  it.skip('should abort if the lock is private', async () => {
    await shouldFail(locks['PRIVATE']
      .transferFrom(from, to, tokenId, {
        from
      }), '')
  })

  it.skip('should abort if the lock is restricted', async () => {
    await shouldFail(locks['RESTRICTED']
      .transferFrom(from, to, tokenId, {
        from
      }), '')
  })
})
