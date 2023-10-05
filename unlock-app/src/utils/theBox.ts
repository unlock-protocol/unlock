import { Lock } from '~/unlockTypes'
import { ethers } from 'ethers'
import axios from 'axios'
import { networks } from '@unlock-protocol/networks'

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
  const baseUrl = 'https://box-v1.api.decent.xyz/api/getBoxAction'
  const apiKey = '9f3ef983290e05e38264f4eb65e09754'
  const actionRequest: BoxActionRequest = {
    srcChainId: 1, // we be replaced when looping over networks
    sender,
    srcToken: ethers.constants.AddressZero, // use the native token. Later: check the user balances!
    dstChainId: lock.network,
    dstToken: lock.currencyContractAddress || ethers.constants.AddressZero,
    slippage: 1, // 1%
    actionType: 'nft-prefer-mint',
    actionConfig: {
      contractAddress: lock.address,
      chainId: lock.network,
      signature:
        'function purchase(uint256[] _values,address[] _recipients,address[] _referrers,address[] _keyManagers,bytes[] _data) payable returns (uint256[])', // We need to get this from walletService!
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
    },
  }

  const routes: CrossChainRoute[] = (
    await Promise.all(
      Object.values(networks)
        .filter((network) => {
          return !network.isTestNetwork && network.id !== lock.network
        })
        .map(async (network): Promise<CrossChainRoute | undefined> => {
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
              console.log(error)
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
        })
    )
  ).filter<CrossChainRoute>(
    (route: CrossChainRoute | undefined): route is CrossChainRoute => {
      return !!route
    }
  )

  return routes
}
