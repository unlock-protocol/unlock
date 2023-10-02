import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock, PaywallConfig } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { purchasePriceFor } from './usePricing'
// import {
//   BoxHooksContextProvider,
//   useBoxAction,
//   UseBoxActionArgs,
//   EvmTransaction,
//   ActionType,
//   bigintSerializer,
//   ChainId,
//   getChainExplorerTxLink,
//   useBridgeReceipt,
// } from '@decent.xyz/box-hooks'
import { useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { getReferrer } from '~/utils/checkoutLockUtils'

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
  const [prices, setPrices] = useState<
    {
      symbol: string | null | undefined
      userAddress: string
      amount: number
      decimals: any
    }[]
  >([])
  const { account, network } = useAuth()
  const web3Service = useWeb3Service()

  const { recipients, paywallConfig, keyManagers, renew } = context

  // TODO: consider renewals!
  // TODO: fail for multiple purchases?

  useEffect(() => {
    const getPrices = async () => {
      setPrices(
        await purchasePriceFor(web3Service, {
          lockAddress: lock.address,
          network: lock.network,
          recipients,
          data: purchaseData || recipients.map(() => ''),
          paywallConfig,
          currencyContractAddress: lock.currencyContractAddress,
          symbol: lock.currencySymbol,
        })
      )
    }
    getPrices()
  }, [lock, recipients, purchaseData, paywallConfig, web3Service])

  // const args: UseBoxActionArgs = {
  const args = {
    // actionType: ActionType.NftPreferMint,

    // srcChainId: network,
    // sender: account!,
    // slippage: 1, // 1%
    // srcToken: '0x0000000000000000000000000000000000000000', // Native token of the chain that the user is on?
    // dstToken: lock.currencyContractAddress, // ETH
    // dstChainId: lock.network,
    actionConfig: {
      contractAddress: lock.address,
      chainId: lock.network,
      signature:
        'function purchase(uint256[] _values,address[] _recipients,address[] _referrers,address[] _keyManagers,bytes[] _data) payable returns (uint256[])', // We need to get this from walletService!
      args: [
        prices.map((price) =>
          ethers.utils.parseUnits(price.amount.toString(), price.decimals)
        ),
        recipients,
        recipients.map((recipient: string) => getReferrer(recipient)),
        keyManagers,
        purchaseData || recipients.map(() => ''),
      ],
      cost: {
        isNative: true,
        amount: prices.reduce(
          (acc, current) =>
            acc.add(
              ethers.utils.parseUnits(
                current.amount.toString(),
                current.decimals
              )
            ),
          ethers.BigNumber.from('0')
        ),
      },
      // supplyConfig: {
      //   // NOTE: only need this section on NftPreferMint action config; could just do NftMint - difference is this version will source secondary listings once mint concludes.  Mint can conclude in 1 of two ways highlighted below (contract was unverified, so I just harcoded something):
      //   maxCap: nftInfo.maxCap,
      //   // sellOutDate: nftInfo.sellOutDate
      // },
    },
    srcChainId: network,
    sender: account,
    slippage: 1, // 1%
    srcToken: ethers.constants.AddressZero, // We assume the source is only the native token
    dstToken: lock.currencyContractAddress,
    dstChainId: lock.network,
  }

  console.log(args)

  // const { actionResponse, isLoading, error } = useBoxAction(args)
  // console.log({ actionResponse, isLoading, error })

  // return useQuery(
  //   ['crossChainRoutes', account, lock, recipients, purchaseData],
  //   async () => {
  //     const networkConfig = networks[lock.network]
  //     if (!networkConfig || !networkConfig.swapPurchaser) {
  //       return []
  //     }

  //     // get the price for each of the keys
  //     const prices = await purchasePriceFor(web3Service, {
  //       lockAddress: lock.address,
  //       network: lock.network,
  //       recipients,
  //       data: purchaseData || recipients.map(() => ''),
  //       paywallConfig,
  //       currencyContractAddress: lock.currencyContractAddress,
  //       symbol: lock.currencySymbol,
  //     })

  //     // compute total
  //     const price = prices.reduce((acc, item) => acc + item.amount, 0)

  //     if (isNaN(price)) {
  //       return []
  //     }

  //     const recipient = networkConfig.swapPurchaser.toLowerCase().trim()
  //     const network = lock.network
  //     const isErc20 =
  //       lock.currencyContractAddress &&
  //       lock.currencyContractAddress !== ethers.constants.AddressZero

  //     const tokenOut = isErc20
  //       ? new Token(
  //           lock.network,
  //           lock.currencyContractAddress!.toLowerCase().trim(),
  //           lock.currencyDecimals || 18,
  //           lock.currencySymbol || '',
  //           lock.currencyName || ''
  //         )
  //       : nativeOnChain(network)

  //     const amountOut = ethers.utils
  //       .parseUnits(price.toString(), lock.currencyDecimals || 18)
  //       .toString()

  //     // ok let's now call decent's code!
  //   },
  //   {
  //     enabled,
  //   }
  // )
}
