import { NetworkConfigs } from '@unlock-protocol/types'
import { TickMath, FullMath } from '@uniswap/v3-sdk'
import { abi as UniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { abi as UniswapV3FactoryABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import { ethers } from 'ethers'
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

export interface PoolContractOptions {
  network: number
  poolAddress: string
}

export interface ConsultOptions {
  network: number
  poolAddress: string
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

  pools = new Map<string, string>()

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
    poolAddress,
    network = 1,
    // 5 min by default
    range = [60 * 5, 0],
  }: ConsultOptions) {
    const UniswapV3Pool = this.getPoolContract({
      poolAddress: poolAddress,
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

    const [baseTokenDecimal, quoteTokenDecimal] = await Promise.all([
      getErc20Decimals(baseToken, provider),
      getErc20Decimals(quoteToken, provider),
    ])

    // Format the base number using decimal in bigInt
    const baseAmount = JSBI.BigInt(
      ethers.utils.parseUnits(amount, baseTokenDecimal)
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
   * Get the pool contract.
   */
  getPoolContract({ poolAddress: address, network = 1 }: PoolContractOptions) {
    const { provider } = this.getNetworkConfigAndProvider(network)

    if (address === ethers.constants.AddressZero) {
      throw new Error('No pool address found for the tokens.')
    }

    const PoolContract = new ethers.Contract(
      address,
      UniswapV3PoolABI,
      provider
    )
    return PoolContract
  }

  /**
   * Get pool address for erc20 token in and token out pairs on uniswap. By default, we find the 5% fee pools.
   */
  async getPoolAddress({
    tokenOut,
    tokenIn,
    network,
    fee = 3000,
  }: PoolOptions) {
    const { networkConfig, provider } =
      this.getNetworkConfigAndProvider(network)

    // Check if network config has uniswap v3 address we can use for querying.
    if (!networkConfig.uniswapV3) {
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

  // Get last observed seconds ago
  async getOldestObservation({
    network,
    poolAddress,
  }: {
    network: number
    poolAddress: string
  }) {
    const UniswapV3Pool = this.getPoolContract({
      poolAddress,
      network,
    })

    const { observationIndex, observationCardinality } =
      await UniswapV3Pool.slot0()

    let { blockTimestamp: observationTimestamp, initialized } =
      await UniswapV3Pool.observations(
        (observationIndex + 1) % observationCardinality
      )

    if (!initialized) {
      const { blockTimestamp: initializedObservationTimestamp } =
        await UniswapV3Pool.observations(0)
      observationTimestamp = initializedObservationTimestamp
    }

    const secondsAgo: number =
      Math.round(Date.now() / 1000) - observationTimestamp

    return secondsAgo
  }
}
