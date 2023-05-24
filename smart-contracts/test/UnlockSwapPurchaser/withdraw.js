const { ethers } = require('hardhat')
const {
  getBalanceEthers,
  deployERC20,
  ADDRESS_ZERO,
  PERMIT2_ADDRESS,
  deployContracts,
  CHAIN_ID,
} = require('../helpers')

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
const uniswapRouterAddresses = require('../../scripts/uniswap/routerAddresses.json')
const { assert } = require('chai')

contract('UnlockSwapPurchaser / withdraw', () => {
  scenarios.forEach((isErc20) => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        ;[owner] = await ethers.getSigners()
        ;({ unlockEthers: unlock } = await deployContracts())

        const UnlockSwapPurchaser = await ethers.getContractFactory(
          'UnlockSwapPurchaser'
        )
        const { UniversalRouter, SwapRouter02 } =
          uniswapRouterAddresses[CHAIN_ID]
        const routers = [UniversalRouter, SwapRouter02]
        swapper = await UnlockSwapPurchaser.deploy(
          unlock.address,
          PERMIT2_ADDRESS,
          routers
        )

        swapperBalanceBefore = await getBalanceEthers(
          swapper.address,
          tokenAddress
        )
        unlockBalanceBefore = await getBalanceEthers(
          unlock.address,
          tokenAddress
        )

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
          (await getBalanceEthers(swapper.address, tokenAddress)).toString()
        )

        // actually withdraw the funds
        await swapper.withdrawToUnlock(tokenAddress)
      })

      it('should have transferred the funds to unlock', async () => {
        assert.equal(
          unlockBalanceBefore.add(someTokens).toString(),
          (await getBalanceEthers(unlock.address, tokenAddress)).toString()
        )
        assert.equal(
          swapperBalanceBefore.toString(),
          (await getBalanceEthers(swapper.address, tokenAddress)).toString()
        )
      })
    })
  })
})
