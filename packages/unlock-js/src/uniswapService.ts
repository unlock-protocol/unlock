import { NetworkConfigs } from '@unlock-protocol/types'
import { TickMath, FullMath } from '@uniswap/v3-sdk'
import { abi as UniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { abi as UniswapV3FactoryABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import { ethers, providers } from 'ethers'
import JSBI from 'jsbi'
import { getErc20Decimals } from './erc20'

/**
 * Function converted from the following references
 * https://github.com/Uniswap/v3-periphery/blob/main/contracts/libraries/OracleLibrary.sol
 * https://gist.github.com/BlockmanCodes/496b087c3632e93c3998b0020118a33c
 */

export interface PoolOptions {
  network: number
  tokenIn: string
  tokenOut: string
  fee?: number
}

export interface ConsultOptions {
  network: number
  tokenIn: string
  tokenOut: string
  range?: [number, number]
}

export interface GetQuoteAtTickOptions {
  tick: number
  amount: string
  baseToken: string
  quoteToken: string
  network: number
}

export class UniswapService {
  constructor(public networks: NetworkConfigs = networks) {}
  getNetworkConfigAndProvider(networkId: number) {
    const networkConfig = this.networks[networkId]
    if (!networkConfig) {
      throw new Error(`No network found for the id: ${networkId}`)
    }
    const provider = new ethers.providers.JsonRpcProvider(
      networkConfig.provider
    )
    return {
      networkConfig,
      provider,
    }
  }

  // Calculates time-weighted means of tick for a uniswap pool. This does not provide for liqiduity.
  async consult({
    network,
    tokenIn,
    tokenOut,
    // 5 min by default
    range = [60 * 5, 0],
  }: ConsultOptions) {
    const UniswapV3Pool = await this.getPoolContract({
      tokenIn,
      tokenOut,
      network,
    })

    // Fetch the data from the pool
    const observedData = await UniswapV3Pool.observe(range)

    const [firstTickCumulative, secondTickCumulative] =
      observedData.tickCumulatives.map((value: unknown) => Number(value))

    // Delta of the two points on the range
    const tickCumulativeDelta = secondTickCumulative - firstTickCumulative

    // Mean arithmetic of the ticks over the start range
    const meanTick = (tickCumulativeDelta / range[0]).toFixed(0)

    return parseInt(meanTick, 10)
  }

  // Given a tick, baseToken amount and quoteToken address , calculates the amount of token received in exchange in quoteToken denomination
  async getQuoteAtTick({
    tick,
    amount,
    baseToken,
    quoteToken,
    network,
  }: GetQuoteAtTickOptions) {
    const { provider } = this.getNetworkConfigAndProvider(network)
    const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)

    // get sqrt ratio
    const ratioX96 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96)

    // Get the erc20 decimals for the baseToken
    const baseAmountDecimal = await getErc20Decimals(baseToken, provider)
    // Get the erc20 decimals for the quoteToken
    const quoteTokenDecimal = await getErc20Decimals(quoteToken, provider)

    // Format the base number using decimal in bigInt
    const baseAmount = JSBI.BigInt(
      ethers.utils.parseUnits(amount, baseAmountDecimal)
    )

    // Create a shift
    const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192))

    let quoteAmount: JSBI

    if (baseToken < quoteToken) {
      quoteAmount = FullMath.mulDivRoundingUp(ratioX96, baseAmount, shift)
    } else {
      quoteAmount = FullMath.mulDivRoundingUp(shift, baseAmount, ratioX96)
    }

    return ethers.utils.formatUnits(quoteAmount.toString(), quoteTokenDecimal)
  }

  /**
   * Get the pool contract. This function will find the relevant pool address given the in and out token erc20 addresses.
   */
  async getPoolContract(options: PoolOptions) {
    const { provider } = this.getNetworkConfigAndProvider(options.network)
    const poolAddress = await this.getPoolAddress(options)

    if (poolAddress === ethers.constants.AddressZero) {
      throw new Error('No pool address found for the tokens.')
    }

    const PoolContract = new ethers.Contract(
      poolAddress,
      UniswapV3PoolABI,
      provider
    )
    return PoolContract
  }

  /**
   * Get pool address for erc20 token in and token out pairs on uniswap. By default, we find the 5% fee pools.
   */
  async getPoolAddress({ tokenOut, tokenIn, network, fee = 500 }: PoolOptions) {
    const { networkConfig, provider } =
      this.getNetworkConfigAndProvider(network)

    // Check if network config has uniswap v3 address we can use for querying.
    if (!networkConfig?.uniswapV3) {
      throw new Error(
        'No uniswap address found for the network in networkConfig'
      )
    }

    // Initialize factory contract
    const UniswapV3Factory = new ethers.Contract(
      networkConfig.uniswapV3.factoryAddress,
      UniswapV3FactoryABI,
      provider
    )

    // Get pool Address for the tokens from the uniswap factory.
    const poolAddress = await UniswapV3Factory.getPool(tokenIn, tokenOut, fee)
    return poolAddress
  }
}
