const assert = require('assert')
const { ethers } = require('hardhat')
const { deployERC20, deployContracts, reverts } = require('../helpers')

const {
  addSomeETH,
  getBalance,
  ADDRESS_ZERO,
  PERMIT2_ADDRESS,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')
const { compareBigNumbers } = require('../helpers')

const fee = 3000

describe('Unlock / swapAndBurn', async () => {
  let unlock, swapBurner, udtAddress, udt, mockSwapBurner

  before(async () => {
    ;({ unlock, udt } = await deployContracts())
    udtAddress = await udt.getAddress()

    // set UDT in unlock
    await unlock.configUnlock(
      await udt.getAddress(),
      ADDRESS_ZERO,
      10000,
      'KEY',
      'https://unlock-test',
      31337
    )

    const SwapBurner = await ethers.getContractFactory('UnlockSwapBurner')
    swapBurner = await SwapBurner.deploy(
      udtAddress,
      PERMIT2_ADDRESS,
      ADDRESS_ZERO
    )

    const MockSwapBurner = await ethers.getContractFactory('MockSwapBurner')
    mockSwapBurner = await MockSwapBurner.deploy(
      await udt.getAddress(),
      PERMIT2_ADDRESS,
      ADDRESS_ZERO
    )
  })

  describe('setSwapBurner', () => {
    it('default to address zero', async () => {
      assert.equal(await unlock.swapBurnerAddress(), ADDRESS_ZERO)
    })
    it('can be changed', async () => {
      assert.equal(await unlock.swapBurnerAddress(), ADDRESS_ZERO)
      await unlock.setSwapBurner(await swapBurner.getAddress())
      assert.equal(
        await unlock.swapBurnerAddress(),
        await swapBurner.getAddress()
      )
    })
    it('can be changed only by owner', async () => {
      const [, someSigner] = await ethers.getSigners()
      await reverts(
        unlock.connect(someSigner).setSwapBurner(await swapBurner.getAddress()),
        'ONLY_OWNER'
      )
    })
    it('should fire an event', async () => {
      assert.equal(
        await unlock.swapBurnerAddress(),
        await swapBurner.getAddress()
      )

      const SwapBurner = await ethers.getContractFactory('UnlockSwapBurner')
      const newSwapBurner = await SwapBurner.deploy(
        udtAddress,
        PERMIT2_ADDRESS,
        ADDRESS_ZERO
      )

      const tx = await unlock.setSwapBurner(await newSwapBurner.getAddress())
      const receipt = await tx.wait()

      // check if box instance works
      const evt = await getEvent(receipt, 'SwapBurnerChanged')
      const { newAddress, oldAddress } = evt.args

      assert.equal(newAddress, await newSwapBurner.getAddress())
      assert.equal(oldAddress, await swapBurner.getAddress())
    })
  })

  describe('swapAndBurn', () => {
    it('should prevent burning UDT from Unlock', async () => {
      await unlock.setSwapBurner(await swapBurner.getAddress())
      assert.equal(
        await unlock.swapBurnerAddress(),
        await swapBurner.getAddress()
      )
      await reverts(
        unlock.swapAndBurn(await udt.getAddress(), '10000', fee),
        'Unlock__INVALID_TOKEN'
      )
    })
  })

  describe('swapAndBurn (mock)', () => {
    let token, amount, deployer, signer
    beforeEach(async () => {
      token = await deployERC20(deployer, true)
      amount = ethers.parseEther('50')

      // replace by mock version of SwapBurner
      await unlock.setSwapBurner(await mockSwapBurner.getAddress())
      swapBurner = mockSwapBurner
      ;[deployer, signer] = await ethers.getSigners()
    })

    it('should transfer native tokens properly', async () => {
      // console.log(await unlock.swapBurnerAddress())

      // transfer some tokens to Unlock
      await addSomeETH(await unlock.getAddress(), amount)
      const unlockBalanceBefore = await getBalance(await unlock.getAddress())
      compareBigNumbers(unlockBalanceBefore, amount)

      // send tokens to Swap Burner
      const balanceBefore = await getBalance(await swapBurner.getAddress())
      await unlock.swapAndBurn(ADDRESS_ZERO, amount, fee)
      const balanceAfter = await getBalance(await swapBurner.getAddress())

      // swap burner got the tokens
      compareBigNumbers(balanceAfter - balanceBefore, amount)

      // unlock has no tokens anymore
      compareBigNumbers(
        await getBalance(await unlock.getAddress()),
        unlockBalanceBefore - amount
      )
    })
    it('should transfer native ERC20 tokens properly', async () => {
      const balanceBefore = await getBalance(
        await swapBurner.getAddress(),
        await token.getAddress()
      )
      await token.mint(await signer.getAddress(), amount)

      compareBigNumbers(
        await getBalance(await signer.getAddress(), await token.getAddress()),
        amount
      )

      // transfer some tokens to Unlock
      await token.connect(signer).transfer(await unlock.getAddress(), amount)
      const unlockBalanceBefore = await getBalance(
        await unlock.getAddress(),
        await token.getAddress()
      )

      compareBigNumbers(unlockBalanceBefore, amount)

      // send tokens to Swap Burner
      await unlock.swapAndBurn(await token.getAddress(), amount, fee)

      // check balances
      const balanceAfter = await getBalance(
        await swapBurner.getAddress(),
        await token.getAddress()
      )

      compareBigNumbers(balanceAfter - balanceBefore, amount)

      compareBigNumbers(
        await getBalance(await unlock.getAddress(), await token.getAddress()),
        unlockBalanceBefore - amount
      )
    })
    it('can be called by anyone', async () => {
      const [, , randomSigner] = await ethers.getSigners()
      await token.mint(await unlock.getAddress(), amount)
      const balanceBefore = await getBalance(
        await swapBurner.getAddress(),
        await token.getAddress()
      )
      await unlock
        .connect(randomSigner)
        .swapAndBurn(await token.getAddress(), amount, fee)
      const balanceAfter = await getBalance(
        await swapBurner.getAddress(),
        await token.getAddress()
      )
      compareBigNumbers(balanceAfter - balanceBefore, amount)
    })
  })
})
