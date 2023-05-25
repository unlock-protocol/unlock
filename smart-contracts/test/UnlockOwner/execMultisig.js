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

let bridge, daoTimelock, multisig, timelock, unlock, unlockOwner, proxyAdmin

contract('UnlockOwner / execMultisig', () => {
  before(async () => {
    ;[, daoTimelock, timelock, multisig] = await ethers.getSigners()

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
    const { chainId } = await ethers.provider.getNetwork()

    unlockOwner = await UnlockOwner.deploy(
      bridge.address,
      unlock.address,
      daoTimelock.address, // dao address on mainnet
      multisig.address,
      timelock.address, // timelock
      destDomainId,
      chainId
    )

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
    it('via multisig', async () => {
      // make sure settings were ok before
      assert.notEqual(await unlock.publicLockImpls(args[1]), template.address)
      assert.equal(await unlock.publicLockVersions(args[0]), 0)

      // send through the DAO > mainnet manager > bridge path
      await unlockOwner.connect(multisig).execMultisig(calldata)

      // make sure things have worked correctly
      assert.equal(await unlock.publicLockVersions(args[0]), args[1])
      assert.equal(await unlock.publicLockImpls(args[1]), args[0])
    })
  })

  describe('update proxied contract via proxyAdmin', () => {
    let calldata, unlockUpgraded
    beforeEach(async () => {
      ;({ calldata, unlockUpgraded } = await deployUnlockImpl({
        unlockAddress: unlock.address,
      }))
      // send directly thru multisig
      await unlockOwner.connect(multisig).execMultisig(calldata)
    })
    it('update proxy impl correctly', async () => {
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
    it('reverts if not called by multisig', async () => {
      await reverts(unlockOwner.execMultisig('0x'), 'Unauthorized')
    })
  })
})
