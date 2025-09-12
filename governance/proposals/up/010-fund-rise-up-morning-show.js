/**
 * This proposal swaps ETH to USDC on Uniswap V3 and transfers USDC to Rise Up Morning Show
 * for partnership funding as approved by the DAO.
 */
const { ethers } = require('hardhat')
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')
const uniswapV3SDK = require('@uniswap/v3-sdk')
const { Route, Trade, SwapRouter } = uniswapV3SDK
const { CurrencyAmount, Percent, TradeType } = require('@uniswap/sdk-core')
const { getNetwork, getTokenInfo } = require('@unlock-protocol/hardhat-helpers')
const {
  getUniswapV3Quote,
  buildSwapParams,
  initializeTokens,
  getPoolByAddress,
} = require('../../helpers/uniswap')
const SWAP_ROUTER_ABI = require('../../helpers/abi/swapRouter2.json')

// Placeholder constants - to be configured per proposal
const ETH_SWAP_AMOUNT = '0.01' // ETH amount to swap (reduced for testing)
const USDC_TRANSFER_AMOUNT = '10' // $10 USDC as string
const RECIPIENT_ADDRESS = '0xCA7632327567796e51920F6b16373e92c7823854' // Rise Up Morning Show
const TIMELOCK_ADDRESS = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b' // Base timelock

const SWAP_ROUTER_ADDRESS = '0x2626664c2603336E57B271c5C0b26F421741e481' // SwapRouter02 on Base
const POOL_ADDRESS = '0xd0b53D9277642d899DF5C87A3966A349A798F224'

const SLIPPAGE = new Percent(50, 10_000) // 0.5%
const DEADLINE_BUFFER = 24 * 60 * 60 * 365 * 80
const UNISWAP_FEE = 500 // 0.05% fee tier

// ABIs
const WETH_ABI = ['function deposit() payable']

module.exports = async ({
  ethSwapAmount = ETH_SWAP_AMOUNT,
  usdcTransferAmount = USDC_TRANSFER_AMOUNT,
  recipientAddress = RECIPIENT_ADDRESS,
  timelockAddress = TIMELOCK_ADDRESS,
} = {}) => {
  const { tokens } = await getNetwork()
  const weth = tokens.find((token) => token.symbol === 'WETH')
  const usdc = tokens.find((token) => token.symbol === 'USDC')
  const { decimals: wethDecimals } = await getTokenInfo(weth.address)
  const { decimals: usdcDecimals } = await getTokenInfo(usdc.address)

  // Parse amounts using correct decimals
  const amountIn = ethers.parseUnits(ethSwapAmount.toString(), wethDecimals)
  const transferAmount = ethers.parseUnits(
    usdcTransferAmount.toString(),
    usdcDecimals
  )
  const deadline = Math.floor(Date.now() / 1000) + DEADLINE_BUFFER

  // Get expected USDC output from swap
  const expectedUsdcOut = await getUniswapV3Quote(
    weth.address,
    usdc.address,
    UNISWAP_FEE,
    amountIn
  )

  const calls = []

  calls.push({
    contractAddress: weth.address,
    contractNameOrAbi: WETH_ABI,
    functionName: 'deposit',
    functionArgs: [],
    value: amountIn,
  })

  calls.push({
    contractAddress: weth.address,
    contractNameOrAbi: ERC20_ABI,
    functionName: 'approve',
    functionArgs: [SWAP_ROUTER_ADDRESS, amountIn],
  })

  // 3. Swap WETH to USDC
  const pool = await getPoolByAddress(POOL_ADDRESS)

  const { token0: WETH_TOKEN, token1: USDC_TOKEN } = await initializeTokens(
    weth.address,
    usdc.address
  )
  const swapRoute = new Route([pool], WETH_TOKEN, USDC_TOKEN)

  const uncheckedTrade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(WETH_TOKEN, amountIn.toString()),
    outputAmount: CurrencyAmount.fromRawAmount(
      USDC_TOKEN,
      expectedUsdcOut.toString()
    ),
    tradeType: TradeType.EXACT_INPUT,
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

  const swapParams = buildSwapParams(
    args[0].tokenIn,
    args[0].tokenOut,
    args[0].fee,
    args[0].recipient,
    args[0].deadline.toString(),
    args[0].amountIn.toString(),
    args[0].amountOutMinimum.toString()
  )

  // Verify we'll get enough USDC to make the transfer
  if (args[0].amountOutMinimum < transferAmount) {
    const errorMsg = `Insufficient USDC expected from swap. Need ${ethers.formatUnits(transferAmount, usdcDecimals)} USDC but will get minimum ${ethers.formatUnits(args[0].amountOutMinimum, usdcDecimals)} USDC`
    throw new Error(errorMsg)
  }

  calls.push({
    contractAddress: SWAP_ROUTER_ADDRESS,
    contractNameOrAbi: SWAP_ROUTER_ABI,
    functionName: 'exactInputSingle',
    functionArgs: [swapParams],
  })

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

This proposal will:
1. Wrap ${ethSwapAmount} ETH to WETH
2. Swap WETH to USDC via Uniswap V3 on Base (0.05% fee tier)
3. Transfer $${usdcTransferAmount} USDC to Rise Up Morning Show

**Swap Details:**
- Expected USDC from swap: ~${ethers.formatUnits(expectedUsdcOut, usdcDecimals)} USDC
- Minimum USDC (with ${SLIPPAGE.toFixed(2)}% slippage): ~${ethers.formatUnits(args[0].amountOutMinimum.toString(), usdcDecimals)} USDC
- Transfer amount: ${ethers.formatUnits(transferAmount, usdcDecimals)} USDC
- Any excess USDC remains in DAO treasury

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
