const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  deployContracts,
  deployLock,
  reverts,
  ADDRESS_ZERO,
  addSomeETH,
} = require('../helpers')

let unlock, lock, connext, bridgerSender, bridgeReceiver, keyPrice

const destChainId = 4

contract('Unlock / bridge', () => {
  before(async () => {
    ;({ unlockEthers: unlock } = await deployContracts())
    lock = await deployLock({ unlock })
    keyPrice = ethers.BigNumber.from((await lock.keyPrice()).toString())
    await addSomeETH(lock.address) // fund the lock
    await addSomeETH(lock.address) // fund the lock

    // receiver
    const BridgeReceiver = await ethers.getContractFactory(
      'UnlockBridgeReceiver'
    )
    bridgeReceiver = await BridgeReceiver.deploy()

    // connext
    const MockConnext = await ethers.getContractFactory('TestConnext')
    connext = await MockConnext.deploy(bridgeReceiver.address)

    // sender
    const BridgeSender = await ethers.getContractFactory('UnlockBridgeSender')
    bridgerSender = await BridgeSender.deploy(
      unlock.address,
      connext.address // set directly bridge receiver for testing purposes
    )

    // setup receiver
    await bridgerSender.setReceiverAddresses(
      destChainId,
      bridgeReceiver.address
    )
  })

  describe('Unlock.setBridgeSenderAddress', () => {
    it('default ot zero address', async () => {
      assert.equal(await unlock.bridgeAddress(), ADDRESS_ZERO)
    })
    it('stores bridger sender', async () => {
      await unlock.setBridgeSenderAddress(bridgerSender.address)
      assert.equal(bridgerSender.address, await unlock.bridgeAddress())
    })
    it('only contract owner can update', async () => {
      const [, signer] = await ethers.getSigners()
      await reverts(unlock.connect(signer).setBridgeSenderAddress(ADDRESS_ZERO))
    })
  })

  describe('UnlockBridgeSender', () => {
    it('set the bridge sender properly', async () => {
      assert.equal(
        await bridgerSender.receiverAddresses(destChainId),
        bridgeReceiver.address
      )
    })
    it('unlock address is set properly', async () => {
      assert.equal(await bridgerSender.unlockAddress(), unlock.address)
    })
    it('connextAddress address is set properly', async () => {
      assert.equal(await bridgerSender.connextAddress(), connext.address)
    })
  })

  describe('unlock.sendBridgedLockCall', () => {
    before(async () => {
      await bridgerSender.setReceiverAddresses(
        destChainId,
        bridgeReceiver.address
      )
    })
    it('purchase a key correctly', async () => {
      const isErc20 = false
      const signers = await ethers.getSigners()
      const keyOwners = [signers[3]]

      // parse purchase calldata
      const purchaseArgs = [
        isErc20 ? keyOwners.map(() => keyPrice) : [],
        keyOwners.map(({ address }) => address),
        keyOwners.map(() => ADDRESS_ZERO),
        keyOwners.map(() => ADDRESS_ZERO),
        keyOwners.map(() => []),
      ]

      const calldata = lock.interface.encodeFunctionData(
        'purchase',
        purchaseArgs
      )
      await unlock.sendBridgedLockCall(
        destChainId,
        lock.address,
        ADDRESS_ZERO,
        keyPrice,
        calldata,
        ethers.BigNumber.from(1000)
      )

      assert.equal(lock.balanceOf(signers[3]), 1)
    })
  })
})
