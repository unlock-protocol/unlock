// const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../../helpers/deployLocks')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks, operator, from, tokenId, data

contract('Lock Receiver', accounts => {
  operator = accounts[5]
  from = accounts[5]
  tokenId = 11
  data = Web3Utils.toHex('')

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

  describe('Implements IERC721Receiver interface', () => {
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
})
