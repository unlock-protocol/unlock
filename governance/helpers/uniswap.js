const bn = require('bignumber.js')
const { ethers } = require('hardhat')
const { Pool, Tick, TickListDataProvider } = require('@uniswap/v3-sdk')
const { Token } = require('@uniswap/sdk-core')
const { networks } = require('@unlock-protocol/networks')
const {
  ADDRESS_ZERO,
  BASIS_POINTS,
  MAX_UINT,
  WETH,
  UDT,
  getERC20Contract,
  getTokenInfo,
} = require('@unlock-protocol/hardhat-helpers')

// default fee
const FEE = 500

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

const getToken = async (tokenAddress) => {
  const { chainId } = await ethers.provider.getNetwork()
  const token0 = await getTokenInfo(tokenAddress)
  const Token0 = new Token(
    chainId,
    tokenAddress,
    token0.decimals,
    token0.symbol
  )
  return Token0
}

const getMinTick = (tickSpacing) =>
  Math.ceil(-887272 / tickSpacing) * tickSpacing
const getMaxTick = (tickSpacing) =>
  Math.floor(887272 / tickSpacing) * tickSpacing

const addLiquidity = async (
  poolContract,
  [tokenAddressA, amountA],
  [tokenAddressB, amountB]
) => {
  const {
    abi: INonfungiblePositionManager,
  } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json')

  // parse tokens for uniswap SDK
  const [tokenA, tokenB] = await Promise.all([
    getToken(tokenAddressA),
    getToken(tokenAddressB),
  ])
  console.log(
    `adding position for ${tokenA.symbol}/${tokenB.symbol} on pool ${poolContract.address} \n`,
    ` amount ${tokenA.symbol} : ${amountA} \n`,
    ` amount ${tokenB.symbol} : ${amountB}`
  )

  //
  const { chainId } = await ethers.provider.getNetwork()
  const {
    uniswapV3: { positionManager: positionManagerAddress },
  } = networks[chainId]

  // token balances
  const tokenAContract = await getERC20Contract(tokenA.address)
  const tokenBContract = await getERC20Contract(tokenB.address)

  // approve spending
  await tokenAContract.approve(positionManagerAddress, MAX_UINT)
  await tokenBContract.approve(positionManagerAddress, MAX_UINT)

  // Pool setup
  const { fee: poolFee, tickSpacing } = await getPoolImmutables(poolContract)

  // Pool Price
  const {
    liquidity,
    sqrtPriceX96, // slot[0]
    tick, // slot[1]
  } = await getPoolState(poolContract)

  // Get the nearest index
  const nearestIndex = Math.floor(tick / tickSpacing) * tickSpacing

  // Create a tick index
  const tickLowerIndex = nearestIndex - 60 * 100
  const tickUpperIndex = nearestIndex + 60 * 100

  // Tick Data
  const tickLowerData = await poolContract.ticks(tickLowerIndex)
  const tickUpperData = await poolContract.ticks(tickUpperIndex)

  // Tick Instance
  const tickLower = new Tick({
    index: tickLowerIndex,
    liquidityGross: tickLowerData.liquidityGross,
    liquidityNet: tickLowerData.liquidityNet,
  })

  const tickUpper = new Tick({
    index: tickUpperIndex,
    liquidityGross: tickUpperData.liquidityGross,
    liquidityNet: tickUpperData.liquidityNet,
  })

  // Tick List
  const tickList = new TickListDataProvider([tickLower, tickUpper], tickSpacing)
  const pool = new Pool(
    tokenA,
    tokenB,
    poolFee,
    sqrtPriceX96,
    liquidity,
    tick,
    tickList
  )

  const [signer] = await ethers.getSigners()
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20
  const mintParams = {
    token0: tokenA.address,
    token1: tokenB.address,
    fee: pool.fee,
    // use min/max ticks to provide liquidity across the whole range of the pool
    tickLower: getMinTick(tickSpacing),
    tickUpper: getMaxTick(tickSpacing),
    // trade a 1:1
    amount0Desired: amountA,
    amount1Desired: amountB,
    // no slippage protection, bad in prod!
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer.address,
    deadline: deadline,
  }

  // mint!
  const positionManager = await ethers.getContractAt(
    INonfungiblePositionManager,
    positionManagerAddress
  )

  const mintTransaction = await positionManager.mint(mintParams, {
    // value,
    gasPrice: 20e9,
  })
  const { events } = await mintTransaction.wait()
  const {
    args: { tokenId, liquidity: addedLiquidity, amount0, amount1 },
  } = events.find(({ event }) => event === 'IncreaseLiquidity')

  const tokenURI = await positionManager.tokenURI(tokenId)
  const decoded = Buffer.from(
    tokenURI.substr('data:application/json;base64,'.length),
    'base64'
  ).toString('utf8')

  return {
    tokenId,
    liquidity: addedLiquidity,
    amount0,
    amount1,
    tokenURI: JSON.parse(decoded),
  }
}

const getUniswapV3Contracts = async function () {
  /**
   * You need to build the artifacts first by running `yarn && yarn hardhat compile`
   * in `node_modules/@uniswap/v3-core` and `node_modules/@uniswap/v3-periphery`
   */
  const {
    abi: IUniswapV3Factory,
  } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json')

  const {
    abi: INonfungiblePositionManager,
  } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json')

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
const createPool = async function (token0 = WETH, token1 = UDT, fee = FEE) {
  const { positionManager } = await getUniswapV3Contracts()

  const { decimals: token1Decimals } = await getTokenInfo(token0)
  const { decimals: token0Decimals } = await getTokenInfo(token1)

  const sqrtPriceX96 = encodePriceSqrt(
    ethers.utils.parseUnits(BASIS_POINTS.toString(), token1Decimals),
    ethers.utils.parseUnits(BASIS_POINTS.toString(), token0Decimals)
  )

  await positionManager.createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    sqrtPriceX96
  )

  const { pool } = await getPool(token0, token1, fee)
  console.log(`Pool created at ${pool.address}`)
  return pool
}

// get (or create if non-existing) a pool based on token0/token1 paris
// default pool is UDT/WETH
const createOrGetPool = async function (
  token0 = WETH,
  token1 = UDT,
  fee = FEE
) {
  console.log(`Create pool ${token0Symbol}/${token1Symbol} (fee ${fee})`)

  const { symbol: token0Symbol } = await getTokenInfo(token0)
  const { symbol: token1Symbol } = await getTokenInfo(token1)

  let { pool } = await getPool(token0, token1, fee)

  if (pool.address === ADDRESS_ZERO) {
    console.log(`Pool doesn't exist, creating pool...`)
    pool = await createPool(token0, token1, fee)
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

module.exports = {
  addLiquidity,
  createOrGetUniswapV3Pool: createOrGetPool,
  deployUniswapV3Oracle,
  getTokenInfo,
  getPoolState,
  getPoolImmutables,
}
