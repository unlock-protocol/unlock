import { useQuery } from '@tanstack/react-query'
import { Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { networks } from '@unlock-protocol/networks'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock } from '~/unlockTypes'
import { nativeOnChain } from '@uniswap/smart-order-router'
import { ethers } from 'ethers'
import { NativeCurrency } from '@uniswap/sdk-core'
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
  const web3Service = useWeb3Service()
  return useQuery(
    ['uniswapRoutes'],
    async () => {
      const result = await Promise.all(
        routes.map(async (route) => {
          try {
            const response = await web3Service.getUniswapRoute({
              params: {
                network: route.network,
                tokenIn: route.tokenIn,
                tokenOut: route.tokenOut,
                amountOut: route.amountOut,
                recipient: route.recipient,
              },
            })
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
    const recipient = networkConfig.swapPurchaser
    const allowList = ['usdc', 'usdt']
    const network = lock.network
    const tokenOut = lock.currencyContractAddress
      ? new Token(
          lock.network,
          lock.currencyContractAddress,
          lock.currencyDecimals || 18,
          lock.currencySymbol || '',
          lock.currencyName || ''
        )
      : nativeOnChain(lock.network)

    const routes = (networkConfig.tokens || [])
      .filter((item: any) =>
        allowList.includes(item.symbol?.toLowerCase()?.trim())
      )
      .map((item: any) => {
        const tokenIn = new Token(
          lock.network,
          item.address,
          item.decimals,
          item.symbol,
          item.name
        )
        const amountOut = ethers.utils
          .parseUnits(price, lock.currencyDecimals || 18)
          .toString()

        return {
          tokenIn,
          tokenOut,
          amountOut,
          recipient,
          network,
        } as UniswapRoute
      })

    if (
      lock.currencyContractAddress &&
      lock.currencyContractAddress !== ethers.constants.AddressZero
    ) {
      routes.push({
        tokenIn: nativeOnChain(lock.network),
        tokenOut,
        amountOut: price,
        recipient,
        network,
      })
    }
    console.log(routes)
    return routes
  }, [lock, price])
}
