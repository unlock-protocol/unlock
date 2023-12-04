const { ethers } = require('hardhat')
const {
  deployERC20,
  deployContracts,
  reverts,
  ADDRESS_ZERO,
  UDT,
  PERMIT2_ADDRESS,
  getUniswapRouters,
  addSomeETH,
  getBalance,
} = require('../helpers')

contract('Unlock / swapAndBurn', async () => {
  let unlock, swapBurner

  before(async () => {
    ;({ unlockEthers: unlock } = await deployContracts())

    const routers = getUniswapRouters()
    const SwapBurner = await ethers.getContractFactory('UnlockSwapBurner')
    swapBurner = await SwapBurner.deploy(UDT, PERMIT2_ADDRESS, routers)
  })

  describe('setSwapBurner', () => {
    it('default to address zero', async () => {
      assert.equal((await unlock.swapBurnerAddress()).toString(), ADDRESS_ZERO)
    })
    it('can be changed', async () => {
      assert.equal((await unlock.swapBurnerAddress()).toString(), ADDRESS_ZERO)
      await unlock.setSwapBurner(swapBurner.address)
      assert.equal(await unlock.swapBurnerAddress(), swapBurner.address)
    })
    it('can be changed only by owner', async () => {
      const [, someSigner] = await ethers.getSigners()
      await reverts(
        unlock.connect(someSigner).setSwapBurner(swapBurner.address),
        'ONLY_OWNER'
      )
    })
    it('should fire an event', async () => {
      assert.equal(await unlock.swapBurnerAddress(), swapBurner.address)

      const SwapBurner = await ethers.getContractFactory('UnlockSwapBurner')
      const newSwapBurner = await SwapBurner.deploy(UDT, PERMIT2_ADDRESS, [])

      const tx = await unlock.setSwapBurner(newSwapBurner.address)
      const { events } = await tx.wait()

      // check if box instance works
      const evt = events.find((v) => v.event === 'SwapBurnerChanged')
      const { newAddress, oldAddress } = evt.args

      assert.equal(newAddress, newSwapBurner.address)
      assert.equal(oldAddress, swapBurner.address)
    })
  })

  describe('sendToBurner', () => {
    let token, amount, deployer, signer
    before(async () => {
      token = await deployERC20(deployer, true)
      amount = ethers.utils.parseEther('50')
      await unlock.setSwapBurner(swapBurner.address)
      ;[deployer, signer] = await ethers.getSigners()
    })
    it('should transfer native tokens properly', async () => {
      // transfer some tokens to Unlock
      await addSomeETH(unlock.address, amount)
      const unlockBalanceBefore = await getBalance(unlock.address)
      assert.equal(unlockBalanceBefore.toString(), amount.toString())

      // send tokens to Swap Burner
      const balanceBefore = await getBalance(swapBurner.address)
      await unlock.sendToSwapBurner(ADDRESS_ZERO, amount)
      const balanceAfter = await getBalance(swapBurner.address)

      assert.equal(
        balanceAfter.minus(balanceBefore).toString(),
        amount.toString()
      )

      assert.equal(
        (await getBalance(unlock.address)).toString(),
        unlockBalanceBefore.minus(amount.toString()).toString()
      )
    })
    it('should transfer native ERC20 tokens properly', async () => {
      const balanceBefore = await getBalance(swapBurner.address, token.address)
      await token.mint(signer.address, amount)

      assert.equal(
        (await getBalance(signer.address, token.address)).toString(),
        amount.toString()
      )

      // transfer some tokens to Unlock
      await token.connect(signer).transfer(unlock.address, amount)
      const unlockBalanceBefore = await getBalance(
        unlock.address,
        token.address
      )

      assert.equal(unlockBalanceBefore.toString(), amount.toString())

      // send tokens to Swap Burner
      await unlock.sendToSwapBurner(token.address, amount)

      // check balances
      const balanceAfter = await getBalance(swapBurner.address, token.address)

      assert.equal(
        balanceAfter.minus(balanceBefore).toString(),
        amount.toString()
      )

      assert.equal(
        (await getBalance(unlock.address, token.address)).toString(),
        unlockBalanceBefore.minus(amount.toString()).toString()
      )
    })
    it('can be called by anyone', async () => {
      const [, , randomSigner] = await ethers.getSigners()
      await token.mint(unlock.address, amount)
      const balanceBefore = await getBalance(swapBurner.address, token.address)
      await unlock.connect(randomSigner).sendToSwapBurner(token.address, amount)
      const balanceAfter = await getBalance(swapBurner.address, token.address)
      assert.equal(
        balanceAfter.minus(balanceBefore).toString(),
        amount.toString()
      )
    })
  })
})
