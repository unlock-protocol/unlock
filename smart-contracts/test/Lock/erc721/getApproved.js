const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Units = require('ethereumjs-units')
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../../helpers/proxy')

let locks, ID

contract('Lock / erc721 / getApproved', accounts => {
  const keyPurchaser = accounts[3]

  before(async function () {
    this.unlock = await getUnlockProxy(unlockContract)
    locks = await deployLocks(this.unlock, accounts[0])
  })

  before(async function () {
    await locks['FIRST'].purchaseFor(keyPurchaser, {
      value: Units.convert('0.01', 'eth', 'wei'),
      from: keyPurchaser
    })
    ID = await locks['FIRST'].getTokenIdFor.call(keyPurchaser)
  })

  describe('getApproved', () => {
    it('should fail if no one was approved for a key', async () => {
      await shouldFail(locks['FIRST'].getApproved.call(ID), 'NONE_APPROVED')
    })
  })
})
