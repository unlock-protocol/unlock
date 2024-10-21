const assert = require('assert')
const { ethers } = require('hardhat')
const { deployERC20, deployContracts, reverts } = require('../helpers')

const {
  getBalance,
  ADDRESS_ZERO,
  PERMIT2_ADDRESS,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')
const { compareBigNumbers } = require('../helpers')
const { ZeroAddress, parseEther } = require('ethers')

describe('Unlock / transferTokens', async () => {
  let unlock, udtAddress, udt
  let token, amount, deployer, signer

  before(async () => {
    ;[deployer, signer] = await ethers.getSigners()
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

    token = await deployERC20(deployer, true)
    amount = ethers.parseEther('50')
  })

  it('transferToken failed if caller is not owner', async () => {
    await reverts(
      unlock.connect(signer).transferTokens(ZeroAddress, ZeroAddress, 1),
      'ONLY_OWNER'
    )
  })

  it('should transfer native ERC20 tokens properly', async () => {
    await token.mint(await unlock.getAddress(), amount)
    const unlockBalanceBefore = await getBalance(
      await unlock.getAddress(),
      await token.getAddress()
    )

    compareBigNumbers(unlockBalanceBefore, amount)

    await unlock.transferTokens(
      await token.getAddress(),
      await signer.getAddress(),
      amount
    )

    compareBigNumbers(
      await getBalance(await unlock.getAddress(), await token.getAddress()),
      unlockBalanceBefore - amount
    )
  })

  it('should transfer native token properly', async () => {
    await signer.sendTransaction({
      from: await signer.getAddress(),
      to: await unlock.getAddress(),
      value: amount,
    })

    const unlockBalanceBefore = await ethers.provider.getBalance(
      await unlock.getAddress()
    )
    compareBigNumbers(unlockBalanceBefore, amount)

    await unlock.transferTokens(ZeroAddress, await signer.getAddress(), amount)

    compareBigNumbers(
      await ethers.provider.getBalance(await unlock.getAddress()),
      unlockBalanceBefore - amount
    )
  })
})
