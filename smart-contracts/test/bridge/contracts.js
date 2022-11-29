const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  deployContracts,
  deployLock,
  reverts,
  ADDRESS_ZERO,
  addSomeETH,
  deployERC20,
  deployWETH,
} = require('../helpers')

let unlock,
  lock,
  connext,
  receiver,
  keyPrice,
  erc20,
  tokenAddress,
  unlockOwner,
  keyOwner,
  weth

// test for ERC20 and ETH
const scenarios = [true, false]
const destChainId = 4

contract('Unlock / bridge', () => {
  before(async () => {
    ;[unlockOwner, keyOwner] = await ethers.getSigners()
    ;({ unlockEthers: unlock } = await deployContracts())

    erc20 = await deployERC20(unlockOwner, true)
    weth = await deployWETH(unlockOwner)

    // connext
    const MockConnext = await ethers.getContractFactory('TestConnext')
    connext = await MockConnext.deploy(weth.address)

    // fund the bridge
    await addSomeETH(connext.address)
    await erc20.mint(connext.address, ethers.utils.parseEther('100'))

    // TODO: delete receiver
    // we use a receiver for debugging purposes
    // just to fwd call to the lock
    const BridgeReceiver = await ethers.getContractFactory(
      'UnlockBridgeReceiver'
    )
    receiver = await BridgeReceiver.deploy(weth.address)

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

  scenarios.forEach((isErc20) => {
    describe(`unlock.sendBridgedLockCall to lock priced in ${
      isErc20 ? 'ERC20' : 'ETH'
    }`, () => {
      beforeEach(async () => {
        tokenAddress = isErc20 ? erc20.address : ADDRESS_ZERO
        lock = await deployLock({ unlock, tokenAddress })
        keyPrice = ethers.BigNumber.from((await lock.keyPrice()).toString())
      })

      it('purchase a key properly', async () => {
        // parse purchase calldata
        const purchaseArgs = [
          isErc20 ? [keyPrice] : [],
          [keyOwner.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
        ]

        const interface = new ethers.utils.Interface(lock.abi)
        const calldata = interface.encodeFunctionData('purchase', purchaseArgs)

        // fee for the brdige
        const relayerFee = ethers.utils.parseEther('.005')
        const value = isErc20 ? relayerFee : relayerFee.add(keyPrice)

        // approve unlock
        await erc20.mint(keyOwner.address, keyPrice)
        await erc20.connect(keyOwner).approve(unlock.address, keyPrice)

        // set weth in unlock
        await unlock.configUnlock(
          ADDRESS_ZERO, // da
          weth.address, // wrappedEth
          16000,
          'BRIDGED_KEY',
          `http://localhost:3000/api/key/`,
          31337
        )

        assert.equal(await lock.balanceOf(keyOwner.address), 0)

        // fund lock for some gas
        await unlock
          .connect(keyOwner)
          .sendBridgedLockCall(
            destChainId,
            lock.address,
            tokenAddress,
            keyPrice,
            calldata,
            relayerFee,
            {
              value,
            }
          )

        // make sure key owner now has a valid key
        assert.equal(await lock.balanceOf(keyOwner.address), 1)
      })
    })
  })
})
