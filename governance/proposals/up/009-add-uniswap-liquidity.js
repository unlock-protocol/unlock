/**
 * This proposal aims to add full-range liquidity to a specific Uniswap V3 pool (WETH/UP) on Base
 * using a specific amount of ETH and the corresponding amount of UP tokens.
 * For simulation purposes, use `const DEADLINE_BUFFER = 24 * 60 * 60 * 365 * 80` for the deadline
 * due to the future time advanced during simulation tests.
 */
const { ethers } = require('hardhat')
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { networks } = require('@unlock-protocol/networks')
const { getTokenInfo } = require('@unlock-protocol/hardhat-helpers')
const {
  abi: IUniswapV3PoolABI,
} = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const JSBI = require('jsbi')
const { Token } = require('@uniswap/sdk-core')
const uniswapV3SDK = require('@uniswap/v3-sdk')
const { Pool, Position } = uniswapV3SDK

const FULL_RANGE_LOWER_TICK = -887220
const FULL_RANGE_UPPER_TICK = 887220
const SLIPPAGE = 950 // 5% slippage
const DEADLINE_BUFFER = 24 * 60 * 60 * 365 * 80

const ETH_AMOUNT = '10'
const DEADLINE = Math.floor(Date.now() / 1000) + DEADLINE_BUFFER

const TIMELOCK_ADDRESS = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'
const POOL_ADDRESS = '0x9EF81F4E2F2f15Ff1c0C3f8c9ECc636580025242'

const calculateMinimumAmount = (amountDesired) => {
  const amountMin = JSBI.divide(
    JSBI.multiply(JSBI.BigInt(amountDesired), JSBI.BigInt(SLIPPAGE)),
    JSBI.BigInt(1000)
  ).toString()
  return amountMin
}

const getPoolState = async (chainId = 8453) => {
  const poolContract = await ethers.getContractAt(
    IUniswapV3PoolABI,
    POOL_ADDRESS
  )

  const [token0Address, token1Address, fee, liquidity, slot0] =
    await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.liquidity(),
      poolContract.slot0(),
    ])

  const { symbol: token0Symbol, decimals: token0Decimals } =
    await getTokenInfo(token0Address)
  const { symbol: token1Symbol, decimals: token1Decimals } =
    await getTokenInfo(token1Address)

  return new Pool(
    new Token(chainId, token0Address, Number(token0Decimals), token0Symbol),
    new Token(chainId, token1Address, Number(token1Decimals), token1Symbol),
    Number(fee),
    slot0.sqrtPriceX96.toString(),
    liquidity.toString(),
    Number(slot0.tick)
  )
}

const calculatePosition = async (ethAmount) => {
  const pool = await getPoolState()

  const amount0Desired = ethers.parseUnits(
    ethAmount.toString(),
    pool.token0.decimals
  )

  const position = Position.fromAmount0({
    pool,
    tickLower: FULL_RANGE_LOWER_TICK,
    tickUpper: FULL_RANGE_UPPER_TICK,
    amount0: JSBI.BigInt(amount0Desired.toString()),
    useFullPrecision: true,
  })

  const amount0DesiredRaw = position.mintAmounts.amount0.toString()
  const amount1DesiredRaw = position.mintAmounts.amount1.toString()
  const amount0Min = calculateMinimumAmount(amount0DesiredRaw)
  const amount1Min = calculateMinimumAmount(amount1DesiredRaw)

  return {
    params: {
      token0: pool.token0.address,
      token1: pool.token1.address,
      fee: pool.fee,
      tickLower: FULL_RANGE_LOWER_TICK,
      tickUpper: FULL_RANGE_UPPER_TICK,
      amount0Desired: amount0DesiredRaw,
      amount1Desired: amount1DesiredRaw,
      amount0Min,
      amount1Min,
      recipient: TIMELOCK_ADDRESS,
      deadline: DEADLINE,
    },
    requiredAmounts: {
      token0: amount0DesiredRaw,
      token1: amount1DesiredRaw,
    },
  }
}

const buildProposalDescription = ({
  ethAmount,
  needsWrapping,
  needsWethApproval,
  needsUpApproval,
}) => `Add Liquidity to UP/WETH Uniswap Pool

This proposal deposits ${ethAmount} ETH and the corresponding amount of UP
tokens into a full-range position in the UP/WETH Uniswap V3 pool on Base. It will:

1. Improve liquidity and price stability for UP  
2. Generate fee income for the DAO  
3. Make it easier for users to trade UP  

The proposal executes these steps:
${[
  needsWrapping
    ? 'Wrap ETH to WETH (treasury WETH balance is insufficient)'
    : null,
  needsWethApproval ? 'Approve WETH for the position manager' : null,
  needsUpApproval ? 'Approve UP tokens for the position manager' : null,
  'Create the full‑range liquidity position',
]
  .filter(Boolean)
  .map((step, i) => `${i + 1}. ${step}`)
  .join('\n')}

The position will be owned by the DAO treasury (Timelock contract) and
can be managed through future governance proposals.`

const WETH_ABI = ['function deposit() payable']
const POSITION_MANAGER_ABI = [
  'function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)',
]

module.exports = async () => {
  const { tokens } = await getNetwork()
  const { chainId } = await ethers.provider.getNetwork()
  const {
    uniswapV3: { positionManager: positionManagerAddress },
  } = networks[chainId]

  const weth = tokens.find((token) => token.symbol === 'WETH')
  const up = tokens.find((token) => token.symbol === 'UP')
  const wethContract = await ethers.getContractAt(ERC20_ABI, weth.address)
  const upContract = await ethers.getContractAt(ERC20_ABI, up.address)
  const { params, requiredAmounts } = await calculatePosition(ETH_AMOUNT)
  const wethBalance = await wethContract.balanceOf(TIMELOCK_ADDRESS)
  const ethAmount = ethers.parseEther(ETH_AMOUNT)
  const needsWrapping = wethBalance < ethAmount

  const [wethAllowance, upAllowance] = await Promise.all([
    wethContract.allowance(TIMELOCK_ADDRESS, positionManagerAddress),
    upContract.allowance(TIMELOCK_ADDRESS, positionManagerAddress),
  ])

  const needsWethApproval = wethAllowance < ethAmount
  const needsUpApproval = upAllowance < BigInt(requiredAmounts.token1)

  const proposalName = buildProposalDescription({
    ethAmount: ETH_AMOUNT,
    needsWrapping,
    needsWethApproval,
    needsUpApproval,
  })

  const calls = []
  if (needsWrapping) {
    calls.push({
      contractAddress: weth.address,
      contractNameOrAbi: WETH_ABI,
      functionName: 'deposit',
      functionArgs: [],
      value: ethAmount,
    })
  }

  if (needsWethApproval) {
    calls.push({
      contractAddress: weth.address,
      contractNameOrAbi: ERC20_ABI,
      functionName: 'approve',
      functionArgs: [positionManagerAddress, ethAmount],
    })
  }

  if (needsUpApproval) {
    calls.push({
      contractAddress: up.address,
      contractNameOrAbi: ERC20_ABI,
      functionName: 'approve',
      functionArgs: [positionManagerAddress, requiredAmounts.token1],
    })
  }

  calls.push({
    contractAddress: positionManagerAddress,
    contractNameOrAbi: POSITION_MANAGER_ABI,
    functionName: 'mint',
    functionArgs: [params],
  })

  return {
    proposalName,
    calls,
  }
}
