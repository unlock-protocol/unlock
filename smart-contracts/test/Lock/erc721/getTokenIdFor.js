
const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../../helpers/deployLocks')
const Unlock = artifacts.require('../../Unlock.sol')

let unlock, locks

contract('Lock ERC721', (accounts) => {
  before(async () => {
    unlock = await Unlock.deployed()
    locks = await deployLocks(unlock)
  })

  describe('getTokenIdFor', () => {
    it('should abort when the key has no owner', async () => {
      try {
        await locks['FIRST'].getTokenIdFor(accounts[3])
        assert.fail('Expected revert')
      } catch (error) {
        assert.equal(error.message, 'VM Exception while processing transaction: revert No such key')
      }
    })

    it('should return the tokenId for the owner\'s key', async () => {
      await locks['FIRST'].purchaseFor(accounts[1], 'Satoshi', {
        value: Units.convert('0.01', 'eth', 'wei'),
        from: accounts[1]
      })
      let address = await locks['FIRST'].getTokenIdFor(accounts[1])
      // Note that as we implement ERC721 support, the tokenId will no longer
      // be the same as the user's address
      assert(address.eq(new BigNumber(accounts[1])))
    })
  })
})
