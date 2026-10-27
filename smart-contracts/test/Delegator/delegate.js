const { expect } = require('chai')
const { ethers } = require('hardhat')
const { upgrades } = require('hardhat')

describe('Delegator Contract', function () {
  let token, delegator

  beforeEach(async function () {
    const [owner] = await ethers.getSigners()

    // Deploy UPToken
    const UP = await ethers.getContractFactory('UPToken')
    token = await upgrades.deployProxy(UP, [await owner.getAddress()])
    await token.waitForDeployment()

    // Mint tokens to the owner address (which is owner in this test)
    await token.mint(owner.address)
    // Delegate to self
    await token.delegate(owner.address)

    // Deploy the Delegator contract
    const Delegator = await ethers.getContractFactory('Delegator')
    delegator = await Delegator.deploy(await token.getAddress())
  })

  it('should let a token owner delegate some of their tokens', async () => {
    const [owner, delegate] = await ethers.getSigners()
    const ownerAddress = await owner.getAddress()
    const delegateAddress = await delegate.getAddress()
    const delegatorAddress = await delegator.getAddress()

    const amount = ethers.parseUnits('123', 18)

    const balanceBefore = await token.balanceOf(ownerAddress)

    // Delegate the tokens
    await token.approve(delegatorAddress, amount)
    const tx = await delegator.delegate(delegateAddress, amount)
    await tx.wait()

    const delegationContractAddress = await delegator.delegations(
      ownerAddress,
      delegateAddress
    )

    // Now check the balances
    expect(await token.balanceOf(delegateAddress)).to.equal(0n)
    expect(await token.balanceOf(delegatorAddress)).to.equal(0n)
    expect(await token.balanceOf(ownerAddress)).to.equal(balanceBefore - amount)
    expect(await token.balanceOf(delegationContractAddress)).to.equal(amount)

    // And check delegations!
    expect(await token.delegates(delegateAddress)).to.equal(ethers.ZeroAddress)
    expect(await token.delegates(delegatorAddress)).to.equal(ethers.ZeroAddress)
    expect(await token.delegates(ownerAddress)).to.equal(ownerAddress) // Owner still delegates to themselves
    expect(await token.delegates(delegationContractAddress)).to.equal(
      delegateAddress
    )

    // And check the votes!
    expect(await token.getVotes(delegateAddress)).to.equal(amount)
    expect(await token.getVotes(delegatorAddress)).to.equal(0n)
    expect(await token.getVotes(ownerAddress)).to.equal(balanceBefore - amount) // Owner still votes for themselves
    expect(await token.getVotes(delegationContractAddress)).to.equal(0n)

    // Delegate more!
    await token.approve(delegatorAddress, amount)
    await (await delegator.delegate(delegateAddress, amount)).wait()

    // Now check the balances
    expect(await token.balanceOf(delegateAddress)).to.equal(0n)
    expect(await token.balanceOf(delegatorAddress)).to.equal(0n)
    expect(await token.balanceOf(ownerAddress)).to.equal(
      balanceBefore - amount * 2n
    )
    expect(await token.balanceOf(delegationContractAddress)).to.equal(
      amount * 2n
    )

    // And check delegations!
    expect(await token.delegates(delegateAddress)).to.equal(ethers.ZeroAddress)
    expect(await token.delegates(delegatorAddress)).to.equal(ethers.ZeroAddress)
    expect(await token.delegates(ownerAddress)).to.equal(ownerAddress) // Owner still delegates to themselves
    expect(await token.delegates(delegationContractAddress)).to.equal(
      delegateAddress
    )

    // And check the votes!
    expect(await token.getVotes(delegateAddress)).to.equal(amount * 2n)
    expect(await token.getVotes(delegatorAddress)).to.equal(0n)
    expect(await token.getVotes(ownerAddress)).to.equal(
      balanceBefore - amount * 2n
    ) // Owner still votes for themselves
    expect(await token.getVotes(delegationContractAddress)).to.equal(0n)
  })

  it('can delegate to multiple addresses', async () => {
    const [owner, delegateA, delegateB] = await ethers.getSigners()
    const ownerAddress = await owner.getAddress()
    const delegatorAddress = await delegator.getAddress()

    const amountA = ethers.parseUnits('100', 18)
    const amountB = ethers.parseUnits('200', 18)
    const balanceBefore = await token.balanceOf(ownerAddress)

    // Delegate to two different addresses
    await token.approve(delegatorAddress, amountA + amountB)
    await (await delegator.delegate(delegateA.address, amountA)).wait()
    await (await delegator.delegate(delegateB.address, amountB)).wait()

    const delegationA = await delegator.delegations(
      ownerAddress,
      delegateA.address
    )
    const delegationB = await delegator.delegations(
      ownerAddress,
      delegateB.address
    )

    // Balances should be split across both delegation contracts
    expect(await token.balanceOf(ownerAddress)).to.equal(
      balanceBefore - amountA - amountB
    )
    expect(await token.balanceOf(delegationA)).to.equal(amountA)
    expect(await token.balanceOf(delegationB)).to.equal(amountB)

    // Votes should be correctly attributed
    expect(await token.getVotes(delegateA.address)).to.equal(amountA)
    expect(await token.getVotes(delegateB.address)).to.equal(amountB)
  })

  it('should let an owner get their tokens back after they delegated', async () => {
    const [owner, delegate] = await ethers.getSigners()
    const ownerAddress = await owner.getAddress()
    const delegateAddress = await delegate.getAddress()
    const delegatorAddress = await delegator.getAddress()

    const amount = ethers.parseUnits('1337', 18)

    const balanceBefore = await token.balanceOf(ownerAddress)

    // Delegate the tokens
    await token.approve(delegatorAddress, amount)
    await (await delegator.delegate(delegateAddress, amount)).wait()

    // Undelegate
    await (await delegator.undelegate(delegateAddress)).wait()
    expect(await token.balanceOf(ownerAddress)).to.equal(balanceBefore)
  })
})
