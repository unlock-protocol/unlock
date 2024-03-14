const { assert } = require('chai')
const { ethers } = require('hardhat')
const { deployERC20, deployContracts, reverts } = require('../helpers')

const {
  addSomeETH,
  getBalance,
  ADDRESS_ZERO,
  PERMIT2_ADDRESS,
} = require('@unlock-protocol/hardhat-helpers')
const { compareBigNumbers } = require('../helpers')

const fee = 3000

describe('Unlock / swapAndBurn', async () => {
  let unlock, swapBurner, udtAddress, udt, mockSwapBurner

  before(async () => {
    ;({ unlock, udt } = await deployContracts())
    udtAddress = udt.address

    // set UDT in unlock
    await unlock.configUnlock(
      udt.address,
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
      udt.address,
      PERMIT2_ADDRESS,
      ADDRESS_ZERO
    )
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
      const newSwapBurner = await SwapBurner.deploy(
        udtAddress,
        PERMIT2_ADDRESS,
        ADDRESS_ZERO
      )

      const tx = await unlock.setSwapBurner(newSwapBurner.address)
      const { events } = await tx.wait()

      // check if box instance works
      const evt = events.find((v) => v.event === 'SwapBurnerChanged')
      const { newAddress, oldAddress } = evt.args

      assert.equal(newAddress, newSwapBurner.address)
      assert.equal(oldAddress, swapBurner.address)
    })
  })

  describe('swapAndBurn', () => {
    it('should prevent burning UDT from Unlock', async () => {
      await unlock.setSwapBurner(swapBurner.address)
      assert.equal(await unlock.swapBurnerAddress(), swapBurner.address)
      await reverts(
        unlock.swapAndBurn(udt.address, '10000', fee),
        'Unlock__INVALID_TOKEN'
      )
    })
  })

  describe('swapAndBurn (mock)', () => {
    let token, amount, deployer, signer
    beforeEach(async () => {
      token = await deployERC20(deployer, true)
      amount = ethers.utils.parseEther('50')

      // replace by mock version of SwapBurner
      await unlock.setSwapBurner(mockSwapBurner.address)
      swapBurner = mockSwapBurner
      ;[deployer, signer] = await ethers.getSigners()
    })

    it('should transfer native tokens properly', async () => {
      // console.log(await unlock.swapBurnerAddress())

      // transfer some tokens to Unlock
      await addSomeETH(unlock.address, amount)
      const unlockBalanceBefore = await getBalance(unlock.address)
      compareBigNumbers(unlockBalanceBefore, amount)

      // send tokens to Swap Burner
      const balanceBefore = await getBalance(swapBurner.address)
      await unlock.swapAndBurn(ADDRESS_ZERO, amount, fee)
      const balanceAfter = await getBalance(swapBurner.address)

      // swap burner got the tokens
      compareBigNumbers(balanceAfter.sub(balanceBefore), amount)

      // unlock has no tokens anymore
      compareBigNumbers(
        await getBalance(unlock.address),
        unlockBalanceBefore.sub(amount.toString())
      )
    })
    it('should transfer native ERC20 tokens properly', async () => {
      const balanceBefore = await getBalance(swapBurner.address, token.address)
      await token.mint(signer.address, amount)

      compareBigNumbers(await getBalance(signer.address, token.address), amount)

      // transfer some tokens to Unlock
      await token.connect(signer).transfer(unlock.address, amount)
      const unlockBalanceBefore = await getBalance(
        unlock.address,
        token.address
      )

      compareBigNumbers(unlockBalanceBefore, amount)

      // send tokens to Swap Burner
      await unlock.swapAndBurn(token.address, amount, fee)

      // check balances
      const balanceAfter = await getBalance(swapBurner.address, token.address)

      compareBigNumbers(balanceAfter.sub(balanceBefore), amount)

      compareBigNumbers(
        await getBalance(unlock.address, token.address),
        unlockBalanceBefore.sub(amount)
      )
    })
    it('can be called by anyone', async () => {
      const [, , randomSigner] = await ethers.getSigners()
      await token.mint(unlock.address, amount)
      const balanceBefore = await getBalance(swapBurner.address, token.address)
      await unlock.connect(randomSigner).swapAndBurn(token.address, amount, fee)
      const balanceAfter = await getBalance(swapBurner.address, token.address)
      compareBigNumbers(balanceAfter.sub(balanceBefore), amount)
    })
  })
})
