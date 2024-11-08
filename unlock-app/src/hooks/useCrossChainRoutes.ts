import { useQueries, useQuery } from '@tanstack/react-query'
import { ZeroAddress, ethers } from 'ethers'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock } from '~/unlockTypes'
import { purchasePriceFor } from './usePricing'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { CrossChainRoute, getCrossChainRoute } from '~/utils/theBox'
import { networks } from '@unlock-protocol/networks'
import { BoxEvmChains } from '@decent.xyz/box-common'
import { Token } from '@unlock-protocol/types'
import { useAuthenticate } from './useAuthenticate'

interface CrossChainRouteWithBalance extends CrossChainRoute {
  resolvedAt: number
  userTokenBalance: string
}

// TheBox returns BigInts as strings with a trailing 'n'
export const toBigInt = (str: string) =>
  /[a-zA-Z]$/.test(str) ? str.slice(0, -1) : str

interface CrossChainRoutesOption {
  lock: Lock
  purchaseData: string[] | undefined
  context: any
  enabled: boolean
}

export const useCrossChainRoutes = ({
  lock,
  purchaseData,
  context,
  enabled = true,
}: CrossChainRoutesOption) => {
  // For each of the networks, check the balance of the user on the native token, and then check the balance with the token
  // and then list all the tokens

  const { account } = useAuthenticate()
  const web3Service = useWeb3Service()
  const { recipients, paywallConfig, keyManagers, renew } = context

  const { data: prices, isPending: isLoadingPrices } = useQuery({
    queryKey: ['prices', account, lock, recipients, purchaseData],
    queryFn: async () => {
      // TODO: support renewals
      if (!purchaseData || !account || !lock || !recipients || renew) {
        return []
      }

      const prices = await purchasePriceFor(web3Service, {
        lockAddress: lock.address,
        network: lock.network,
        recipients,
        data: purchaseData || recipients.map(() => ''),
        paywallConfig,
        currencyContractAddress: lock.currencyContractAddress,
        symbol: lock.currencySymbol,
      })

      const price = prices.reduce((acc, item) => acc + item.amount, 0)

      if (isNaN(price) || price === 0) {
        return []
      }
      return prices
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  })

  const hasPrices = Array.isArray(prices) && prices.length > 0

  const balanceResults = useQueries({
    queries: BoxEvmChains.filter((network) => {
      return networks[network.id]
    }).map((network) => ({
      queryKey: ['balance', account, network.id],
      queryFn: async () => {
        return {
          network: network.id,
          balance: await web3Service.getAddressBalance(account!, network.id),
        }
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: enabled && hasPrices,
    })),
  })

  const routeResults = useQueries({
    queries: balanceResults
      .filter((result) => !!result?.data?.balance)
      .filter((result) => Number(result!.data!.balance) > 0)
      .reduce<{ network: number; balance: string; token: Token }[]>(
        (
          previous: { network: number; balance: string; token: Token }[],
          result
        ) => {
          const network = result.data!.network
          const { tokens, nativeCurrency } = networks[network]
          if (!tokens || !result.data) {
            return previous
          }
          return [
            ...previous,
            ...tokens.map((token) => {
              return { ...result.data, token }
            }),
            {
              ...result.data,
              token: {
                address: ZeroAddress,
                decimals: nativeCurrency.decimals,
                name: nativeCurrency.name,
                symbol: nativeCurrency.symbol,
              },
            },
          ]
        },
        []
      )
      .map(
        ({
          token,
          network,
          balance: nativeBalance,
        }: {
          token: Token
          network: number
          balance: string
        }) => ({
          queryKey: [
            'getCrossChainRoute',
            account,
            lock,
            prices,
            recipients,
            token,
            network,
            nativeBalance,
          ],
          queryFn: async () => {
            try {
              if (!prices) {
                return null
              }
              if (
                network === lock.network &&
                (token.address === lock.currencyContractAddress ||
                  (!lock.currencyContractAddress &&
                    token.address === ZeroAddress))
              ) {
                return null
              }
              const route = await getCrossChainRoute({
                sender: account!,
                lock,
                prices,
                recipients,
                keyManagers: keyManagers || recipients,
                referrers: recipients.map(() =>
                  getReferrer(account!, paywallConfig, lock.address)
                ),
                purchaseData: purchaseData || recipients.map(() => '0x'),
                srcToken: token.address,
                srcChainId: network,
              })
              if (!route) {
                console.info(
                  `No route found from ${network} and ${token.address} to ${lock.network} and ${lock.currencyContractAddress}`
                )
                return null
              }
              const amount = BigInt(toBigInt(route.tokenPayment.amount))
              let userTokenBalance
              if (route.tokenPayment.tokenAddress === ZeroAddress) {
                userTokenBalance = nativeBalance
              } else {
                userTokenBalance = await web3Service.getAddressBalance(
                  account!,
                  network,
                  route.tokenPayment.tokenAddress
                )
              }

              const cost = ethers.formatUnits(
                amount,
                route.tokenPayment.decimals
              )
              if (Number(cost) > Number(userTokenBalance)) {
                return null
              }
              return {
                resolvedAt: new Date().getTime(), // maintaining order
                userTokenBalance,
                ...route,
              } as CrossChainRouteWithBalance
            } catch (error) {
              console.error(error)
              return null
            }
          },
          enabled: enabled && hasPrices,
          staleTime: 1000 * 60 * 5, // 5 minutes
        })
      ),
  })

  const routes = routeResults
    .map((result: { data?: CrossChainRouteWithBalance | null }) => result.data)
    .filter(
      (data?: CrossChainRouteWithBalance | null) => !!data
    ) as CrossChainRouteWithBalance[]

  return {
    isLoading:
      isLoadingPrices ||
      (hasPrices && balanceResults.some((result) => result.isPending)) ||
      (hasPrices && routeResults.some((result) => result.isPending)),
    routes: routes.sort(
      (a: CrossChainRouteWithBalance, b: CrossChainRouteWithBalance) =>
        a!.resolvedAt - b!.resolvedAt
    ),
  }
}
