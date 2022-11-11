import { NetworkConfigs } from '@unlock-protocol/types'
import { ethers } from 'ethers'
import { EthersMulticall } from '@morpho-labs/ethers-multicall'
import QuoterABI from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import { getErc20Decimals } from './erc20'
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
  amount: string
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
   * Get base and quote token price for uniswap pool
   */
  async price({ network = 1, baseToken, quoteToken, amount }: PriceOptions) {
    const { networkConfig, provider } =
      this.getNetworkConfigAndProvider(network)

    if (!networkConfig.uniswapV3) {
      throw new Error('The network config does not provide a uniswap object')
    }

    const multicall = new EthersMulticall(provider)

    const wrappedCurrency = networkConfig.wrappedNativeCurrency
    const quoterAddress = networkConfig.uniswapV3.quoterAddress

    if (!(quoterAddress && wrappedCurrency)) {
      throw new Error(
        'Quoter contract address and wrapped currency missing for the network'
      )
    }

    const [baseTokenDecimal, quoteTokenDecimal] = await Promise.all([
      getErc20Decimals(baseToken, provider),
      getErc20Decimals(quoteToken, provider),
    ])

    const UniswapQuoter = multicall.wrap(
      new ethers.Contract(quoterAddress, QuoterABI.abi, provider)
    )

    const isBaseTokenSameAsNativeToken =
      ethers.utils.getAddress(baseToken) ===
      ethers.utils.getAddress(wrappedCurrency.address)

    const quoteAmount = ethers.utils.parseUnits(amount, baseTokenDecimal)

    if (isBaseTokenSameAsNativeToken) {
      const baseToQuotePrice =
        await UniswapQuoter.callStatic.quoteExactInputSingle(
          baseToken,
          quoteToken,
          3000,
          quoteAmount,
          0
        )

      return parseFloat(
        ethers.utils.formatUnits(baseToQuotePrice, quoteTokenDecimal)
      )
    }

    const wrapped = await UniswapQuoter.callStatic.quoteExactInputSingle(
      baseToken,
      wrappedCurrency.address,
      3000,
      quoteAmount,
      0
    )

    const wrappedToQuotePrice =
      await UniswapQuoter.callStatic.quoteExactInputSingle(
        wrappedCurrency.address,
        quoteToken,
        3000,
        wrapped,
        0
      )

    return parseFloat(
      ethers.utils.formatUnits(wrappedToQuotePrice, quoteTokenDecimal)
    )
  }
}
