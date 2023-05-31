const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  deployUnlockImpl,
  deployPublicLockImpl,
  destChainId,
  destDomainId,
} = require('./_helpers')

const {
  deployContracts,
  reverts,
  ADDRESS_ZERO,
  deployBridge,
  getProxyAdmin,
} = require('../helpers')

let bridge, daoTimelock, multisig, unlock, unlockOwner, proxyAdmin

contract('UnlockOwner / execDAO (directly from DAO without bridge)', () => {
  before(async () => {
    ;[, daoTimelock, multisig] = await ethers.getSigners()

    // mock bridge
    ;({ bridge } = await deployBridge())

    // deploy and set Unlock on a remote chain
    ;({ unlockEthers: unlock } = await deployContracts())
    await unlock.configUnlock(
      ADDRESS_ZERO, // udt
      ADDRESS_ZERO, // wrappedEth
      16000, // gasEstimate
      'DEST_KEY',
      `http://locksmith:8080/api/key/`,
      destChainId
    )

    // deploy unlock manager on remote chain
    const UnlockOwner = await ethers.getContractFactory('UnlockOwner')
    unlockOwner = await UnlockOwner.deploy(
      bridge.address,
      unlock.address,
      daoTimelock.address, // dao address on mainnet
      multisig.address,
      destDomainId
    )

    // set DAO chainId correctly
    await unlockOwner.connect(multisig).setDaoChain(31337, 6648936)

    // transfer assets to unlockOwner on dest chain
    proxyAdmin = await getProxyAdmin(unlock.address)
    await proxyAdmin.transferOwnership(unlockOwner.address)
    await unlock.transferOwnership(unlockOwner.address)
  })

  describe('can change Unlock settings', () => {
    let calldata, args, template
    beforeEach(async () => {
      ;({ calldata, args, template } = await deployPublicLockImpl())
    })
    it('settings updated correctly', async () => {
      assert.notEqual(await unlock.publicLockImpls(args[1]), template.address)
      await unlockOwner.connect(daoTimelock).execDAO(calldata)
      assert.equal(await unlock.publicLockImpls(args[1]), template.address)
    })
  })

  describe('update proxied contract via proxyAdmin', () => {
    let calldata, unlockUpgraded
    beforeEach(async () => {
      ;({ calldata, unlockUpgraded } = await deployUnlockImpl({
        unlockAddress: unlock.address,
      }))
      await unlockOwner.connect(daoTimelock).execDAO(calldata)
    })
    it('updates proxy impl correctly', async () => {
      const unlockAfterUpgrade = await ethers.getContractAt(
        'TestUnlockUpgraded',
        unlock.address
      )
      assert.equal(
        await unlockAfterUpgrade.getImplAddress(),
        unlockUpgraded.address
      )
    })
  })

  describe('reverts', () => {
    it('reverts if not called by DAO itself', async () => {
      await reverts(unlockOwner.execDAO('0x'), 'Unauthorized')
    })
  })
})
