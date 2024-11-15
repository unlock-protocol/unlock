const { ethers } = require('hardhat')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { getUniswapV3Contracts } = require('../../helpers/uniswap')
const l1BridgeAbi = require('../../helpers/abi/l1standardbridge.json')

const MAINNET_TIMELOCK_ADDRESS = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
const BASE_TIMELOCK_ADDRESS = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'
const BRIDGE_ADDRESS = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35'

const exitPosition = async ({ positionManager, tokenId }) => {
  const decreaseLiquidityParams = {
    tokenId: tokenId,
    liquidity: 0,
    amount0Min: 0,
    amount1Min: 0,
    deadline: 0,
  }

  const collectParams = {
    tokenId: tokenId,
    recipient: MAINNET_TIMELOCK_ADDRESS,
    amount0Max: 0, // type(uint128).max,
    amount1Max: 0, //type(uint128).max,
  }

  const calls = [
    // exit uniswap positions
    await positionManager.interface.encodeFunctionData(
      'decreaseLiquidity',
      decreaseLiquidityParams
    ),
    // collect fees
    await positionManager.interface.encodeFunctionData(
      'collect',
      collectParams
    ),
    // burn nft
    await positionManager.interface.encodeFunctionData('burn', [
      tokenId, // tokenId
    ]),

    // bridge UDT to base
  ]

  return calls
}

module.exports = async () => {
  const { id, name } = await getNetwork()
  console.log(`Proposal to be submitted on ${name} (${id}) `)
  const { positionManager } = await getUniswapV3Contracts()

  // get token ids
  const balance = await positionManager.balanceOf(MAINNET_TIMELOCK_ADDRESS)
  const tokenIds = await Promise.all(
    Array(parseInt(balance.toString()))
      .fill(0)
      .map((_, i) =>
        positionManager.tokenOfOwnerByIndex(MAINNET_TIMELOCK_ADDRESS, i)
      )
  )
  console.log({ balance, tokenIds })

  const calls = await Promise.all(
    tokenIds.map((tokenId) => exitPosition({ positionManager, tokenId }))
  )

  console.log(calls)

  // parse calls for Safe
  const proposalName = `# Exit UDT Uniswap positions

    This proposal will decrease liquidity to zero on all UDT uniswap positions on mainnet and transfer the resulting amount to the bridged UDT on Base, so it can be later swapped to UP.
    `

  return {
    proposalName,
    calls,
  }
}
