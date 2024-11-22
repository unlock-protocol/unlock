const { ethers } = require('hardhat')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { getUniswapV3Contracts } = require('../../helpers/uniswap')

const MAINNET_TIMELOCK_ADDRESS = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'

const exitPosition = async ({ positionManager, tokenId }) => {
  // unpack uniswap position
  // nonce, operator, token0, token1, fee, tickLower, tickUpper, *liquidity*
  const [, , token0, token1, , , , liquidity] =
    await positionManager.positions(tokenId)

  // deadline is set to 8 weeks after the proposal was submitted
  const ONE_WEEK = 7 * 24 * 3600
  const { timestamp: currentTime } = await ethers.provider.getBlock('latest')
  const deadline = currentTime + 8 * ONE_WEEK

  const decreaseLiquidityParams = {
    tokenId: tokenId,
    liquidity, // remove all existing liquidity
    amount0Min: 0n,
    amount1Min: 0n,
    deadline,
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

There are currently ${balance.toString()} positions owned by the DAO in the Uniswap UDT / WETH pool on mainnet. Liquidity for these positions is provided by the DAO treasury.

This proposal will result in exiting these positions by: 

1) decreasing liquidity to zero on all these positions 
2) collecting the UDT and WETH from the pools and transferring to the DAO timelock
3) burning the Uniswap position NFT

As noted in Step 2, once executed, all UDT and WETH tokens currently held in pools will be transferred back to the DAO's timelock.

You can check the current positions here: ${tokenIds
    .map(
      (tokenId) =>
        `[${tokenId}](https://app.uniswap.org/nfts/asset/${managerAddress}/${tokenId})`
    )
    .join(', ')} ).

`

  console.log(proposalName)

  return {
    proposalName,
    calls: calls.flat(),
  }
}
