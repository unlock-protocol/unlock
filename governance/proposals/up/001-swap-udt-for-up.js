/**
 * This proposal swap all UDT owns by the timelock to UP token
 */
const { UPSwap } = require('@unlock-protocol/contracts')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')

const swapAddresses = {
  8453: '0x12be7322070cFA75E2f001C6B3d6Ac8C2efEF5Ea',
  84532: '0xaeb12decF602B21815B71B3Fac97975Ca27C9C00',
}

// gov base sepolia: 0xfdbe81e89fcaa4e7b47d62a25636cc158f07aa0d
const timelocks = {
  8453: '0xB34567C4cA697b39F72e1a8478f285329A98ed1b',
  84532: '0xC50610a02C9EbF71aBe0Ec943Bc085EfaAc1099d',
}

module.exports = async () => {
  const {
    id: chainId,
    unlockDaoToken: { address: udtAddress },
  } = await getNetwork()

  // addresses
  const swapAddress = swapAddresses[chainId]
  const timelockAddress = timelocks[chainId]

  // get amount
  const udt = await getERC20Contract(udtAddress)
  const udtAmount = await udt.balanceOf(timelocks[chainId])

  // parse proposal
  const proposalName = `Swap UDT for UP ds`
  const calls = [
    {
      contractAddress: swapAddress,
      contractNameOrAbi: UPSwap.abi,
      functionName: 'swapUDTForUP',
      functionArgs: [udtAmount, timelockAddress],
    },
  ]

  return {
    proposalName,
    calls,
  }
}
