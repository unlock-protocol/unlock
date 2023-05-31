const { assert } = require('chai')
const { ethers } = require('hardhat')

const { reverts } = require('../helpers')

let bridge, daoTimelock, multisig, unlock, unlockOwner

const destDomainId = 1734439522

contract('UnlockOwner / change DAO chain', () => {
  before(async () => {
    ;[, bridge, unlock, daoTimelock, multisig] = await ethers.getSigners()

    // deploy unlock manager on remote chain
    const UnlockOwner = await ethers.getContractFactory('UnlockOwner')
    unlockOwner = await UnlockOwner.deploy(
      bridge.address, // bridge
      unlock.address, // unlock
      daoTimelock.address, // timelockDao
      multisig.address, // multisig
      destDomainId // domain
    )
  })

  describe('setDAOChain', () => {
    it('can only be called by the multisig', async () => {
      await reverts(unlockOwner.setDaoChain(5, 123), 'Unauthorized')
    })

    it('changes the chain and domain ids used to assert DAO', async () => {
      await unlockOwner.connect(multisig).setDaoChain(5, 123)
      assert.equal(await unlockOwner.daoChainId(), 5)
      assert.equal(await unlockOwner.daoDomainId(), 123)
    })
  })
})
