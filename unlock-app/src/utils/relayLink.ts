import { Lock } from '~/unlockTypes'
import { ethers } from 'ethers'
import axios from 'axios'
import { networks } from '@unlock-protocol/networks'
import { ADDRESS_ZERO } from '~/constants'

export interface RelayBody {}

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
export const getCrossChainRoute = async (
  walletService,
  {
    sender,
    lock,
    prices,
    recipients,
    keyManagers,
    referrers,
    purchaseData,
    srcToken,
    srcChainId,
  }: getCrossChainRouteParams
): Promise<CrossChainRoute | undefined> => {
  const network = networks[srcChainId]

  const totalPrice = prices
    .reduce(
      (acc, current) =>
        acc + ethers.parseUnits(current.amount.toString(), current.decimals),
      BigInt('0')
    )
    .toString()

  const txs = []

  const x = await walletService.purchaseKeys(
    {
      lockAddress: lock.address,
      keyPrices: prices,
      owners: recipients!,
      data: purchaseData,
      keyManagers: keyManagers?.length ? keyManagers : undefined,
      recurringPayments: 0,
      referrers,
    },
    { runEstimate: true }
  )
  // runEstimate
  console.log(x)

  if (
    lock.currencyContractAddress &&
    lock.currencyContractAddress !== ADDRESS_ZERO
  ) {
    const ERC20Interface = new ethers.Interface([
      'function approve(address spender, uint tokens) public returns (bool success)',
    ])
    // Approval first!
    txs.push({
      to: lock.currencyContractAddress,
      value: BigInt('0'),
      data: ERC20Interface.encodeFunctionData('approve', [
        lock.address,
        totalPrice,
      ]),
    })
    // Add the purchase transaction
    txs.push({
      to: lock.address,
      value: 0,
      data: '',
    })
  } else {
    // Add the purchase transaction only
    txs.push({
      to: lock.address,
      value: totalPrice,
      data: '',
    })
  }

  const baseUrl = 'https://api.relay.link/quote'
  const actionRequest: RelayBody = {
    user: sender,
    originChainId: srcChainId,
    destinationChainId: lock.network,
    originCurrency: srcToken,
    destinationCurrency: lock.currencyContractAddress || ADDRESS_ZERO,
    amount: totalPrice,
    transactionType: 'EXACT_OUTPUT',
    txs: [],
    // sender,
    // srcToken,
    // dstToken: lock.currencyContractAddress || ADDRESS_ZERO,
    // srcChainId,
    // dstChainId: lock.network,
    // slippage: 1, // 1%
    // actionType: 'evm-function',
    // actionConfig: {
    //   chainId: lock.network,
    //   contractAddress: lock.address,
    //   cost: {
    //     isNative: true,
    //     amount:
    //       prices
    //         .reduce(
    //           (acc, current) =>
    //             acc +
    //             ethers.parseUnits(current.amount.toString(), current.decimals),
    //           BigInt('0')
    //         )
    //         .toString() + 'n',
    //   },
    //   signature:
    //     'function purchase(uint256[] _values,address[] _recipients,address[] _referrers,address[] _keyManagers,bytes[] _data) payable returns (uint256[])', // We need to get this from walletService!
    //   args: [
    //     prices.map((price) => {
    //       const priceParsed = ethers.parseUnits(
    //         price.amount.toString(),
    //         price.decimals
    //       )
    //       return priceParsed
    //     }),
    //     recipients,
    //     referrers,
    //     keyManagers,
    //     purchaseData,
    //   ],
    // },
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
