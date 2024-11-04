import { Lock } from '~/unlockTypes'
import { ethers } from 'ethers'
import axios from 'axios'
import { networks } from '@unlock-protocol/networks'
import { ADDRESS_ZERO } from '~/constants'

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

const bigintSerializer = (_key: string, value: unknown): unknown => {
  if (typeof value === 'bigint') {
    return value.toString() + 'n'
  }
  return value
}

interface getCrossChainRouteParams {
  sender: string
  lock: Lock
  prices: any[]
  recipients: string[]
  keyManagers: string[]
  referrers: string[]
  purchaseData: string[]
  srcToken: string
  srcChainId: number
}

// Get a route for a given token and chain.
export const getCrossChainRoute = async ({
  sender,
  lock,
  prices,
  recipients,
  keyManagers,
  referrers,
  purchaseData,
  srcToken,
  srcChainId,
}: getCrossChainRouteParams): Promise<CrossChainRoute | undefined> => {
  const network = networks[srcChainId]

  const baseUrl = 'https://box-v2.api.decent.xyz/api/getBoxAction'
  const apiKey = '6477b3b3671589d81df0cba67ba9f3e6'
  const actionRequest: BoxActionRequest = {
    sender,

    srcToken,
    dstToken: lock.currencyContractAddress || ADDRESS_ZERO,
    srcChainId,
    dstChainId: lock.network,
    slippage: 1, // 1%
    actionType: 'evm-function',

    actionConfig: {
      chainId: lock.network,
      contractAddress: lock.address,

      cost: {
        isNative: true,
        amount:
          prices
            .reduce(
              (acc, current) =>
                acc +
                ethers.parseUnits(current.amount.toString(), current.decimals),
              BigInt('0')
            )
            .toString() + 'n',
      },

      signature:
        'function purchase(uint256[] _values,address[] _recipients,address[] _referrers,address[] _keyManagers,bytes[] _data) payable returns (uint256[])', // We need to get this from walletService!
      args: [
        prices.map((price) => {
          const priceParsed = ethers.parseUnits(
            price.amount.toString(),
            price.decimals
          )
          return priceParsed
        }),
        recipients,
        referrers,
        keyManagers,
        purchaseData,
      ],
    },
  }

  const query = JSON.stringify(
    {
      ...actionRequest,
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
        value: BigInt(data.tx.value.slice(0, -1)),
      },
      network: network.id,
      currency: network.nativeCurrency.name,
      symbol: network.nativeCurrency.symbol,
      networkName: network.name,
    } as CrossChainRoute
  }
}
