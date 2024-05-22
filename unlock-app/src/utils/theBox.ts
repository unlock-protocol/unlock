import { Lock } from '~/unlockTypes'
import { ethers } from 'ethers'
import axios from 'axios'
import { networks } from '@unlock-protocol/networks'
import { ADDRESS_ZERO } from '~/constants'
import { BoxChainInfo, BoxChains } from '@decent.xyz/box-common'

export interface BoxActionRequest {
  sender: string
  srcChainId: number
  srcToken?: string
  dstChainId: number
  dstToken?: string
  slippage: number
  actionType: any
  actionConfig: any
}

export interface CrossChainRoute {
  network: number
  tx: any
  tokenPayment?: any
  applicationFee?: any
  bridgeFee?: any
  bridgeId?: any
  relayInfo?: any
  // Remove me
  symbol: string
  networkName: string
  currency: string
}

interface getCrossChainRoutesParams {
  sender: string
  lock: Lock
  prices: any[]
  recipients: string[]
  keyManagers: string[]
  referrers: string[]
  purchaseData: string[]
}

const bigintSerializer = (_key: string, value: unknown): unknown => {
  if (typeof value === 'bigint') {
    return value.toString() + 'n'
  }
  return value
}

export const getCrossChainRoutes = async ({
  sender,
  lock,
  prices,
  recipients,
  keyManagers,
  referrers,
  purchaseData,
}: getCrossChainRoutesParams): Promise<CrossChainRoute[]> => {
  const baseUrl = 'https://box-v2.api.decent.xyz/api/getBoxAction'
  const apiKey = '6477b3b3671589d81df0cba67ba9f3e6'
  const actionRequest: BoxActionRequest = {
    actionType: 'evm-function',
    sender,

    srcToken: ADDRESS_ZERO, // use the native token. Later: check the user balances!
    dstToken: lock.currencyContractAddress || ADDRESS_ZERO,
    slippage: 1, // 1%

    srcChainId: 1, // will be replaced when looping over networks
    dstChainId: lock.network,
    actionConfig: {
      chainId: lock.network,
      contractAddress: lock.address,

      cost: {
        isNative: true,
        amount: prices
          .reduce(
            (acc, current) =>
              acc.add(
                ethers.utils.parseUnits(
                  current.amount.toString(),
                  current.decimals
                )
              ),
            ethers.BigNumber.from('0')
          )
          .toBigInt(),
      },

      signature: encodeURIComponent(
        'function purchase(uint256[] _values,address[] _recipients,address[] _referrers,address[] _keyManagers,bytes[] _data) payable returns (uint256[])'
      ), // We need to get this from walletService!

      args: [
        prices.map((price) => {
          const priceInBigNumber = ethers.utils.parseUnits(
            price.amount.toString(),
            price.decimals
          )
          return priceInBigNumber.toBigInt()
        }),
        recipients,
        referrers,
        keyManagers,
        purchaseData,
      ],
    },
  }

  const routes: CrossChainRoute[] = (
    await Promise.all(
      BoxChains.filter((boxChain: BoxChainInfo) => {
        if (
          boxChain.id === lock.network &&
          (!lock.currencyContractAddress ||
            lock.currencyContractAddress === ADDRESS_ZERO)
        ) {
          return false // Not checking the chain's lock.
        }
        const network = networks[boxChain.id]
        return !!network && !network.isTestNetwork
      }).map(
        async (
          boxChain: BoxChainInfo
        ): Promise<CrossChainRoute | undefined> => {
          const network = networks[boxChain.id]
          const query = JSON.stringify(
            {
              ...actionRequest,
              srcChainId: network.id,
            },
            bigintSerializer
          )

          const url = `${baseUrl}?arguments=${query}`
          const response = await axios
            .get(url, {
              headers: {
                'x-api-key': apiKey,
              },
            })
            .catch(function (error) {
              console.error(error)
            })
          if (response?.status === 200) {
            const { data } = response
            return {
              ...data,
              tx: {
                ...data.tx,
                value: ethers.BigNumber.from(data.tx.value.slice(0, -1)),
              },
              network: network.id,
              currency: network.nativeCurrency.name,
              symbol: network.nativeCurrency.symbol,
              networkName: network.name,
            } as CrossChainRoute
          }
          return
        }
      )
    )
  ).filter<CrossChainRoute>(
    (route: CrossChainRoute | undefined): route is CrossChainRoute => {
      return !!route
    }
  )

  return routes
}
