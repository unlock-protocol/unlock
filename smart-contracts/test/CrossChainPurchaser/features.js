// testing Bridge using a MockBridge contract
const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  deployLock,
  purchaseKey,
  reverts,
  ADDRESS_ZERO,
  addSomeETH,
  deployERC20,
  deployWETH,
} = require('../helpers')

let purchaserDest,
  purchaserSrc,
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

const defaultCalldata = '0x3381899700000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
const slippage = 30

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

    const UnlockCrossChainPurchaser = await ethers.getContractFactory('UnlockCrossChainPurchaser')

    // source chain
    purchaserSrc = await UnlockCrossChainPurchaser.deploy(
      connext.address, // bridge
      weth.address
    )

    // destination chain
    purchaserDest = await UnlockCrossChainPurchaser.deploy(
      connext.address, // bridge
      weth.address
    )

    // setup receiver
    await purchaserSrc.setCrossChainPurchasers([destChainId], [destDomainId], [purchaserDest.address])
    await purchaserDest.setCrossChainPurchasers([srcChainId], [srcDomainId], [purchaserSrc.address])
  })

  describe('bridgeAddress', () => {
    it('stores bridger sender', async () => {
      assert.equal(connext.address, await purchaserDest.bridgeAddress())
      assert.equal(connext.address, await purchaserDest.bridgeAddress())
    })
  })

  describe('crossChainPurchasers', () => {
    it('set the unlock address properly', async () => {
      assert.equal(
        await purchaserSrc.crossChainPurchasers(destChainId),
        purchaserDest.address
      )
      assert.equal(
        await purchaserDest.crossChainPurchasers(srcChainId),
        purchaserSrc.address
      )
    })
    
    it('set the domains and chainIds properly', async () => {
      assert.equal(
        await purchaserSrc.domains(destChainId),
        destDomainId
      )
      assert.equal(
        await purchaserSrc.chainIds(destDomainId),
        destChainId
      )
      assert.equal(
        await purchaserDest.domains(srcChainId),
        srcDomainId
      )
      assert.equal(
        await purchaserDest.chainIds(srcDomainId),
        srcChainId
      )
    })

    it('only unlock owner can call', async () => {
      reverts(
        purchaserSrc.connect(keyOwner).setCrossChainPurchasers([destChainId], [destDomainId], [purchaserDest.address]),
        'owner'
      )
    })
  })

  describe('sendBridgedLockCall', () => {
    it('reverts if dest is not an unlock contract', async () => {
      const lock = await deployLock()
      keyPrice = ethers.BigNumber.from((await lock.keyPrice()).toString())
      await reverts (
        purchaserSrc
            .connect(keyOwner)
            .sendBridgedLockCall(
              1, // chain id
              lock.address,
              ADDRESS_ZERO, // currency
              keyPrice, // keyPrice
              defaultCalldata, // calldata
              ethers.utils.parseEther('.005'), // relayer fee
              slippage,
              {
                value: keyPrice,
              }
        ),
        'ChainNotSet'
      )
    })
  })

  describe('xReceive', () => {
    it('reverts if sender is not the bridge', async () => {
      await reverts(
        purchaserDest.xReceive(
          ethers.utils.formatBytes32String('123'), // transferId,
          ethers.utils.parseEther('0.01'), // amount of token in wei
          erc20Dest.address, // native or bridged ERC20 token
          purchaserSrc.address, // sender on the origin chain
          srcChainId, // domain ID of the origin chain
          defaultCalldata
        ),
        'OnlyBridge'
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
        lock = await deployLock({ purchaserDest, tokenAddress })
        keyPrice = ethers.BigNumber.from((await lock.keyPrice()).toString())
      })

      if(isErc20){
        describe('erc20 allowances', () => {
          let calldata 
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
            calldata = interface.encodeFunctionData('purchase', purchaseArgs)
          })
          it('reverts if unlock allowance too low', async () => {
            // calculate fee for the brdige
            const relayerFee = ethers.utils.parseEther('.005')
            const value = isErc20 ? relayerFee : relayerFee.add(keyPrice)

            if (isErc20) {
              // give user some tokens on origin chain
              await erc20Src.mint(keyOwner.address, keyPrice)
              // allow unlock on src chain to get his tokens (to send to bridge)
              // await erc20Src.connect(keyOwner).approve(purchaserSrc.address, keyPrice)
            }

            assert.equal(await lock.balanceOf(keyOwner.address), 0)

            // send call from src > dest
            await reverts(
              purchaserSrc
                .connect(keyOwner)
                .sendBridgedLockCall(
                  destChainId,
                  lock.address,
                  isErc20 ? erc20Src.address : ADDRESS_ZERO, // erc20 from src chain
                  keyPrice,
                  calldata,
                  relayerFee,
                  slippage,
                  {
                    value,
                  }
                ),
                `InsufficientApproval(${keyPrice.toString()})`
            )
          })
        })
      }

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
            await erc20Src.connect(keyOwner).approve(purchaserSrc.address, keyPrice)
          }

          assert.equal(await lock.balanceOf(keyOwner.address), 0)

          // send call from src > dest
          tx = await purchaserSrc
            .connect(keyOwner)
            .sendBridgedLockCall(
              destChainId,
              lock.address,
              isErc20 ? erc20Src.address : ADDRESS_ZERO, // erc20 from src chain
              keyPrice,
              calldata,
              relayerFee,
              slippage,
              {
                value,
              }
            )
        })

        it('purchase a key properly', async () => {
          // make sure key owner now has a valid key
          assert.equal(await lock.balanceOf(keyOwner.address), 1)
        })
  
        it('emits an event when sending to / receving from the bridge', async () => {
          const { events, blockNumber } = await tx.wait()
          const { timestamp } = await ethers.provider.getBlock(blockNumber)
  
          const { args: argsEmitted } = events.find(({event}) => event === 'BridgeCallEmitted')
          assert.equal(argsEmitted.destChainId.toNumber(), destChainId)
          assert.equal(argsEmitted.unlockAddress, purchaserDest.address)
          assert.equal(argsEmitted.lockAddress,  lock.address)
          assert.equal(argsEmitted.transferID, timestamp)
          
          const { args: argsReceived } = events.find(({event}) => event === 'BridgeCallReceived')
          assert.equal(argsReceived.originChainId.toNumber(), srcChainId)
          assert.equal(argsReceived.lockAddress,  lock.address)
          assert.equal(argsReceived.transferID, timestamp)
        })
      })

      describe('extend', () => {
        let tokenId
        beforeEach(async () => {
          // purchase the key
          if (isErc20) {
            await erc20Dest.mint(keyOwner.address, keyPrice)
            await erc20Dest.connect(keyOwner).approve(lock.address, keyPrice)
          }
          ;({tokenId} = await purchaseKey(lock, keyOwner.address, isErc20))
          assert.equal(await lock.balanceOf(keyOwner.address), 1)

          // expire the key
          assert.equal(await lock.isValidKey(tokenId), true)
          await lock.expireAndRefundFor(tokenId, 0)
          assert.equal(await lock.isValidKey(tokenId), false)

          // parse extend calldata
          const extendArgs = [
            isErc20 ? keyPrice : 0,
            tokenId,
            ADDRESS_ZERO,
            [],
          ]
          const interface = new ethers.utils.Interface(lock.abi)
          const calldata = interface.encodeFunctionData('extend', extendArgs)

          // calculate fee for the brdige
          const relayerFee = ethers.utils.parseEther('.005')
          const value = isErc20 ? relayerFee : relayerFee.add(keyPrice)

          if (isErc20) {
            // give user some tokens on origin chain
            await erc20Src.mint(keyOwner.address, keyPrice)
            // allow unlock on src chain to get his tokens (to send to bridge)
            await erc20Src.connect(keyOwner).approve(purchaserSrc.address, keyPrice)
          }

          // send call from src > dest
          tx = await purchaserSrc
            .connect(keyOwner)
            .sendBridgedLockCall(
              destChainId,
              lock.address,
              isErc20 ? erc20Src.address : ADDRESS_ZERO, // erc20 from src chain
              keyPrice,
              calldata,
              relayerFee,
              slippage,
              {
                value,
              }
            )
        })

        it('key is now valid', async () => {
          assert.equal(await lock.balanceOf(keyOwner.address), 1)
          assert.equal(await lock.isValidKey(tokenId), true)
        })
      })
    })
  })
})
