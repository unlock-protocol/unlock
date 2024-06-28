const bn = require('bignumber.js')
const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const {
  ADDRESS_ZERO,
  WETH,
  UDT,
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

module.exports = {
  createOrGetUniswapV3Pool: createOrGetPool,
  deployUniswapV3Oracle,
  getTokenInfo,
  getPoolState,
  getPoolImmutables,
}
