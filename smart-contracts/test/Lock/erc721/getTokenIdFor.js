const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock, locks

contract('Lock / erc721 / getTokenIdFor', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
  })

  it('should abort when the key has no owner', async () => {
    await shouldFail(
      locks['FIRST'].getTokenIdFor.call(accounts[3]),
      'KEY_NOT_VALID'
    )
  })

  it("should return the tokenId for the owner's key", async () => {
    await locks['FIRST'].purchase(
      0,
      accounts[1],
      web3.utils.padLeft(0, 40),
      [],
      {
        value: Units.convert('0.01', 'eth', 'wei'),
        from: accounts[1],
      }
    )
    let ID = new BigNumber(await locks['FIRST'].getTokenIdFor.call(accounts[1]))
    // Note that as we implement ERC721 support, the tokenId will no longer
    // be the same as the user's address
    assert(ID.eq(1))
  })
})
