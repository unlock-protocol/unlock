const { assert } = require('chai')
const { ethers } = require('hardhat')

let bridge, daoTimelock, timelock, multisig, unlock, unlockOwner

const destDomainId = 1734439522

contract('UnlockOwner / constructor params', () => {
  before(async () => {
    ;[, bridge, unlock, timelock, daoTimelock, multisig] =
      await ethers.getSigners()

    // deploy unlock manager on remote chain
    const UnlockOwner = await ethers.getContractFactory('UnlockOwner')
    const { chainId } = await ethers.provider.getNetwork()

    unlockOwner = await UnlockOwner.deploy(
      bridge.address, // bridge
      unlock.address, // unlock
      daoTimelock.address, // timelockDao
      multisig.address, // multisig
      timelock.address, // timelock
      destDomainId, // domain,
      chainId // daoChainId
    )
  })
  describe('constructor stores', () => {
    it('bridge address', async () => {
      assert.equal(bridge.address, await unlockOwner.bridge())
    })

    it('Unlock address properly', async () => {
      assert.equal(await unlockOwner.unlock(), unlock.address)
    })

    it('the domain properly', async () => {
      assert.equal(await unlockOwner.domain(), destDomainId)
    })

    it('DAO Timelock address', async () => {
      assert.equal(daoTimelock.address, await unlockOwner.daoTimelock())
    })

    it('multisig address', async () => {
      assert.equal(daoTimelock.address, await unlockOwner.daoTimelock())
    })

    it('timelock address', async () => {
      assert.equal(timelock.address, await unlockOwner.timelock())
    })

    it('mainnet chainId', async () => {
      const { chainId } = await ethers.provider.getNetwork()
      assert.equal(await unlockOwner.daoChainId(), chainId)
    })
  })
})
