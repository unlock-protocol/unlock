const deployLocks = require('../../helpers/deployLocks')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock

contract('Lock ERC721', (accounts) => {
  before(async () => {
    unlock = await Unlock.deployed()
    await deployLocks(unlock)
  })

  describe('safeTransferFrom', () => {
  })
})
