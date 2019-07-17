const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock

contract('Lock / erc721 / Non_Public_transferFrom', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
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
