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

let unlockSrc,
  unlockDest,
  lock,
  connext,
  keyPrice,
  erc20,
  tokenAddress,
  unlockOwner,
  keyOwner,
  weth

// test for ERC20 and ETH
const scenarios = [true, false]

const srcChainId = 31337
const destChainId = 4
const srcDomainId = 1735353714
const destDomainId = 1734439522

const gasEstimate = 16000
const url = `http://locksmith:8080/api/key/`

contract('Unlock / bridge', () => {
  before(async () => {
    ;[unlockOwner, keyOwner] = await ethers.getSigners()

    // deploy weth & a token
    weth = await deployWETH(unlockOwner)
    erc20 = await deployERC20(unlockOwner, true)
    
    // connext
    const MockConnext = await ethers.getContractFactory('TestBridge')
    connext = await MockConnext.deploy(weth.address, srcDomainId)

    // fund the bridge
    await addSomeETH(connext.address)
    await erc20.mint(connext.address, ethers.utils.parseEther('100'))

    // source chain
    ;({ unlockEthers: unlockSrc } = await deployContracts())
    await unlockSrc.configUnlock(
      ADDRESS_ZERO, // udt
      weth.address, // wrappedEth
      gasEstimate,
      'SRC_KEY',
      url,
      srcChainId,
      connext.address // bridge
    )

    // destination chain
    ;({ unlockEthers: unlockDest } = await deployContracts())
    await unlockDest.configUnlock(
      ADDRESS_ZERO, // udt
      weth.address, // wrappedEth
      gasEstimate,
      'DEST_KEY',
      url,
      destChainId,
      connext.address // bridge
    )

    // setup receiver
    await unlockSrc.setUnlockAddresses(destChainId, destDomainId, unlockDest.address)
    await unlockDest.setUnlockAddresses(srcChainId, srcDomainId, unlockSrc.address)
  })

  describe('bridgeAddress', () => {
    it('stores bridger sender', async () => {
      assert.equal(connext.address, await unlockSrc.bridgeAddress())
      assert.equal(connext.address, await unlockDest.bridgeAddress())
    })
  })

  describe('unlockAddresses', () => {
    it('set the unlock address properly', async () => {
      assert.equal(
        await unlockSrc.unlockAddresses(destChainId),
        unlockDest.address
      )
      assert.equal(
        await unlockDest.unlockAddresses(srcChainId),
        unlockSrc.address
      )
    })
    
    it('set the domains and chainIds properly', async () => {
      assert.equal(
        await unlockSrc.domains(destChainId),
        destDomainId
      )
      assert.equal(
        await unlockSrc.chainIds(destDomainId),
        destChainId
      )
      assert.equal(
        await unlockDest.domains(srcChainId),
        srcDomainId
      )
      assert.equal(
        await unlockDest.chainIds(srcDomainId),
        srcChainId
      )
    })
    it('only unlock owner can call', async () => {
      reverts(
        unlockSrc.connect(keyOwner).setUnlockAddresses(destChainId, destDomainId, unlockDest.address),
        'ONLY_OWNER'
      )
    })
  })

  scenarios.forEach((isErc20) => {
    describe(`sendBridgedLockCall to lock priced in ${
      isErc20 ? 'ERC20' : 'ETH'
    }`, () => {
      beforeEach(async () => {
        // deploy a lock on destination chain
        tokenAddress = isErc20 ? erc20.address : ADDRESS_ZERO
        lock = await deployLock({ unlockDest, tokenAddress })
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
        await erc20.connect(keyOwner).approve(unlockSrc.address, keyPrice)

        assert.equal(await lock.balanceOf(keyOwner.address), 0)

        // send call from src > dest
        await unlockSrc
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
