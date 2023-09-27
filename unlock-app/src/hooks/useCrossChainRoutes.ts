import { useQuery } from '@tanstack/react-query'
import { Token } from '@uniswap/sdk-core'
import { networks } from '@unlock-protocol/networks'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Lock, PaywallConfig } from '~/unlockTypes'
import { nativeOnChain } from '@uniswap/smart-order-router'
import { ethers } from 'ethers'
import { getAccountTokenBalance } from './useAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
import { purchasePriceFor } from './usePricing'
import {
  BoxHooksContextProvider,
  useBoxAction,
  UseBoxActionArgs,
  EvmTransaction,
  ActionType,
  bigintSerializer,
  ChainId,
  getChainExplorerTxLink,
  useBridgeReceipt,
} from '@decent.xyz/box-hooks'

// export interface UniswapRoute {
//   network: number
//   tokenIn: Token | NativeCurrency
//   tokenOut: Token | NativeCurrency
//   amountOut: string
//   recipient: string
// }

interface CrossChainRoutesOption {
  enabled?: boolean
  lock: Lock
  recipients: string[]
  purchaseData: string[] | undefined
  paywallConfig: PaywallConfig
}

export const useCrossChainRoutes = ({
  lock,
  recipients,
  purchaseData,
  paywallConfig,
  enabled = true,
}: CrossChainRoutesOption) => {
  const { account, network } = useAuth()
  const web3Service = useWeb3Service()

  const args: UseBoxActionArgs = {
    actionType: ActionType.NftMint,
    actionConfig: {
      contractAddress: lock.address,
      chainId: lock.network, // Do we want to list all possible chains for the user?
      cost: {
        isNative: true,
        amount: 0, // parseUnits('0.00005', 18), // What happens if we're doing an ERC20 lock?
      },
    },
    srcChainId: network,
    sender: account!,
    slippage: 1, // 1%
    srcToken: '0x0000000000000000000000000000000000000000', // Native token of the chain that the user is on?
    dstToken: '0x0000000000000000000000000000000000000000', // ETH
    dstChainId: lock.network,
  }

  const { actionResponse, isLoading, error } = useBoxAction(args)
  console.log({ actionResponse, isLoading, error })

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
