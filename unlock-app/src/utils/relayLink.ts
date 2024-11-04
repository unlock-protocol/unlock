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
  lockContract,
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

  const callData = lockContract.interface.encodeFunctionData('purchase', [
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
  ])

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
      value: 0,
      data: ERC20Interface.encodeFunctionData('approve', [
        lock.address,
        totalPrice,
      ]),
    })
    // Add the purchase transaction
    txs.push({
      to: lock.address,
      value: 0,
      data: callData,
    })
  } else {
    // Add the purchase transaction only
    txs.push({
      to: lock.address,
      value: totalPrice,
      data: callData,
    })
  }

  const baseUrl = 'https://api.relay.link/quote'
  const request: RelayBody = {
    user: sender,
    originChainId: srcChainId,
    destinationChainId: lock.network,
    originCurrency: srcToken,
    destinationCurrency: lock.currencyContractAddress || ADDRESS_ZERO,
    amount: totalPrice,
    tradeType: 'EXACT_OUTPUT',
    txs,
  }

  const response = await axios.post(baseUrl, request).catch(function (error) {
    console.error(error)
  })
  if (response?.status === 200) {
    const { data } = response
    console.log({ data })
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
