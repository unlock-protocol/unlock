const bn = require('bignumber.js')
const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const {
  ADDRESS_ZERO,
  WETH,
  UDT,
  getTokenInfo,
} = require('@unlock-protocol/hardhat-helpers')
const uniswapV3SDK = require('@uniswap/v3-sdk')
const { Pool } = uniswapV3SDK
const { Token } = require('@uniswap/sdk-core')
// default fee
const FEE = 500
const QUOTER_ADDRESS = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' // Base Quoter V2

// returns the sqrt price as a 64x96
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
function encodePriceSqrt(reserve1, reserve0) {
  return ethers.BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

async function getPoolImmutables(poolContract) {
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    await Promise.all([
      poolContract.factory(),
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.maxLiquidityPerTick(),
    ])

  const immutables = {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  }
  return immutables
}

async function getPoolState(poolContract) {
  const [liquidity, slot] = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  const PoolState = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  }

  return PoolState
}

const getUniswapV3Contracts = async function () {
  /**
   * You can get the latest version of the ABIS by building artifacts from the node_modules
   * in the root of the monorepo first by running `yarn && yarn hardhat compile`
   * in `node_modules/@uniswap/v3-core` and `node_modules/@uniswap/v3-periphery`
   *
   * Keeping them hardcoded here as they are uniswap v3 and wont get updated anymore
   */
  const INonfungiblePositionManager = [
    'event Approval(address indexed,address indexed,uint256 indexed)',
    'event ApprovalForAll(address indexed,address indexed,bool)',
    'event Collect(uint256 indexed,address,uint256,uint256)',
    'event DecreaseLiquidity(uint256 indexed,uint128,uint256,uint256)',
    'event IncreaseLiquidity(uint256 indexed,uint128,uint256,uint256)',
    'event Transfer(address indexed,address indexed,uint256 indexed)',
    'function DOMAIN_SEPARATOR() view returns (bytes32)',
    'function PERMIT_TYPEHASH() pure returns (bytes32)',
    'function WETH9() view returns (address)',
    'function approve(address,uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function burn(uint256) payable',
    'function collect((uint256,address,uint128,uint128)) payable returns (uint256,uint256)',
    'function createAndInitializePoolIfNecessary(address,address,uint24,uint160) payable returns (address)',
    'function decreaseLiquidity((uint256,uint128,uint256,uint256,uint256)) payable returns (uint256,uint256)',
    'function factory() view returns (address)',
    'function getApproved(uint256) view returns (address)',
    'function increaseLiquidity((uint256,uint256,uint256,uint256,uint256,uint256)) payable returns (uint128,uint256,uint256)',
    'function isApprovedForAll(address,address) view returns (bool)',
    'function mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256)) payable returns (uint256,uint128,uint256,uint256)',
    'function name() view returns (string)',
    'function ownerOf(uint256) view returns (address)',
    'function permit(address,uint256,uint256,uint8,bytes32,bytes32) payable',
    'function positions(uint256) view returns (uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)',
    'function refundETH() payable',
    'function safeTransferFrom(address,address,uint256)',
    'function safeTransferFrom(address,address,uint256,bytes)',
    'function setApprovalForAll(address,bool)',
    'function supportsInterface(bytes4) view returns (bool)',
    'function sweepToken(address,uint256,address) payable',
    'function symbol() view returns (string)',
    'function tokenByIndex(uint256) view returns (uint256)',
    'function tokenOfOwnerByIndex(address,uint256) view returns (uint256)',
    'function tokenURI(uint256) view returns (string)',
    'function totalSupply() view returns (uint256)',
    'function transferFrom(address,address,uint256)',
    'function unwrapWETH9(uint256,address) payable',
  ]

  const IUniswapV3Factory = [
    'event FeeAmountEnabled(uint24 indexed,int24 indexed)',
    'event OwnerChanged(address indexed,address indexed)',
    'event PoolCreated(address indexed,address indexed,uint24 indexed,int24,address)',
    'function createPool(address,address,uint24) returns (address)',
    'function enableFeeAmount(uint24,int24)',
    'function feeAmountTickSpacing(uint24) view returns (int24)',
    'function getPool(address,address,uint24) view returns (address)',
    'function owner() view returns (address)',
    'function setOwner(address)',
  ]

  const { chainId } = await ethers.provider.getNetwork()
  const {
    uniswapV3: { factoryAddress, positionManager: positionManagerAddress },
  } = networks[chainId]

  const factory = await ethers.getContractAt(IUniswapV3Factory, factoryAddress)

  // swap position NFT issuer
  const positionManager = await ethers.getContractAt(
    INonfungiblePositionManager,
    positionManagerAddress
  )

  return { factory, positionManager }
}

const getPool = async (token0, token1, fee) => {
  const {
    abi: IUniswapV3PoolABI,
  } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')

  const { factory } = await getUniswapV3Contracts()
  const poolAddress = await factory.getPool(token0, token1, fee)
  const pool = await ethers.getContractAt(IUniswapV3PoolABI, poolAddress)
  return pool
}

// initialize pool at 1:1
const createPool = async function (
  token0 = WETH,
  token1 = UDT,
  fee = FEE,
  [reserve0, reserve1]
) {
  const { positionManager } = await getUniswapV3Contracts()

  const sqrtPriceX96 = encodePriceSqrt(reserve1, reserve0)

  const tx = await positionManager.createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    sqrtPriceX96
  )

  const pool = await getPool(token0, token1, fee)
  console.log(`Pool created at ${pool.address} - (tx: ${tx.hash})`)
  return pool
}

// get (or create if non-existing) a pool based on token0/token1 paris
// default pool is UDT/WETH
const createOrGetPool = async function (
  token0 = WETH,
  token1 = UDT,
  fee = FEE,
  reserves = []
) {
  const { symbol: token0Symbol } = await getTokenInfo(token0)
  const { symbol: token1Symbol } = await getTokenInfo(token1)
  console.log(`Create/get pool ${token0Symbol}/${token1Symbol} (fee ${fee})`)

  let pool = await getPool(token0, token1, fee)

  if (pool.address === ADDRESS_ZERO) {
    console.log(`Pool doesn't exist, creating pool...`)
    pool = await createPool(token0, token1, fee, reserves)
    await pool.increaseObservationCardinalityNext(10)
  }

  return pool
}

const deployUniswapV3Oracle = async function () {
  const { chainId } = await ethers.provider.getNetwork()
  const { factoryAddress } = networks[chainId]
  const Oracle = await ethers.getContractFactory('UniswapOracleV3')
  const oracle = await Oracle.deploy(factoryAddress)
  return oracle
}

// Build swap parameters for Uniswap V3 SwapRouter
const buildSwapParams = function (
  tokenIn,
  tokenOut,
  fee,
  recipient,
  deadline,
  amountIn,
  amountOutMinimum
) {
  return {
    tokenIn,
    tokenOut,
    fee,
    recipient,
    deadline,
    amountIn,
    amountOutMinimum,
    sqrtPriceLimitX96: 0,
  }
}

// Calculate minimum amount with slippage protection
const calculateMinimumAmount = function (amountOut, slippageBasisPoints = 50) {
  return (
    (BigInt(amountOut) * BigInt(10000 - slippageBasisPoints)) / BigInt(10000)
  )
}

// Get quote for exact input swap using Uniswap V3 Quoter
const getUniswapV3Quote = async function (tokenIn, tokenOut, fee, amountIn) {
  try {
    const QuoterV2ABI = [
      'function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
    ]

    const quoter = await ethers.getContractAt(QuoterV2ABI, QUOTER_ADDRESS)

    const quoteParams = {
      tokenIn,
      tokenOut,
      amountIn,
      fee,
      amount: '0',
      sqrtPriceLimitX96: 0,
    }

    const quote = await quoter.quoteExactInputSingle.staticCall(quoteParams)
    const amountOut = quote[0]

    return amountOut
  } catch (error) {
    throw error.message
  }
}

async function getToken(address) {
  const contract = await ethers.getContractAt(
    [
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function name() view returns (string)',
    ],
    address
  )

  const [symbol, decimals, name] = await Promise.all([
    contract.symbol(),
    contract.decimals(),
    contract.name(),
  ])

  const { chainId } = await ethers.provider.getNetwork()
  return new Token(Number(chainId), address, Number(decimals), symbol, name)
}

async function initializeTokens(token0Address, token1Address) {
  const TOKEN0_TOKEN = await getToken(token0Address)
  const TOKEN1_TOKEN = await getToken(token1Address)
  return {
    token0: TOKEN0_TOKEN,
    token1: TOKEN1_TOKEN,
  }
}

async function getPoolByAddress(address) {
  const {
    abi: IUniswapV3PoolABI,
  } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')

  const poolContract = await ethers.getContractAt(IUniswapV3PoolABI, address)

  const [token0Addr, token1Addr, fee, liquidity, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  const token0 = await getToken(token0Addr)
  const token1 = await getToken(token1Addr)

  return new Pool(
    token0,
    token1,
    Number(fee),
    slot0[0].toString(),
    liquidity.toString(),
    Number(slot0[1])
  )
}

module.exports = {
  createOrGetUniswapV3Pool: createOrGetPool,
  deployUniswapV3Oracle,
  getUniswapV3Contracts,
  getTokenInfo,
  getPoolState,
  getPoolImmutables,
  getUniswapV3Quote,
  buildSwapParams,
  calculateMinimumAmount,
  initializeTokens,
  getPoolByAddress,
}
