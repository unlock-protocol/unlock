const bn = require('bignumber.js')
const { ethers } = require('hardhat')
const { Pool, Tick, TickListDataProvider } = require('@uniswap/v3-sdk/')
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { AlphaRouter, SwapType, nativeOnChain } = require('@uniswap/smart-order-router')
const JSBI  = require('jsbi')

const { abi: WethABI } = require('./ABIs/weth.json')
const { DAI, WETH, SHIBA_INU, USDC, UDT, addUDT, impersonate, addSomeETH } = require('./mainnet')
const { ADDRESS_ZERO, MAX_UINT } = require('./constants')

const POSITION_MANAGER_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
const UNISWAP_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
const UNISWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

// default fee
const FEE = 500
const BASIS_POINTS = 1000000

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

const getTokenInfo = async (tokenAddress) => {
  const token0 = await ethers.getContractAt('TestERC20', tokenAddress)
  const [decimals, symbol] = await Promise.all([
    await token0.decimals(),
    await token0.symbol(),
  ])
  return {
    decimals,
    symbol,
  }
}

const getTokens = async (pool) => {
  const { chainId } = await ethers.provider.getNetwork()
  const immutables = await getPoolImmutables(pool)

  const [token0, token1] = await Promise.all([
    getTokenInfo(immutables.token0),
    getTokenInfo(immutables.token1),
  ])
  const TokenA = new Token(
    chainId,
    immutables.token0,
    token0.decimals,
    token0.symbol
  )
  const TokenB = new Token(
    chainId,
    immutables.token1,
    token1.decimals,
    token1.symbol
  )
  return [TokenA, TokenB]
}

const creditTokens = async (tokenAddress, amount) => {
  const [signer] = await ethers.getSigners()
  await addSomeETH(signer.address, amount.mul(2))
  // wrapped some ETH
  if (tokenAddress === WETH) {
    const weth = await ethers.getContractAt(WethABI, WETH, signer)
    await weth.deposit({ value: amount })
    return weth
  }
  const token = await ethers.getContractAt('TestERC20', tokenAddress, signer)
  if (tokenAddress === UDT) {
    await addUDT(signer.address, amount)
  } else {
    await impersonate(tokenAddress)
    await token.transfer(signer.address, amount)
  }
  return token
}

const getMinTick = (tickSpacing) =>
  Math.ceil(-887272 / tickSpacing) * tickSpacing
const getMaxTick = (tickSpacing) =>
  Math.floor(887272 / tickSpacing) * tickSpacing

const addLiquidity = async (
  poolContract,
  rate = 42, // in basis point
  amount = 500 // how much tokens we add
) => {
  const {
    abi: INonfungiblePositionManager,
  } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json')

  // parse tokens for uniswap SDK
  const [tokenA, tokenB] = await getTokens(poolContract)
  console.log(
    `adding position for ${tokenA.symbol}/${tokenB.symbol} on pool ${poolContract.address} `
  )

  // token balances
  const tokenAContract = await creditTokens(
    tokenA.address,
    ethers.utils.parseUnits(amount.toString(), tokenA.decimals)
  )
  const tokenBContract = await creditTokens(
    tokenB.address,
    ethers.utils.parseUnits(amount.toString(), tokenB.decimals)
  )

  // approve spending
  await tokenAContract.approve(POSITION_MANAGER_ADDRESS, MAX_UINT)
  await tokenBContract.approve(POSITION_MANAGER_ADDRESS, MAX_UINT)

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
    amount0Desired: ethers.utils
      .parseUnits(amount.toString(), tokenA.decimals)
      .mul(rate)
      .div(BASIS_POINTS), // apply rate
    amount1Desired: ethers.utils.parseUnits(amount.toString(), tokenB.decimals),
    // no slippage protection, bad in prod!
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer.address,
    deadline: deadline,
  }

  // mint!
  const positionManager = await ethers.getContractAt(
    INonfungiblePositionManager,
    POSITION_MANAGER_ADDRESS
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

// get (or create if non-existing) a pool based on token0/token1 paris
// default pool is UDT/WETH
const createPool = async function ({
  token0 = UDT,
  token1 = WETH,
  rate = 42, // in basis point
} = {}) {
  /**
   * You need to build the artifacts first by running `yarn && yarn hardhat compile`
   * in `node_modules/@uniswap/v3-core` and `node_modules/@uniswap/v3-periphery`
   */
  const {
    abi: IUniswapV3PoolABI,
  } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
  const {
    abi: IUniswapV3Factory,
  } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json')
  const {
    abi: INonfungiblePositionManager,
  } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json')

  const factoryContract = await ethers.getContractAt(
    IUniswapV3Factory,
    UNISWAP_FACTORY_ADDRESS
  )

  let poolAddress = await factoryContract.getPool(token0, token1, FEE)
  if (poolAddress === ADDRESS_ZERO) {
    // create pool if necessary
    const positionManager = await ethers.getContractAt(
      INonfungiblePositionManager,
      POSITION_MANAGER_ADDRESS
    )
    // initialize pool at 1:1
    const { decimals: token0Decimals } = await getTokenInfo(token0)
    const { decimals: token1Decimals } = await getTokenInfo(token1)
    const sqrtPriceX96 = encodePriceSqrt(
      ethers.utils.parseUnits(rate.toString(), token0Decimals),
      ethers.utils.parseUnits(BASIS_POINTS.toString(), token1Decimals)
    )
    await positionManager.createAndInitializePoolIfNecessary(
      token0,
      token1,
      FEE,
      sqrtPriceX96
    )
    poolAddress = await factoryContract.getPool(token0, token1, FEE)
  }

  // pool
  const poolContract = await ethers.getContractAt(
    IUniswapV3PoolABI,
    poolAddress
  )
  await poolContract.increaseObservationCardinalityNext(10)
  return poolContract
}

const deployUniswapV3Oracle = async function () {
  const Oracle = await ethers.getContractFactory('UniswapV3Oracle')
  const oracle = await Oracle.deploy(UNISWAP_FACTORY_ADDRESS)
  return oracle
}


async function getUniswapRoute (
  tokenIn, 
  tokenOut, 
  amoutOut = ethers.utils.parseUnits('10', tokenOut.decimals),
  recipient,
  chainId = 1
) {
  // default to first signer
  if(!recipient) {
    const [signer] = await ethers.getSigners()
    recipient = signer.address
  }

  console.log(`Swap ${tokenIn.symbol} > ${tokenOut.symbol}`)
  console.log(`Out: ${amoutOut} to ${recipient}`)

  // init router
  const router = new AlphaRouter({ 
    chainId, 
    provider: ethers.provider,
  })

  // parse router args 
  const outputAmount = CurrencyAmount.fromRawAmount(tokenOut, JSBI.BigInt(amoutOut))
  const args = {
    outputAmount,
    quoteCurrency: tokenIn,
    swapType: TradeType.EXACT_OUTPUT,
    swapConfig: {
      type: SwapType.UNIVERSAL_ROUTER,
      recipient,
      slippageTolerance: new Percent(5, 100),
      deadline: Date.now() + 1800
    }
  }

  // call router
  const route = await router.route(
    ...Object.values(args)
  )

  // log some prices
  console.log(`Quote Exact In: ${route.quote.toFixed(2)}`);
  console.log(`Gas Adjusted Quote In: ${route.quoteGasAdjusted.toFixed(2)}`);
  console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed(6)}`);

  const { methodParameters, quote } = route
  const { 
      calldata: swapCalldata, 
      value, 
      to: swapRouter
  } = methodParameters

  // parse quote as BigNumber
  const amountInMax = ethers.BigNumber.from(
    JSBI.multiply(
      quote.numerator, 
      quote.denominator,
    ).toString()
  )
  return {
    swapCalldata,
    value,
    amountInMax,
    swapRouter,
    route
  }
}

const getUniswapTokens = (chainId = 1) => ({
  native: nativeOnChain(chainId),
  dai: new Token(chainId, DAI, 18, 'DAI'),
  weth: new Token(chainId, WETH, 18, 'WETH'),
  shiba: new Token(chainId, SHIBA_INU, 18, 'SHIBA'),
  usdc: new Token(chainId, USDC, 6, 'USDC'),
  udt: new Token(chainId, UDT, 18, 'UDT')
  // wBTC
})

module.exports = {
  addLiquidity,
  createUniswapV3Pool: createPool,
  deployUniswapV3Oracle,
  getPoolState,
  getPoolImmutables,
  getUniswapRoute,
  getUniswapTokens,
  POSITION_MANAGER_ADDRESS,
  UNISWAP_FACTORY_ADDRESS,
  UNISWAP_ROUTER_ADDRESS
}
