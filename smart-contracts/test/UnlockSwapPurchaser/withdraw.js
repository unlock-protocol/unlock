const { ethers } = require('hardhat')
const { deployERC20, deployContracts } = require('../helpers')

const {
  getBalance,
  getNetwork,
  ADDRESS_ZERO,
  PERMIT2_ADDRESS,
} = require('@unlock-protocol/hardhat-helpers')

const someTokens = ethers.utils.parseUnits('10', 'ether')
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
          unlock.address,
          PERMIT2_ADDRESS,
          routers
        )

        swapperBalanceBefore = await getBalance(swapper.address, tokenAddress)
        unlockBalanceBefore = await getBalance(unlock.address, tokenAddress)

        if (isErc20) {
          testToken = await deployERC20(owner, isEthersJs)
          tokenAddress = testToken.address
          // Send some tokens to purchaser
          await testToken.connect(owner).mint(swapper.address, someTokens)
        } else {
          tokenAddress = ADDRESS_ZERO
          await owner.sendTransaction({
            to: swapper.address,
            value: someTokens,
          })
        }

        assert.equal(
          swapperBalanceBefore.add(someTokens).toString(),
          (await getBalance(swapper.address, tokenAddress)).toString()
        )

        // actually withdraw the funds
        await swapper.withdrawToUnlock(tokenAddress)
      })

      it('should have transferred the funds to unlock', async () => {
        assert.equal(
          unlockBalanceBefore.add(someTokens).toString(),
          (await getBalance(unlock.address, tokenAddress)).toString()
        )
        assert.equal(
          swapperBalanceBefore.toString(),
          (await getBalance(swapper.address, tokenAddress)).toString()
        )
      })
    })
  })
})
