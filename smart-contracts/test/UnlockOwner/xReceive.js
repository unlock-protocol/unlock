// testing Bridge using a MockBridge contract
const { time } = require('@openzeppelin/test-helpers')
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

let bridge,
  daoTimelock,
  timelock,
  multisig,
  unlock,
  unlockOwner,
  proxyAdmin,
  someGuy

const minDelay = 60 * 60 * 24 * 2 // twoDaysInSeconds
const PROPOSER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('PROPOSER_ROLE')
)

contract('UnlockOwner / xReceive (calls coming across the bridge)', () => {
  before(async () => {
    ;[, daoTimelock, multisig, someGuy] = await ethers.getSigners()

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
      multisig.address,
      timelock.address,
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

  describe('timelock', () => {
    let unlockCallData, calldata, events, scheduleId, transferId
    beforeEach(async () => {
      // parse a simple tweak in Unlock settings
      const { interface } = await ethers.getContractFactory('Unlock')
      unlockCallData = interface.encodeFunctionData('setProtocolFee', [
        ethers.utils.parseEther('0.0001'),
      ])
      calldata = ethers.utils.defaultAbiCoder.encode(
        ['uint8', 'bytes'],
        [1, unlockCallData]
      )

      // send call
      const tx = await bridge.connect(daoTimelock).xcall(
        destChainId,
        unlockOwner.address,
        ADDRESS_ZERO, // asset
        ADDRESS_ZERO, // delegate
        0, // amount
        30, // slippage
        calldata
      )

      // parse events logs
      const { events: txEvents } = await tx.wait()

      // parse events from Unlock Owner and Timelock
      const { interface: UnlockOwnerInterface } =
        await ethers.getContractFactory('UnlockOwner')
      const { interface: TimelockInterface } = timelock

      events = txEvents.map((d) => {
        try {
          return UnlockOwnerInterface.parseLog(d)
        } catch (error) {
          try {
            return TimelockInterface.parseLog(d)
          } catch (error) {
            return {}
          }
        }
      })
      ;({
        args: { id: scheduleId },
      } = events.find(({ name }) => name === 'CallScheduled'))
    })

    it('is configured properly', async () => {
      assert.equal(await unlockOwner.timelock(), timelock.address)
      assert.equal(await timelock.getMinDelay(), minDelay)
    })

    it('fire events properly', async () => {
      const { args: bridgeCallReceived } = events.find(
        ({ name }) => name === 'BridgeCallReceived'
      )
      const { args: operationScheduled } = events.find(
        ({ name }) => name === 'UnlockOperationScheduled'
      )
      assert.equal(bridgeCallReceived.transferId, operationScheduled.transferId)
      assert.equal(operationScheduled.action, 1)
      assert.equal(operationScheduled.contractToCall, unlock.address)
      assert.equal(operationScheduled.execCallData, unlockCallData)

      transferId = bridgeCallReceived.transferId

      // timelock event
      const { args: timelockEvent } = events.find(
        ({ name }) => name === 'CallScheduled'
      )
      assert.equal(timelockEvent.target, unlock.address)
      assert.equal(timelockEvent.value, 0)
      assert.equal(
        timelockEvent.predecessor,
        ethers.utils.formatBytes32String('')
      )
      assert.equal(timelockEvent.delay, minDelay)
      assert.equal(timelockEvent.data, unlockCallData)
    })

    it('hold operations in lock before executing them', async () => {
      assert.equal(await timelock.isOperation(scheduleId), true)
      assert.equal(await timelock.isOperationPending(scheduleId), true)
      assert.equal(await timelock.isOperationReady(scheduleId), false)
    })

    it('allow multisig to cancel actions while on hold', async () => {
      await timelock.connect(multisig).cancel(scheduleId)
      assert.equal(await timelock.isOperationReady(scheduleId), false)
      assert.equal(await timelock.isOperation(scheduleId), false)
    })

    it('allow anyone to execute operations when time is ripe', async () => {
      assert.equal(await timelock.isOperationReady(scheduleId), false)

      // advance time to expiration
      const expirationTs = await timelock.getTimestamp(scheduleId)
      await time.increaseTo(expirationTs.toNumber())

      assert.equal(await timelock.isOperationReady(scheduleId), true)
      assert.equal(await timelock.isOperationDone(scheduleId), false)

      // TODO: this reverts because the timelock is NOT the owner of Unlock
      await timelock
        .connect(someGuy)
        .execute(
          unlock.address,
          0,
          unlockCallData,
          ethers.utils.formatBytes32String(''),
          transferId
        )
      assert.equal(await timelock.isOperationDone(scheduleId), true)
    })
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
        ADDRESS_ZERO, // asset
        ADDRESS_ZERO, // delegate
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
          ADDRESS_ZERO,
          ADDRESS_ZERO,
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
          ADDRESS_ZERO,
          ADDRESS_ZERO,
          0,
          30,
          calldata
        ),
        'Unauthorized'
      )
    })
  })
})
