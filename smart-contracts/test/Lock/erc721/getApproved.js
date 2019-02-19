const deployLocks = require('../../helpers/deployLocks')
const shouldFail = require('../../helpers/shouldFail')
const Unlock = artifacts.require('../../Unlock.sol')
const Zos = require('zos')
const TestHelper = Zos.TestHelper
const Web3Utils = require('web3-utils')
const Units = require('ethereumjs-units')

let locks, ID

contract('Lock ERC721', accounts => {
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
    locks = await deployLocks(this.unlock)
  })

  describe('getApproved', () => {
    let lockOwner

    before(() => {
      return locks['FIRST'].owner.call().then(_owner => {
        lockOwner = _owner
      })
    })
    before(async function () {
      await locks['FIRST'].purchaseFor(
        keyPurchaser,
        Web3Utils.toHex('Vitalik'),
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
          'No approved recipient exists'
        )
      })
    })
  })
})
