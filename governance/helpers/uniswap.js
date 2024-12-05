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

module.exports = {
  createOrGetUniswapV3Pool: createOrGetPool,
  deployUniswapV3Oracle,
  getUniswapV3Contracts,
  getTokenInfo,
  getPoolState,
  getPoolImmutables,
}
