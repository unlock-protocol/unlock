import { useQuery } from '@tanstack/react-query'
import { Token } from '@uniswap/sdk-core'
import { networks } from '@unlock-protocol/networks'
import { UnlockUniswapRoute } from '@unlock-protocol/types'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock } from '~/unlockTypes'
import { nativeOnChain } from '@uniswap/smart-order-router'
import { ethers } from 'ethers'
import { NativeCurrency } from '@uniswap/sdk-core'
import { getAccountTokenBalance } from './useAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
import { purchasePriceFor } from './usePricing'
import { PaywallConfigType } from '@unlock-protocol/core'

export interface UniswapRoute {
  network: number
  tokenIn: Token | NativeCurrency
  tokenOut: Token | NativeCurrency
  amountOut: string
  recipient: string
}

interface UniswapRoutesOption {
  enabled?: boolean
  lock: Lock
  recipients: string[]
  purchaseData: string[] | undefined
  paywallConfig: PaywallConfigType
}

export const useUniswapRoutes = ({
  lock,
  recipients,
  purchaseData,
  paywallConfig,
  enabled = true,
}: UniswapRoutesOption) => {
  const { account } = useAuth()
  const web3Service = useWeb3Service()
  return useQuery(
    ['uniswapRoutes', account, lock, recipients, purchaseData],
    async () => {
      const networkConfig = networks[lock.network]
      if (!networkConfig || !networkConfig.swapPurchaser) {
        return []
      }

      // get the price for each of the keys
      const prices = await purchasePriceFor(web3Service, {
        lockAddress: lock.address,
        network: lock.network,
        recipients,
        data: purchaseData || recipients.map(() => ''),
        paywallConfig,
        currencyContractAddress: lock.currencyContractAddress,
        symbol: lock.currencySymbol,
      })

      // compute total
      const price = prices.reduce((acc, item) => acc + item.amount, 0)

      if (isNaN(price) || price === 0) {
        return []
      }

      const recipient = networkConfig.swapPurchaser.toLowerCase().trim()
      const network = lock.network
      const isErc20 =
        lock.currencyContractAddress &&
        lock.currencyContractAddress !== ethers.constants.AddressZero

      const tokenOut = isErc20
        ? new Token(
            lock.network,
            lock.currencyContractAddress!.toLowerCase().trim(),
            lock.currencyDecimals || 18,
            lock.currencySymbol || '',
            lock.currencyName || ''
          )
        : nativeOnChain(network)

      const amountOut = ethers.utils
        .parseUnits(price.toString(), lock.currencyDecimals || 18)
        .toString()

      // build the routes
      const routes = (networkConfig.tokens || []).map((item: any) => {
        const tokenIn = new Token(
          lock.network,
          item.address.toLowerCase().trim(),
          item.decimals,
          item.symbol,
          item.name
        )

        return {
          tokenIn,
          tokenOut,
          amountOut,
          recipient,
          network,
        } as UniswapRoute
      })

      // Add native currency as a route if the lock is an ERC20
      if (isErc20) {
        routes.push({
          tokenIn: nativeOnChain(network),
          tokenOut,
          amountOut,
          recipient,
          network,
        })
      }

      const routesToLookup = routes.filter((route: UniswapRoute) => {
        // Filter out duplicates if any
        if (route.tokenIn.isNative) {
          return !route.tokenOut.isNative
        }
        if (route.tokenOut.isNative) {
          return !route.tokenIn.isNative
        }
        return (
          route.tokenOut!.address.toLowerCase() !==
          route.tokenIn!.address.toLowerCase()
        )
      })

      const result = await Promise.all(
        routesToLookup.map(async (route: UniswapRoute) => {
          try {
            const params = {
              network: route.network,
              tokenIn: route.tokenIn,
              tokenOut: route.tokenOut,
              amountOut: route.amountOut,
              recipient: route.recipient,
            }
            const response: UnlockUniswapRoute =
              await web3Service.getUniswapRoute({
                params,
              })

            const balance = await getAccountTokenBalance(
              web3Service,
              account!,
              route.tokenIn instanceof Token ? route.tokenIn.address : null,
              route.network
            )
            console.log(balance)
            // If the balance is less than the quote, we cannot make the swap.
            if (Number(balance) < Number(response.quote.toFixed())) {
              console.log(
                `Insufficient balance of ${
                  response.quote.currency.symbol
                }, ${Number(balance)} for ${Number(response.quote.toFixed())}`
              )
              return null
            }
            return response
          } catch (error) {
            console.error(error)
            return null
          }
        })
      )
      return result.filter((item) => !!item)
    },
    {
      enabled,
    }
  )
}
