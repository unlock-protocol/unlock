/**
 * This proposal swap all UDT owns by the timelock to UP token
 */
const { UPSwap } = require('@unlock-protocol/contracts')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')

// gov base sepolia: 0xfdbe81e89fcaa4e7b47d62a25636cc158f07aa0d
module.exports = async ({
  swapAddress = '0x12be7322070cFA75E2f001C6B3d6Ac8C2efEF5Ea',
  timelockAddress = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b',
}) => {
  const {
    unlockDaoToken: { address: udtAddress },
  } = await getNetwork()

  // get amount
  const udt = await getERC20Contract(udtAddress)
  const udtAmount = await udt.balanceOf(timelockAddress)

  // parse proposal
  const proposalName = `Swap UDT for UP`
  const calls = [
    {
      contractAddress: udtAddress,
      contractNameOrAbi: ERC20_ABI,
      functionName: 'approve',
      functionArgs: [swapAddress, udtAmount],
    },
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
