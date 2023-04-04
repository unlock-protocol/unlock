import { useQuery } from '@tanstack/react-query'
import { Token } from '@uniswap/sdk-core'
import { useWeb3Service } from '~/utils/withWeb3Service'

export interface UniswapRoute {
  network: number
  tokenIn: Token
  tokenOut: Token
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
