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

let bridge, daoTimelock, multisig, unlock, unlockOwner, proxyAdmin, someGuy

const minDelay = 60 * 60 * 24 * 2 // twoDaysInSeconds

// parse events from Unlock Owner / Timelock
const parseEvents = async (txEvents) => {
  const { interface: UnlockOwnerInterface } = await ethers.getContractFactory(
    'UnlockOwner'
  )

  return txEvents.map((d) => {
    try {
      return UnlockOwnerInterface.parseLog(d)
    } catch (error) {
      return {}
    }
  })
}
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

    // deploy unlock manager on remote chain
    const UnlockOwner = await ethers.getContractFactory('UnlockOwner')
    unlockOwner = await UnlockOwner.deploy(
      bridge.address,
      unlock.address,
      daoTimelock.address, // dao address on mainnet
      multisig.address,
      destDomainId
    )

    await unlockOwner.connect(multisig).setDaoChainId(31337, 6648936)

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
      events = await parseEvents(txEvents)
      ;({
        args: { id: scheduleId },
      } = events.find(({ name }) => name === 'CallScheduled'))
    })

    it('is configured properly', async () => {
      assert.equal(await unlockOwner.getMinDelay(), minDelay)
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
      assert.equal(operationScheduled.scheduleId, scheduleId)

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
      assert.equal(await unlockOwner.isOperation(scheduleId), true)
      assert.equal(await unlockOwner.isOperationPending(scheduleId), true)
      assert.equal(await unlockOwner.isOperationReady(scheduleId), false)
    })

    it('allow multisig to cancel actions while on hold', async () => {
      await unlockOwner.connect(multisig).cancel(scheduleId)
      assert.equal(await unlockOwner.isOperationReady(scheduleId), false)
      assert.equal(await unlockOwner.isOperation(scheduleId), false)
    })

    it('allow anyone to execute operations when time is ripe', async () => {
      assert.equal(await unlockOwner.isOperationReady(scheduleId), false)

      // advance time to expiration
      const expirationTs = await unlockOwner.getTimestamp(scheduleId)
      await time.increaseTo(expirationTs.toNumber())

      assert.equal(await unlockOwner.isOperationReady(scheduleId), true)
      assert.equal(await unlockOwner.isOperationDone(scheduleId), false)

      await unlockOwner
        .connect(someGuy)
        .execute(
          unlock.address,
          0,
          unlockCallData,
          ethers.utils.formatBytes32String(''),
          transferId
        )

      assert.equal(
        (await unlock.protocolFee()).toString(),
        ethers.utils.parseEther('0.0001').toString()
      )
      // assert.equal(await unlockOwner.isOperationDone(scheduleId), true)
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
      const tx = await bridge.connect(daoTimelock).xcall(
        destChainId,
        unlockOwner.address,
        ADDRESS_ZERO, // asset
        ADDRESS_ZERO, // delegate
        0, // amount
        30, // slippage
        calldata
      )

      // get timelock operation
      const { events: txEvents } = await tx.wait()
      const events = await parseEvents(txEvents)
      const {
        args: { transferId, scheduleId, execCallData },
      } = events.find(({ name }) => name === 'UnlockOperationScheduled')

      // advance time to expiration
      const expirationTs = await unlockOwner.getTimestamp(scheduleId)
      await time.increaseTo(expirationTs.toNumber())

      // execute timelock operation
      await unlockOwner
        .connect(someGuy)
        .execute(
          unlock.address,
          0,
          execCallData,
          ethers.utils.formatBytes32String(''),
          transferId
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
      const tx = await bridge
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

      // get timelock operation
      const { events: txEvents } = await tx.wait()
      const events = await parseEvents(txEvents)
      const {
        args: { transferId, scheduleId, contractToCall, execCallData },
      } = events.find(({ name }) => name === 'UnlockOperationScheduled')

      // advance time to expiration
      const expirationTs = await unlockOwner.getTimestamp(scheduleId)
      await time.increaseTo(expirationTs.toNumber() + 1)

      // execute timelock operation
      await unlockOwner
        .connect(someGuy)
        .execute(
          contractToCall,
          0,
          execCallData,
          ethers.utils.formatBytes32String(''),
          transferId
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
