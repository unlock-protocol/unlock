const { assert } = require('chai')
const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('../helpers')

let bridge, daoTimelock, multisig, unlock, unlockOwner

const destDomainId = 1734439522

const PROPOSER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('PROPOSER_ROLE')
)

const CANCELLER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('CANCELLER_ROLE')
)

const EXECUTOR_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('EXECUTOR_ROLE')
)

contract('UnlockOwner / constructor params', () => {
  before(async () => {
    ;[, bridge, unlock, daoTimelock, multisig] = await ethers.getSigners()

    // deploy unlock manager on remote chain
    const UnlockOwner = await ethers.getContractFactory('UnlockOwner')
    const { chainId } = await ethers.provider.getNetwork()

    unlockOwner = await UnlockOwner.deploy(
      bridge.address, // bridge
      unlock.address, // unlock
      daoTimelock.address, // timelockDao
      multisig.address, // multisig
      destDomainId, // domain,
      chainId // daoChainId
    )
  })
  describe('stores value correctyl', () => {
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

    it('mainnet chainId', async () => {
      const { chainId } = await ethers.provider.getNetwork()
      assert.equal(await unlockOwner.daoChainId(), chainId)
    })
  })

  describe('timelock roles are set properly', () => {
    it('unlockOwner is proposer', async () => {
      assert.equal(
        await unlockOwner.hasRole(PROPOSER_ROLE, unlockOwner.address),
        true
      )
    })
    it('multisig is canceller', async () => {
      assert.equal(
        await unlockOwner.hasRole(CANCELLER_ROLE, multisig.address),
        true
      )
    })
    it('anyone is executor', async () => {
      assert.equal(await unlockOwner.hasRole(EXECUTOR_ROLE, ADDRESS_ZERO), true)
    })
  })
})
