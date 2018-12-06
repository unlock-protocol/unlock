const deployLocks = require('../../helpers/deployLocks')
const Unlock = artifacts.require('../../Unlock.sol')
const Zos = require('zos')
const TestHelper = Zos.TestHelper

let unlock, locks

contract('Lock ERC721', (accounts) => {
  const proxyAdmin = accounts[1]
  const unlockOwner = accounts[2]

  before(async function () {
    const project = await TestHelper({ from: proxyAdmin })
    const proxy = await project.createProxy(Unlock, { initMethod: 'initialize', initArgs: [unlockOwner], initFrom: unlockOwner })
    const unlock = await Unlock.at(proxy.address)
    locks = await deployLocks(unlock)
  })

  describe('getApproved', () => {
    let lockOwner

    before(() => {
      return locks['FIRST'].owner().then((_owner) => {
        lockOwner = _owner
      })
    })

    it('should fail if no one was approved for a key', () => {
      return locks['FIRST'].getApproved(accounts[1])
        .then(() => {
          assert(false, 'this should have failed')
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
        })
    })
  })
})
