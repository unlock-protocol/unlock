const { ethers } = require('hardhat')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { getUniswapV3Contracts } = require('../../helpers/uniswap')

const MAINNET_TIMELOCK_ADDRESS = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'

const exitPosition = async ({ positionManager, tokenId }) => {
  const [
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    // nonce
    // operator
    // token0
    // token1
    // fee
    // tickLower
    // tickUpper
    liquidity,
  ] = await positionManager.positions(tokenId)

  const { timestamp: currentTime } = await ethers.provider.getBlock('latest')
  const ONE_WEEK = 7 * 24 * 3600
  const decreaseLiquidityParams = {
    tokenId: tokenId,
    liquidity,
    amount0Min: 0n,
    amount1Min: 0n,
    deadline: currentTime + 8 * ONE_WEEK, //  deadline is a ts
  }

  const MAX_UINT128 = 2n ** 128n - 1n
  const collectParams = {
    tokenId: tokenId,
    recipient: MAINNET_TIMELOCK_ADDRESS,
    amount0Max: MAX_UINT128,
    amount1Max: MAX_UINT128,
  }

  const calls = [
    // exit uniswap positions
    await positionManager.interface.encodeFunctionData('decreaseLiquidity', [
      Object.values(decreaseLiquidityParams),
    ]),
    // collect fees
    await positionManager.interface.encodeFunctionData('collect', [
      Object.values(collectParams),
    ]),
    // burn nft
    await positionManager.interface.encodeFunctionData('burn', [
      tokenId, // tokenId
    ]),
  ]
  return calls
}

module.exports = async () => {
  const { id, name } = await getNetwork()
  console.log(`Proposal to be submitted on ${name} (${id}) `)
  const { positionManager } = await getUniswapV3Contracts()
  const managerAddress = await positionManager.getAddress()

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

  const tokenCalls = await Promise.all(
    tokenIds.map((tokenId) => exitPosition({ positionManager, tokenId }))
  )
  const calls = tokenCalls.flat().map((calldata) => ({
    calldata,
    contractAddress: managerAddress,
  }))

  console.log(calls)

  // parse calls for Safe
  const proposalName = `# Exit UDT Uniswap positions

    This proposal will decrease liquidity to zero on all UDT uniswap positions owned by the DAO treasury on mainnet, collect UDT and WETH from the pools and burn the position.

    This will result on all UDT and WETH currently in pools being transferred back to the DAO's timelock.
    `

  return {
    proposalName,
    calls: calls.flat(),
  }
}
