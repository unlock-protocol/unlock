const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  deployContracts,
  deployLock,
  reverts,
  ADDRESS_ZERO,
  addSomeETH,
  deployERC20,
} = require('../helpers')

let unlock, lock, connext, receiver, keyPrice, erc20, unlockOwner, keyOwner

const destChainId = 31337

contract('Unlock / bridge', () => {
  before(async () => {
    ;[unlockOwner, keyOwner] = await ethers.getSigners()
    ;({ unlockEthers: unlock } = await deployContracts())

    erc20 = await deployERC20(unlockOwner, true)
    lock = await deployLock({ unlock, tokenAddress: erc20.address })
    keyPrice = ethers.BigNumber.from((await lock.keyPrice()).toString())

    // connext
    const MockConnext = await ethers.getContractFactory('TestConnext')
    connext = await MockConnext.deploy()

    // fund the bridge
    await addSomeETH(connext.address)
    await erc20.mint(connext.address, ethers.utils.parseEther('100'))

    // TODO: delete receiver
    // we use a receiver for debugging purposes
    // just to fwd call to the lock
    const BridgeReceiver = await ethers.getContractFactory(
      'UnlockBridgeReceiver'
    )
    receiver = await BridgeReceiver.deploy()

    // setup receiver
    await unlock.setReceiverAddresses(destChainId, receiver.address)
    await erc20.mint(receiver.address, ethers.utils.parseEther('100'))
  })

  describe('unlock.setBridgeAddress', () => {
    it('default to zero address', async () => {
      assert.equal(await unlock.bridgeAddress(), ADDRESS_ZERO)
    })
    it('stores bridger sender', async () => {
      await unlock.setBridgeAddress(connext.address)
      assert.equal(connext.address, await unlock.bridgeAddress())
    })
    it('only contract owner can update', async () => {
      const [, , signer] = await ethers.getSigners()
      await reverts(unlock.connect(signer).setBridgeAddress(ADDRESS_ZERO))
    })
  })

  describe('UnlockBridgeReceiver', () => {
    it('set the bridge sender properly', async () => {
      assert.equal(
        await unlock.receiverAddresses(destChainId),
        receiver.address
      )
    })
  })

  describe('unlock.sendBridgedLockCall', () => {
    it('purchase a key correctly', async () => {
      const keyOwners = [keyOwner]

      // parse purchase calldata
      const purchaseArgs = [
        keyOwners.map(() => keyPrice),
        keyOwners.map(({ address }) => address),
        keyOwners.map(() => ADDRESS_ZERO),
        keyOwners.map(() => ADDRESS_ZERO),
        keyOwners.map(() => []),
      ]

      const interface = new ethers.utils.Interface(lock.abi)
      const calldata = interface.encodeFunctionData('purchase', purchaseArgs)

      // fee for the brdige
      const relayerFee = ethers.utils.parseEther('.005')

      // approve unlock
      await erc20.mint(keyOwner.address, keyPrice)
      await erc20.connect(keyOwner).approve(unlock.address, keyPrice)

      // fund lock for some gas
      await unlock
        .connect(keyOwner)
        .sendBridgedLockCall(
          destChainId,
          lock.address,
          erc20.address,
          keyPrice,
          calldata,
          relayerFee,
          {
            value: relayerFee,
          }
        )

      // make sure key owner now has a valid key
      assert.equal(await lock.balanceOf(keyOwner.address), 1)
    })
  })
})
