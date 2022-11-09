import { NetworkConfigs } from '@unlock-protocol/types'
import { ethers } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { abi as UniswapV3FactoryABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'

export interface PoolOptions {
  network: number
  tokenIn: string
  tokenOut: string
  fee?: number
}

interface PriceOptions {
  network?: number
  baseToken: string
  quoteToken: string
  amount: number
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
    if (!(networkConfig.uniswapV3 && networkConfig.uniswapV3.factoryAddress)) {
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

  /**
   * Get base and quote token price for uniswap pool
   */
  async price({ network = 1, baseToken, quoteToken, amount }: PriceOptions) {
    const networkConfig = this.networks[network]

    if (!networkConfig.uniswapV3) {
      throw new Error('No subgraph URI found for the uniswap on this network')
    }

    const subgraphURI = networkConfig.uniswapV3.subgraph

    if (!subgraphURI) {
      throw new Error(
        'No subgraph in the network config provided for this subgraph.'
      )
    }

    const poolAddress = await this.getPoolAddress({
      network,
      tokenIn: baseToken,
      tokenOut: quoteToken,
    })

    if (poolAddress === ethers.constants.AddressZero) {
      throw new Error('Pool not found for the tokens.')
    }

    const client = new GraphQLClient(subgraphURI)
    const response = await client.request(
      `
      query PoolPrice($poolAddress: ID!) {
        pool(id: $poolAddress ) {
            token0Price
            token1Price
            token1 {
              id
            }
            token0 {
              id
          }
        }
    }
    `,
      {
        poolAddress: poolAddress.toLowerCase(),
      }
    )

    const pool = response.pool

    if (!pool) {
      throw new Error('No pool found with the baseToken and quoteToken')
    }

    const token1 = {
      id: pool.token1.id,
      price: pool.token1Price,
    }

    const token0 = {
      id: pool.token0.id,
      price: pool.token0Price,
    }

    const tokens = [token0, token1]

    const baseTokenPrice = tokens.find(
      (item) => item.id.toLowerCase() === baseToken.toLowerCase()
    )!.price

    const quoteTokenPrice = tokens.find(
      (item) => item.id.toLowerCase() === quoteToken.toLowerCase()
    )!.price

    const result = {
      baseTokenPrice: baseTokenPrice * amount,
      quoteTokenPrice: quoteTokenPrice * amount,
    }

    return result
  }
}
