const { ethers } = require('hardhat')
const {
  abi: IUniswapV3PoolABI,
} = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const {
  abi: IUniswapV3Factory,
} = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json')
const UniswapOracle = require('../helpers/ABIs/UniswapOracle.json')
const { abi: WethABI } = require('../helpers/ABIs/weth.json')
const {
  UNLOCK_ADDRESS,
  UNISWAP_FACTORY_ADDRESS,
  WETH,
  UDT,
  addUDT,
  impersonate,
} = require('../helpers/mainnet')
const { ADDRESS_ZERO } = require('../helpers/constants')

const FEE = 100
const DEFAULT_SWAP_TICK = ethers.BigNumber.from('1000')

const ONE = ethers.BigNumber.from(1)
const TWO = ethers.BigNumber.from(2)

const sqrt = (value) => {
  const x = ethers.BigNumber.from(value)
  let z = x.add(ONE).div(TWO)
  let y = x
  while (z.sub(y).isNegative()) {
    y = z
    z = x.div(z).add(z).div(TWO)
  }
  return y
}

const getX96 = (price) => sqrt(price).mul(TWO.pow(96))

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

const nearestUsableTick = (tick, tickSpacing) =>
  Math.round(tick / tickSpacing) * tickSpacing

const createPool = async function ({
  tokenIn = UDT,
  tokenOut = WETH,
  recipient = UNLOCK_ADDRESS,
  price = DEFAULT_SWAP_TICK,
  amount = ethers.utils.parseEther('50'),
} = {}) {
  const factoryContract = await ethers.getContractAt(
    IUniswapV3Factory,
    UNISWAP_FACTORY_ADDRESS
  )
  let poolAddress = await factoryContract.getPool(tokenIn, tokenOut, FEE)
  // create pool if necessary
  if (poolAddress === ADDRESS_ZERO) {
    const tx = await factoryContract.createPool(tokenIn, tokenOut, FEE)
    const { events } = await tx.wait()
    const { args } = events.find(({ event }) => event === 'PoolCreated')
    ;({ pool: poolAddress } = args)
  }

  // pool
  const pool = await ethers.getContractAt(IUniswapV3PoolABI, poolAddress)
  const { maxLiquidityPerTick, tickSpacing } = await getPoolImmutables(pool)

  if (amount.gt(maxLiquidityPerTick)) {
    throw Error('Amount too big')
  }

  // initialize pool if necessary
  const { sqrtPriceX96: sqrtPriceX96Existing } = await getPoolState(pool)
  if (sqrtPriceX96Existing.toString() === '0') {
    const sqrtPriceX96 = getX96(price)
    await pool.initialize(sqrtPriceX96)
  }

  // token balances
  await impersonate(recipient)
  const signer = await ethers.getSigner(recipient)
  const token0 = await ethers.getContractAt('TestERC20', tokenIn, signer)
  if (tokenIn === UDT) {
    await addUDT(recipient, amount)
  }

  // wrapped some ETH
  const token1 = await ethers.getContractAt(
    tokenOut === WETH ? WethABI : 'TestERC20',
    tokenOut,
    signer
  )
  if (tokenOut === WETH) {
    await token1.deposit({ value: amount })
  }

  // approve spending
  await token0.approve(poolAddress, amount)
  await token1.approve(poolAddress, amount)

  // mint liquidity
  const { tick } = await getPoolState(pool)

  // TODO: throw here for now...
  console.log([
    recipient,
    nearestUsableTick(tick, tickSpacing) - tickSpacing * 2,
    nearestUsableTick(tick, tickSpacing) + tickSpacing * 2,
    amount,
  ])
  await pool.mint(
    recipient,
    nearestUsableTick(tick, tickSpacing) - tickSpacing * 2,
    nearestUsableTick(tick, tickSpacing) + tickSpacing * 2,
    amount,
    []
  )
  console.log(await getPoolState(pool))

  return pool
}

const deployOracle = async function () {
  const { abi, bytecode } = UniswapOracle
  const Oracle = await ethers.getContractFactory(abi, bytecode)
  const oracle = await Oracle.deploy(UNISWAP_FACTORY_ADDRESS)
  return oracle
}

module.exports = {
  deployOracle,
  createPool,
}
