const { ethers } = require('hardhat')

const NonfungiblePositionManagerAbi = []
const NonfungiblePositionManagerAddress = ''

module.exports = async ({} = {}) => {
  const positionManager = await ethers.getContract(
    NonfungiblePositionManagerAbi,
    NonfungiblePositionManagerAddress
  )

  const tokenId = 1
  const calls = [
    // collect fees
    await positionManager.encodeFunctionData('collect', [
      tokenId, // tokenId
      '0x', // recipient
      0, // amount0Max
      0, // amount1Max
    ]),
    // exit uniswap positions
    await positionManager.encodeFunctionData('decreaseLiquidity', [
      tokenId, // tokenId
      0, // liquidity
      0, // amount0Max
      0, // amount1Max
      0, // deadline
    ]),
    // burn nft ?
    // bridge tokens to Base
  ]

  // parse calls for Safe
  const proposalName = `# Exit UDT Uniswap positions

    This proposal will decrease liquidity to zero on all UDT uniswap positions on mainnet and transfer the resulting amount to the bridged UDT on Base, so it can be later swapped to UP.
    `

  return {
    proposalName,
    calls,
  }
}
