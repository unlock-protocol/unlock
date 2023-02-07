const { ethers } = require('hardhat')
const {
  getBalanceEthers,
  deployERC20,
  ADDRESS_ZERO,
  PERMIT2_ADDRESS,
  deployContracts,
} = require('../helpers')

const someTokens = ethers.utils.parseUnits('10', 'ether')
const scenarios = [true, false]
const isEthersJs = true

let swapper, unlock, tokenAddress, testToken, owner, unlockBalanceBefore, swapperBalanceBefore

contract('UnlockSwapPurchaser / withdraw', () => {
  
  scenarios.forEach((isErc20) => {
    describe(`Test ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {

        ;[owner] = await ethers.getSigners()
        ;({ unlockEthers: unlock } = await deployContracts())

        const UnlockSwapPurchaser = await ethers.getContractFactory('UnlockSwapPurchaser')
        swapper = await UnlockSwapPurchaser.deploy(unlock.address, PERMIT2_ADDRESS)

        swapperBalanceBefore = await getBalanceEthers(swapper.address, tokenAddress)
        unlockBalanceBefore = await getBalanceEthers(unlock.address, tokenAddress)

        if (isErc20) {
          testToken = await deployERC20(owner, isEthersJs)
          tokenAddress = testToken.address
          // Send some tokens to purchaser
          await testToken.connect(owner).mint(swapper.address, someTokens)
        } else {
          tokenAddress = ADDRESS_ZERO
          await owner.sendTransaction({
            to: swapper.address,
            value: someTokens
          })
        }

        console.log(swapperBalanceBefore)
        expect(swapperBalanceBefore.add(someTokens).toString()).to.equals(
          (await getBalanceEthers(swapper.address, tokenAddress)).toString()
        )

        // actually withdraw the funds
        await swapper.withdrawToUnlock(tokenAddress)
      })

      it('should have transferred the funds to unlock', async () => {
        expect(
          unlockBalanceBefore.add(someTokens).toString()
          ).to.equals(
            (await getBalanceEthers(unlock.address, tokenAddress)).toString()
          )
        expect(swapperBalanceBefore.toString()).to.equals(
            (await getBalanceEthers(swapper.address, tokenAddress)).toString()
          )
      })
    })
  })
})
