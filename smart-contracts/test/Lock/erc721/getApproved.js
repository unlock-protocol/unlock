const Units = require('ethereumjs-units')
const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../../helpers/proxy')

let locks, ID

contract('Lock / erc721 / getApproved', accounts => {
  const keyPurchaser = accounts[3]

  before(async function() {
    this.unlock = await getProxy(unlockContract)
    locks = await deployLocks(this.unlock, accounts[0])
  })

  before(async function() {
    await locks['FIRST'].purchase(
      0,
      keyPurchaser,
      web3.utils.padLeft(0, 40),
      [],
      {
        value: Units.convert('0.01', 'eth', 'wei'),
        from: keyPurchaser,
      }
    )
    ID = await locks['FIRST'].getTokenIdFor.call(keyPurchaser)
  })

  describe('getApproved', () => {
    it('should fail if no one was approved for a key', async () => {
      await shouldFail(locks['FIRST'].getApproved.call(ID), 'NONE_APPROVED')
    })
  })
})
