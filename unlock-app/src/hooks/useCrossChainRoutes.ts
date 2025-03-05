import { useQueries, useQuery } from '@tanstack/react-query'
import { ZeroAddress, ethers } from 'ethers'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock } from '~/unlockTypes'
import { purchasePriceFor } from './usePricing'
import { getReferrer } from '~/utils/checkoutLockUtils'
import {
  getCrossChainRoute as getDecentCrossChainRoute,
  prepareSharedParams as prepareDecentSharedParams,
} from '~/utils/theBox'
import {
  getCrossChainRoute as getRelayLinkCrossChainRoute,
  prepareSharedParams as prepareRelayLinkSharedParams,
} from '~/utils/relayLink'

import { networks } from '@unlock-protocol/networks'
import { Token } from '@unlock-protocol/types'
import { useAuthenticate } from './useAuthenticate'
import { useSearchParam } from 'react-use'

export interface CrossChainRoute {
  network: number
  tx: any
  tokenPayment?: any
  applicationFee?: any
  bridgeFee?: any
  bridgeId?: any
  relayInfo?: any
  provider: {
    url: string
    name: string
  }
  // Remove me
  symbol: string
  networkName: string
  currency: string
}

interface CrossChainRouteWithBalance extends CrossChainRoute {
  resolvedAt: number
  userTokenBalance: string
}

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

  const xchainApi = useSearchParam('xchain')
  const prepareSharedParams =
    xchainApi === 'decent'
      ? prepareDecentSharedParams
      : prepareRelayLinkSharedParams
  const getCrossChainRoute =
    xchainApi === 'decent'
      ? getDecentCrossChainRoute
      : getRelayLinkCrossChainRoute

  const { account: userAccount } = useAuthenticate()
  const web3Service = useWeb3Service()

  // Hardcoded account to use for the route
  const account = '0x5B0C0b6bAFC3b498e601EAd2A9243e90e61D9d4d'
  console.log('Using hardcoded account for routes:', account)

  const { recipients, paywallConfig, keyManagers, renew, tokenId } = context

  const { data: prices, isPending: isLoadingPrices } = useQuery({
    queryKey: ['prices', account, lock, recipients, purchaseData],
    queryFn: async () => {
      if (!purchaseData || !account || !lock || !recipients) {
        return []
      }

      console.log('Fetching prices with params:', {
        lockAddress: lock.address,
        network: lock.network,
        recipientsCount: recipients.length,
        purchaseDataLength: purchaseData.length,
      })

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
      console.log('Total price calculated:', price)

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
    queries: Object.values(networks)
      .filter((network) => {
        // Filter out networks that are not the same type as the lock
        return network.isTestNetwork === networks[lock.network].isTestNetwork
      })
      .map((network) => ({
        queryKey: ['balance', account, network.id],
        queryFn: async () => {
          const balance = await web3Service.getAddressBalance(
            account!,
            network.id
          )
          console.log(
            `Balance for account ${account} on network ${network.name} (${network.id}):`,
            balance
          )
          return {
            network: network.id,
            balance,
          }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: enabled,
      })),
  })

  const { data: sharedParams } = useQuery({
    queryKey: [
      'sharedParams',
      account,
      lock,
      recipients,
      keyManagers,
      purchaseData,
      renew,
      tokenId,
    ],
    queryFn: async () => {
      console.log('Preparing shared params with:', {
        sender: account,
        lockAddress: lock.address,
        lockNetwork: lock.network,
        recipientsCount: recipients.length,
        keyManagersCount: keyManagers?.length || 0,
        purchaseDataLength: purchaseData?.length || 0,
        renew,
        tokenId,
      })

      return prepareSharedParams({
        sender: account!,
        lock,
        prices: prices!,
        recipients,
        keyManagers: keyManagers || recipients,
        referrers: recipients.map(() =>
          getReferrer(account!, paywallConfig, lock.address)
        ),
        purchaseData: purchaseData || recipients.map(() => '0x'),
        renew,
        tokenId,
      })
    },
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
            sharedParams,
          ],
          queryFn: async () => {
            try {
              if (!prices) {
                return null
              }
              // Skip any identical route
              if (
                network === lock.network &&
                (token.address === lock.currencyContractAddress ||
                  (!lock.currencyContractAddress &&
                    token.address === ZeroAddress))
              ) {
                return null
              }

              console.log('Checking route with params:', {
                sender: account,
                lockAddress: lock.address,
                lockNetwork: lock.network,
                srcToken: token.address,
                srcTokenSymbol: token.symbol,
                srcChainId: network,
                srcChainName: networks[network].name,
              })

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
                sharedParams,
              })
              if (!route) {
                console.info(
                  `No route found from ${networks[network].name} and ${token.symbol} to ${networks[lock.network].name} and ${lock.currencySymbol}`
                )
                return null
              }

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

              console.log('Route found with token balance:', {
                network: networks[network].name,
                tokenAddress: route.tokenPayment.tokenAddress,
                tokenSymbol: token.symbol,
                userTokenBalance,
                paymentAmount: route.tokenPayment.amount,
              })

              const amount = BigInt(route.tokenPayment.amount)
              const cost = ethers.formatUnits(
                amount,
                route.tokenPayment.decimals
              )
              console.log('Route cost calculation:', {
                cost,
                userTokenBalance,
                hasEnoughBalance: Number(cost) <= Number(userTokenBalance),
              })

              if (Number(cost) > Number(userTokenBalance)) {
                // Skip any route for which the user does not have enough tokens
                console.log('Skipping route due to insufficient balance')
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
          enabled: enabled && hasPrices && !!sharedParams,
          staleTime: 1000 * 60 * 5, // 5 minutes
        })
      ),
  })

  const routes = routeResults
    .map((result: { data?: CrossChainRouteWithBalance | null }) => result.data)
    .filter(
      (data?: CrossChainRouteWithBalance | null) => !!data
    ) as CrossChainRouteWithBalance[]

  console.log('Final routes found:', routes.length)

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
