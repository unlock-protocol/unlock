// testing Bridge using a MockBridge contract
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants')
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

let bridge, daoTimelock, timelock, multisig, unlock, unlockOwner, proxyAdmin

const PROPOSER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('PROPOSER_ROLE')
)

contract('UnlockOwner / bridged governance', () => {
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

    // deploy a timelock
    const Timelock = await ethers.getContractFactory('TimelockController')
    const minDelay = 60 * 60 * 24 * 2 // twoDaysInSeconds

    timelock = await Timelock.deploy(
      minDelay, // minDelay before execution
      [multisig.address], // proposers
      [ADDRESS_ZERO], // executors - allow any address to execute a proposal once the timelock has expired
      multisig.address // admin
    )

    // deploy unlock manager on remote chain
    const UnlockOwner = await ethers.getContractFactory('UnlockOwner')
    const { chainId } = await ethers.provider.getNetwork()

    unlockOwner = await UnlockOwner.deploy(
      bridge.address,
      unlock.address,
      daoTimelock.address, // dao address on mainnet
      timelock.address,
      multisig.address,
      destDomainId,
      chainId
    )

    // add UnlockOwner as proposer
    await timelock
      .connect(multisig)
      .grantRole(PROPOSER_ROLE, unlockOwner.address)

    // transfer assets to unlockOwner on dest chain
    proxyAdmin = await getProxyAdmin(unlock.address)
    await proxyAdmin.transferOwnership(unlockOwner.address)
    await unlock.transferOwnership(unlockOwner.address)
  })

  describe('change Unlock settings', () => {
    let calldata, args
    beforeEach(async () => {
      ;({ calldata, args } = await deployPublicLockImpl())
    })

    it('settings updated correctly', async () => {
      // make sure settings were ok before
      assert.equal(await unlock.publicLockImpls(args[1]), ADDRESS_ZERO)
      assert.equal(await unlock.publicLockVersions(args[0]), 0)

      // send through the DAO > mainnet manager > bridge path
      await bridge.connect(daoTimelock).xcall(
        destChainId,
        unlockOwner.address,
        ZERO_ADDRESS, // asset
        ZERO_ADDRESS, // delegate
        0, // amount
        30, // slippage
        calldata
      )

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
    })
    it('updated proxy impl correctly', async () => {
      // send through the dispatcher
      await bridge
        .connect(daoTimelock)
        .xcall(
          destChainId,
          unlockOwner.address,
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          0,
          30,
          calldata
        )

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
    let calldata
    before(async () => {
      ;({ calldata } = await deployPublicLockImpl())
    })

    it('reverts is xReceive has not been called through the bridge', async () => {
      await reverts(
        unlockOwner.xReceive(
          ethers.utils.formatBytes32String('test'), // transferId
          0, // amount
          ADDRESS_ZERO, //currency
          daoTimelock.address, // caller on origin chain
          destDomainId,
          calldata
        ),
        'Unauthorized'
      )
    })

    it('reverts is xcall has not been called by the DAO', async () => {
      await reverts(
        bridge.xcall(
          destChainId,
          unlockOwner.address,
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          0,
          30,
          calldata
        ),
        'Unauthorized'
      )
    })
  })
})
