const { ethers } = require('hardhat')
const { deployERC20, deployContracts } = require('../helpers')

const {
  getBalance,
  getNetwork,
  ADDRESS_ZERO,
  PERMIT2_ADDRESS,
} = require('@unlock-protocol/hardhat-helpers')

const someTokens = ethers.parseUnits('10', 'ether')
const scenarios = [true, false]
const isEthersJs = true

let swapper,
  unlock,
  tokenAddress,
  testToken,
  owner,
  unlockBalanceBefore,
  swapperBalanceBefore
const { assert } = require('chai')

describe('UnlockSwapPurchaser / withdraw', () => {
  scenarios.forEach((isErc20) => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        ;[owner] = await ethers.getSigners()
        ;({ unlock } = await deployContracts())

        const UnlockSwapPurchaser = await ethers.getContractFactory(
          'UnlockSwapPurchaser'
        )
        // use mainnet settings for testing purposes only
        const {
          uniswapV3: { universalRouterAddress },
        } = await getNetwork(1)
        const routers = [universalRouterAddress]
        swapper = await UnlockSwapPurchaser.deploy(
          await unlock.getAddress(),
          PERMIT2_ADDRESS,
          routers
        )

        swapperBalanceBefore = await getBalance(
          await swapper.getAddress(),
          tokenAddress
        )
        unlockBalanceBefore = await getBalance(
          await unlock.getAddress(),
          tokenAddress
        )

        if (isErc20) {
          testToken = await deployERC20(owner, isEthersJs)
          tokenAddress = await testToken.getAddress()
          // Send some tokens to purchaser
          await testToken
            .connect(owner)
            .mint(await swapper.getAddress(), someTokens)
        } else {
          tokenAddress = ADDRESS_ZERO
          await owner.sendTransaction({
            to: await swapper.getAddress(),
            value: someTokens,
          })
        }

        assert.equal(
          swapperBalanceBefore + someTokens.toString(),
          (
            await getBalance(await swapper.getAddress(), tokenAddress)
          ).toString()
        )

        // actually withdraw the funds
        await swapper.withdrawToUnlock(tokenAddress)
      })

      it('should have transferred the funds to unlock', async () => {
        assert.equal(
          unlockBalanceBefore + someTokens.toString(),
          (await getBalance(await unlock.getAddress(), tokenAddress)).toString()
        )
        assert.equal(
          swapperBalanceBefore.toString(),
          (
            await getBalance(await swapper.getAddress(), tokenAddress)
          ).toString()
        )
      })
    })
  })
})
