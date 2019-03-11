const Web3Utils = require('web3-utils')

const deployLocks = require('../../helpers/deployLocks')
const network = 'dev-1984'
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../../helpers/proxy')

let unlock, locks, operator, from, tokenId, data

contract('Lock / erc721 / onERC721Received', accounts => {
  operator = accounts[5]
  from = accounts[5]
  tokenId = 11
  data = Web3Utils.toHex('')

  before(async () => {
    unlock = await getUnlockProxy(unlockContract, network)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should implement the onERC721Received() function', async function () {
    // PublicLock.onERC721Received.selector == 0x150b7a02`
    const ERC721_RECEIVED = 0x150b7a02
    const result = await locks['FIRST'].onERC721Received.call(
      operator,
      from,
      tokenId,
      data,
      {}
    )
    assert.equal(result, ERC721_RECEIVED)
  })
})
