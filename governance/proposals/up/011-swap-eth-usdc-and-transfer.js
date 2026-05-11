/**
 * This proposal swaps ETH to USDC on Uniswap V3 and transfers USDC to Rise Up Morning Show
 * for partnership funding as approved by the DAO.
 *
 * NOTE: This uses an 'Exact Output' swap to ensure the recipient receives the exact USDC
 * amount regardless of ETH price fluctuations between proposal creation and execution.
 */
const { ethers } = require('hardhat')
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')
const uniswapV3SDK = require('@uniswap/v3-sdk')
const { Route, Trade, SwapRouter } = uniswapV3SDK
const { CurrencyAmount, Percent, TradeType } = require('@uniswap/sdk-core')
const { getNetwork, getTokenInfo } = require('@unlock-protocol/hardhat-helpers')
const {
  getUniswapV3QuoteExactOutput,
  buildSwapParamsExactOutput,
  initializeTokens,
  getPoolByAddress,
} = require('../../helpers/uniswap')
const SWAP_ROUTER_ABI = require('../../helpers/abi/swapRouter2.json')

// Default configuration - can be overridden via arguments
const MAX_ETH_BUDGET = '0.02' // Max ETH the DAO is willing to spend for this swap
const USDC_TRANSFER_AMOUNT = '10' // Target USDC amount (reduced for testing)
const RECIPIENT_ADDRESS = '0xCA7632327567796e51920F6b16373e92c7823854' // Rise Up Morning Show
const TIMELOCK_ADDRESS = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b' // Base timelock

const SWAP_ROUTER_ADDRESS = '0x2626664c2603336E57B271c5C0b26F421741e481' // SwapRouter02 on Base
const POOL_ADDRESS = '0xd0b53D9277642d899DF5C87A3966A349A798F224'

const SLIPPAGE = new Percent(50, 10_000) // 0.5% buffer for the swap itself
const DEADLINE_BUFFER = 24 * 60 * 60 * 365 * 80
const UNISWAP_FEE = 500 // 0.05% fee tier

// ABIs
const WETH_ABI = ['function deposit() payable']

module.exports = async ({
  ethSwapAmount = MAX_ETH_BUDGET,
  usdcTransferAmount = USDC_TRANSFER_AMOUNT,
  recipientAddress = RECIPIENT_ADDRESS,
  timelockAddress = TIMELOCK_ADDRESS,
} = {}) => {
  const { tokens } = await getNetwork()
  const weth = tokens.find((token) => token.symbol === 'WETH')
  const usdc = tokens.find((token) => token.symbol === 'USDC')
  const { decimals: wethDecimals } = await getTokenInfo(weth.address)
  const { decimals: usdcDecimals } = await getTokenInfo(usdc.address)

  // Parse amounts
  const maxEthBudget = ethers.parseUnits(ethSwapAmount.toString(), wethDecimals)
  const transferAmount = ethers.parseUnits(
    usdcTransferAmount.toString(),
    usdcDecimals
  )
  const deadline = Math.floor(Date.now() / 1000) + DEADLINE_BUFFER

  // 1. Get estimated ETH needed to get the exact USDC amount
  const estimatedEthIn = await getUniswapV3QuoteExactOutput(
    weth.address,
    usdc.address,
    UNISWAP_FEE,
    transferAmount
  )

  // 2. Prepare the swap call
  const pool = await getPoolByAddress(POOL_ADDRESS)
  const { token0: WETH_TOKEN, token1: USDC_TOKEN } = await initializeTokens(
    weth.address,
    usdc.address
  )
  const swapRoute = new Route([pool], WETH_TOKEN, USDC_TOKEN)

  const uncheckedTrade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      WETH_TOKEN,
      estimatedEthIn.toString()
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      USDC_TOKEN,
      transferAmount.toString()
    ),
    tradeType: TradeType.EXACT_OUTPUT,
  })

  const { calldata: swapData, value: swapValue } =
    SwapRouter.swapCallParameters([uncheckedTrade], {
      slippageTolerance: SLIPPAGE,
      deadline,
      recipient: timelockAddress,
    })

  const { args } = SwapRouter.INTERFACE.parseTransaction({
    value: swapValue,
    data: swapData,
  })

  const amountInMaximum = BigInt(args[0].amountInMaximum.toString())
  const amountOut = BigInt(args[0].amountOut.toString())
  const fee = Number(args[0].fee.toString())

  // Verify the maximum cost doesn't exceed the DAO's allocated budget
  if (amountInMaximum > maxEthBudget) {
    throw new Error(
      `Current market price for ${usdcTransferAmount} USDC exceeds the provided ETH budget of ${ethSwapAmount} ETH (Estimated cost with slippage: ${ethers.formatUnits(amountInMaximum, wethDecimals)} ETH)`
    )
  }

  const swapParams = buildSwapParamsExactOutput(
    args[0].tokenIn,
    args[0].tokenOut,
    fee,
    args[0].recipient,
    args[0].deadline.toString(),
    amountOut.toString(),
    amountInMaximum.toString()
  )

  const calls = []

  // Step 1: Wrap ETH to WETH (only the amount needed, including slippage)
  calls.push({
    contractAddress: weth.address,
    contractNameOrAbi: WETH_ABI,
    functionName: 'deposit',
    functionArgs: [],
    value: amountInMaximum,
  })

  // Step 2: Approve Router
  calls.push({
    contractAddress: weth.address,
    contractNameOrAbi: ERC20_ABI,
    functionName: 'approve',
    functionArgs: [SWAP_ROUTER_ADDRESS, amountInMaximum],
  })

  // Step 3: Exact Output Swap
  calls.push({
    contractAddress: SWAP_ROUTER_ADDRESS,
    contractNameOrAbi: SWAP_ROUTER_ABI,
    functionName: 'exactOutputSingle',
    functionArgs: [swapParams],
  })

  // Step 4: Transfer USDC
  calls.push({
    contractAddress: usdc.address,
    contractNameOrAbi: ERC20_ABI,
    functionName: 'transfer',
    functionArgs: [recipientAddress, transferAmount],
  })

  const proposalName = `Fund Unlock DAO Partnership with Rise Up Morning Show

This proposal funds the Unlock DAO's partnership with Rise Up Morning Show, a pilot campaign supporting educational content integration and community growth.

## Partnership Overview

**Campaign Details:**
- Duration: 3 months pilot campaign
- Total Value: $9,000 ($3,000/month) 
- First Payment: $${usdcTransferAmount} (this proposal)
- Second Payment: $4,500 (at 45-day mark via future proposal)

**Key Benefits:**
- Headline positioning: "The Rise Up Morning Show is Powered by Unlock Protocol"
- Educational content integration focused on Web3 and decentralized access
- Live appearances and community engagement opportunities
- Social media cross-promotion and amplification
- Product placement and organic mentions during broadcasts
- Use of Unlock Protocol for event access gating and proof-of-attendance

**Recipient:** Rise Up Morning Show  
**Payment Address:** ${recipientAddress}

## Technical Execution

This proposal uses an **Exact Output Swap** on Uniswap V3. This ensures the DAO reaches the exact USDC target even if the market moves between the time this proposal was created and executed.

**Execution Steps:**
1. Wrap up to ${ethers.formatUnits(amountInMaximum.toString(), wethDecimals)} ETH to WETH
2. Swap WETH to exactly ${usdcTransferAmount} USDC via Uniswap V3 on Base
3. Transfer $${usdcTransferAmount} USDC to Rise Up Morning Show
4. Any unused ETH from the slippage buffer remains in the DAO treasury (Uniswap only takes what is needed).

**Swap Details:**
- Target USDC: ${usdcTransferAmount} USDC
- Estimated ETH cost: ~${ethers.formatUnits(estimatedEthIn.toString(), wethDecimals)} ETH
- Max ETH budget allowed: ${ethSwapAmount} ETH
- Swap Slippage Setting: ${SLIPPAGE.toFixed(2)}%

## Strategic Value

This partnership provides:
- Brand exposure to Rise Up's engaged Web3 audience
- Educational content that explains Unlock Protocol's value proposition  
- Community growth through live events and tutorials
- Authentic integration rather than traditional advertising
- Data collection via affiliate tracking for conversion analysis

The partnership transforms traditional sponsorship into mutual growth collaboration, where both parties actively support each other's community development goals.`

  return {
    proposalName,
    calls,
  }
}
