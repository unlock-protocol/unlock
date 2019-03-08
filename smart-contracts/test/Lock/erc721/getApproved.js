const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Zos = require('zos')
const TestHelper = Zos.TestHelper
const Units = require('ethereumjs-units')
const { ZWeb3, Contracts } = require('zos-lib')
ZWeb3.initialize(web3.currentProvider)
const Unlock = Contracts.getFromLocal('Unlock')

let locks, ID

contract('Lock / erc721 / getApproved', accounts => {
  const proxyAdmin = accounts[1]
  const unlockOwner = accounts[2]
  const keyPurchaser = accounts[3]

  before(async function () {
    this.project = await TestHelper({ from: proxyAdmin })
    this.proxy = await this.project.createProxy(Unlock, {
      initMethod: 'initialize',
      initArgs: [unlockOwner],
      initFrom: unlockOwner
    })
    this.unlock = await Unlock.at(this.proxy.address)
    locks = await deployLocks(this.unlock, accounts[0])
  })

  before(async function () {
    await locks['FIRST'].purchaseFor(
      keyPurchaser,
      {
        value: Units.convert('0.01', 'eth', 'wei'),
        from: keyPurchaser
      }
    )
    ID = await locks['FIRST'].getTokenIdFor.call(keyPurchaser)
  })

  describe('getApproved', () => {
    it('should fail if no one was approved for a key', async () => {
      await shouldFail(
        locks['FIRST'].getApproved.call(ID),
        'NONE_APPROVED'
      )
    })
  })
})
