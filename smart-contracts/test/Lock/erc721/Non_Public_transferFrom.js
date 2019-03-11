const deployLocks = require('../../helpers/deployLocks')
const network = 'dev-1984'
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../../helpers/proxy')

let unlock

contract('Lock / erc721 / Non_Public_transferFrom', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract, network)
    await deployLocks(unlock, accounts[0])
  })

  // from  transferFrom.js, ln#59:
  it.skip('should abort if the lock is private', async () => {
    // await shouldFail(locks['PRIVATE']
    //   .transferFrom(from, to, tokenId, {
    //     from
    //   }), '')
  })

  it.skip('should abort if the lock is restricted', async () => {
    // await shouldFail(locks['RESTRICTED']
    //   .transferFrom(from, to, tokenId, {
    //     from
    //   }), '')
  })
})
