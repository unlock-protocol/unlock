import { useQuery } from '@tanstack/react-query'

import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock, PaywallConfig } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { purchasePriceFor } from './usePricing'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { getCrossChainRoutes } from '~/utils/thebox'

// export interface UniswapRoute {
//   network: number
//   tokenIn: Token | NativeCurrency
//   tokenOut: Token | NativeCurrency
//   amountOut: string
//   recipient: string
// }

interface CrossChainRoutesOption {
  lock: Lock
  purchaseData: string[] | undefined
  context: any
  paywallConfig: PaywallConfig
  enabled: boolean
}

export const useCrossChainRoutes = ({
  lock,
  purchaseData,
  context,
  enabled = true,
}: CrossChainRoutesOption) => {
  const { account } = useAuth()
  const web3Service = useWeb3Service()

  const { recipients, paywallConfig, keyManagers } = context

  return useQuery(
    ['crossChainRoutes', account, lock, recipients, purchaseData],
    async () => {
      const prices = await purchasePriceFor(web3Service, {
        lockAddress: lock.address,
        network: lock.network,
        recipients,
        data: purchaseData || recipients.map(() => ''),
        paywallConfig,
        currencyContractAddress: lock.currencyContractAddress,
        symbol: lock.currencySymbol,
      })

      return getCrossChainRoutes({
        sender: account!,
        lock,
        prices,
        recipients,
        keyManagers: keyManagers || recipients,
        referrers: recipients.map(() =>
          getReferrer(account!, paywallConfig, lock.address)
        ),
        purchaseData: purchaseData || recipients.map(() => ''),
      })
    },
    {
      enabled,
    }
  )
}

//   const [prices, setPrices] = useState<
//     {
//       symbol: string | null | undefined
//       userAddress: string
//       amount: number
//       decimals: any
//     }[]
//   >([])
//   const { account, network } = useAuth()
//   const web3Service = useWeb3Service()

//   const { recipients, paywallConfig, keyManagers, renew } = context

//   // TODO: consider renewals!
//   // TODO: fail for multiple purchases?

//   useEffect(async () => {
//     const routes = await getCrossChainRoutes({
//       prices,
//       sender,
//       lock,
//       recipients,
//       keyManagers,
//     })
//   }, [lock, recipients, purchaseData, paywallConfig, web3Service])

//   // const { actionResponse, isLoading, error } = useBoxAction(args)
//   // console.log({ actionResponse, isLoading, error })

//   // return useQuery(
//   //   ['crossChainRoutes', account, lock, recipients, purchaseData],
//   //   async () => {
//   //     const networkConfig = networks[lock.network]
//   //     if (!networkConfig || !networkConfig.swapPurchaser) {
//   //       return []
//   //     }

//   //     // get the price for each of the keys
//   //     const prices = await purchasePriceFor(web3Service, {
//   //       lockAddress: lock.address,
//   //       network: lock.network,
//   //       recipients,
//   //       data: purchaseData || recipients.map(() => ''),
//   //       paywallConfig,
//   //       currencyContractAddress: lock.currencyContractAddress,
//   //       symbol: lock.currencySymbol,
//   //     })

//   //     // compute total
//   //     const price = prices.reduce((acc, item) => acc + item.amount, 0)

//   //     if (isNaN(price)) {
//   //       return []
//   //     }

//   //     const recipient = networkConfig.swapPurchaser.toLowerCase().trim()
//   //     const network = lock.network
//   //     const isErc20 =
//   //       lock.currencyContractAddress &&
//   //       lock.currencyContractAddress !== ethers.constants.AddressZero

//   //     const tokenOut = isErc20
//   //       ? new Token(
//   //           lock.network,
//   //           lock.currencyContractAddress!.toLowerCase().trim(),
//   //           lock.currencyDecimals || 18,
//   //           lock.currencySymbol || '',
//   //           lock.currencyName || ''
//   //         )
//   //       : nativeOnChain(network)

//   //     const amountOut = ethers.utils
//   //       .parseUnits(price.toString(), lock.currencyDecimals || 18)
//   //       .toString()

//   //     // ok let's now call decent's code!
//   //   },
//   //   {
//   //     enabled,
//   //   }
//   // )
// }
