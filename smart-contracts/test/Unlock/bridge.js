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
  erc20Src,
  erc20Dest,
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

    // ERC20s on each chain
    erc20Src = await deployERC20(unlockOwner, true)
    erc20Dest = await deployERC20(unlockOwner, true)
    
    // connext
    const MockConnext = await ethers.getContractFactory('TestBridge')
    connext = await MockConnext.deploy(
      weth.address, 
      srcDomainId,
      // both token mentioned for the swap
      erc20Src.address, 
      erc20Dest.address
    )

    // fund the bridge
    await addSomeETH(connext.address)
    await erc20Dest.mint(connext.address, ethers.utils.parseEther('100'))

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
      let tx 
      beforeEach(async () => {
        // deploy a lock priced on destination chain
        const tokenAddress = isErc20 ? erc20Dest.address : ADDRESS_ZERO
        lock = await deployLock({ unlockDest, tokenAddress })
        keyPrice = ethers.BigNumber.from((await lock.keyPrice()).toString())
      })

      describe('purchase', () => {
        beforeEach(async () => {
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

          // calculate fee for the brdige
          const relayerFee = ethers.utils.parseEther('.005')
          const value = isErc20 ? relayerFee : relayerFee.add(keyPrice)

          if (isErc20) {
            // give user some tokens on origin chain
            await erc20Src.mint(keyOwner.address, keyPrice)
            // allow unlock on src chain to get his tokens (to send to bridge)
            await erc20Src.connect(keyOwner).approve(unlockSrc.address, keyPrice)
          }

          assert.equal(await lock.balanceOf(keyOwner.address), 0)

          // send call from src > dest
          tx = await unlockSrc
            .connect(keyOwner)
            .sendBridgedLockCall(
              destChainId,
              lock.address,
              isErc20 ? erc20Src.address : ADDRESS_ZERO, // erc20 from src chain
              keyPrice,
              calldata,
              relayerFee,
              {
                value,
              }
            )
        })

        it('purchase a key properly', async () => {
          // make sure key owner now has a valid key
          assert.equal(await lock.balanceOf(keyOwner.address), 1)
        })
  
        // TODO: test events
        it('emits an event when sending to bridge', async () => {
          const { events, blockNumber } = await tx.wait()
          const { timestamp } = await ethers.provider.getBlock(blockNumber)
  
          const { args: argsEmitted } = events.find(({event}) => event === 'BridgeCallEmitted')
          assert.equal(argsEmitted.destChainId.toNumber(), destChainId)
          assert.equal(argsEmitted.unlockAddress, unlockDest.address)
          assert.equal(argsEmitted.lockAddress,  lock.address)
          assert.equal(argsEmitted.transferID, timestamp)
          
          const { args: argsReceived } = events.find(({event}) => event === 'BridgeCallReceived')
          assert.equal(argsReceived.originChainId.toNumber(), srcChainId)
          assert.equal(argsReceived.lockAddress,  lock.address)
          assert.equal(argsReceived.transferID, timestamp)
        })
      })

      

      // it('emits an event when receiving from bridge', async () => {
      //   unlockDest.find
      // })

      // TODO: test bridge source modifiers
      // TODO: test extend
    })
  })
})
