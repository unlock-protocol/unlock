import { useQuery } from '@tanstack/react-query'
import { Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { networks } from '@unlock-protocol/networks'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock } from '~/unlockTypes'
import { nativeOnChain } from '@uniswap/smart-order-router'
import { ethers } from 'ethers'
import { NativeCurrency } from '@uniswap/sdk-core'
import { getAccountTokenBalance } from './useAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
export interface UniswapRoute {
  network: number
  tokenIn: Token | NativeCurrency
  tokenOut: Token | NativeCurrency
  amountOut: string
  recipient: string
}

interface UniswapRoutesOption {
  routes: UniswapRoute[]
  enabled?: boolean
}

export const useUniswapRoutes = ({
  routes,
  enabled = true,
}: UniswapRoutesOption) => {
  const { account } = useAuth()
  const web3Service = useWeb3Service()
  return useQuery(
    ['uniswapRoutes', account, routes],
    async () => {
      const result = await Promise.all(
        routes.map(async (route) => {
          try {
            const params = {
              network: route.network,
              tokenIn: route.tokenIn,
              tokenOut: route.tokenOut,
              amountOut: route.amountOut,
              recipient: route.recipient,
            }
            const response = await web3Service.getUniswapRoute({
              params,
            })

            const balance = await getAccountTokenBalance(
              web3Service,
              account!,
              route.tokenIn instanceof Token ? route.tokenIn.address : null,
              route.network
            )
            // If the balance is less than the quote, we cannot make the swap.
            if (Number(balance) < Number(response.quote.toFixed())) {
              console.log(
                `Insufficient balance of ${response.quote.currency.symbol}`
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

export const useUniswapRoutesUsingLock = ({
  lock,
  price,
}: Partial<{
  lock: Lock
  price: string
}>) => {
  return useMemo(() => {
    if (!(lock && price)) {
      return []
    }
    const networkConfig = networks[lock.network]
    if (!networkConfig || !networkConfig.swapPurchaser) {
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

    console.log({ price, lock })

    const amountOut = ethers.utils
      .parseUnits(price, lock.currencyDecimals || 18)
      .toString()

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
    return routes.filter((route: UniswapRoute) => {
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
  }, [lock, price])
}
