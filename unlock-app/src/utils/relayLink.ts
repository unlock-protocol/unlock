import { Lock } from '~/unlockTypes'
import { ethers } from 'ethers'
import axios from 'axios'
import { networks } from '@unlock-protocol/networks'
import { ADDRESS_ZERO } from '~/constants'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { CrossChainRoute } from '~/hooks/useCrossChainRoutes'

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
  sharedParams: any
  renew?: boolean
}

interface prepareSharedParamsParams {
  lock: Lock
  prices: any[]
  recipients: string[]
  keyManagers: string[]
  referrers: string[]
  purchaseData: string[]
  renew?: boolean
  tokenId?: string | null
}

export const prepareSharedParams = async ({
  lock,
  prices,
  recipients,
  keyManagers,
  referrers,
  purchaseData,
  renew = false,
  tokenId = null,
}: prepareSharedParamsParams) => {
  const web3Service = new Web3Service(networks)
  const lockContract = await web3Service.lockContract(
    lock.address,
    lock.network
  )

  // support renewals
  if (renew && tokenId) {
    // Get single price value
    const priceParsed = ethers.parseUnits(
      prices[0].amount.toString(),
      prices[0].decimals
    )

    const callData = lockContract.interface.encodeFunctionData('extend', [
      priceParsed.toString(),
      BigInt(tokenId),
      referrers[0],
      purchaseData[0],
    ])

    return { callData }
  }

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

  return {
    callData,
  }
}

// Get a route for a given token and chain.
export const getCrossChainRoute = async ({
  sender,
  lock,
  prices,
  srcToken,
  srcChainId,
  sharedParams,
}: getCrossChainRouteParams): Promise<CrossChainRoute | undefined> => {
  const network = networks[srcChainId]
  const totalPrice = prices
    .reduce(
      (acc, current) =>
        acc + ethers.parseUnits(current.amount.toString(), current.decimals),
      BigInt('0')
    )
    .toString()

  console.log('[RelayLink] Preparing route with:', {
    sender,
    srcChainId,
    srcNetwork: network.name,
    srcToken,
    destChainId: lock.network,
    destNetwork: networks[lock.network].name,
    destToken: lock.currencyContractAddress || ADDRESS_ZERO,
    totalPrice,
  })

  const txs = []

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
      data: sharedParams.callData,
    })
  } else {
    // Add the purchase transaction only
    txs.push({
      to: lock.address,
      value: totalPrice,
      data: sharedParams.callData,
    })
  }

  console.log('[RelayLink] Transactions to execute:', txs)

  const baseUrl = 'https://api.relay.link/quote'
  const request = {
    user: sender,
    originChainId: srcChainId,
    destinationChainId: lock.network,
    originCurrency: srcToken,
    destinationCurrency: lock.currencyContractAddress || ADDRESS_ZERO,
    amount: totalPrice,
    tradeType: 'EXACT_OUTPUT',
    txs,
  }

  console.log(
    '[RelayLink] Sending request to API:',
    JSON.stringify(request, null, 2)
  )

  const response = await axios.post(baseUrl, request).catch(function (error) {
    console.error('[RelayLink] API Error:', error.message)
    if (error.response) {
      console.error('[RelayLink] Error Response:', error.response.data)
    }
    return null
  })

  if (!response) {
    console.error('[RelayLink] No response received from API')
    return undefined
  }

  console.log('[RelayLink] API Response Status:', response.status)

  if (response?.status === 200) {
    const { data } = response
    console.log('[RelayLink] Route found:', {
      currencyIn: data.details.currencyIn,
      currencyOut: data.details.currencyOut,
      steps: data.steps.length,
    })

    const relayStep = data.steps[data.steps.length - 1]
    const tx = relayStep.items[0].data

    return {
      tx,
      tokenPayment: {
        amount: data.details.currencyIn.amount,
        tokenAddress: data.details.currencyIn.currency.address,
        chainId: data.details.chainId,
        isNative: srcToken === ADDRESS_ZERO,
        name: data.details.currencyIn.currency.name,
        symbol: data.details.currencyIn.currency.symbol,
        decimals: data.details.currencyIn.currency.decimals,
      },
      network: network.id,
      currency: network.nativeCurrency.name,
      symbol: network.nativeCurrency.symbol,
      networkName: network.name,
      provider: {
        name: 'Relay.link',
        url: 'https://relay.link',
      },
    } as CrossChainRoute
  } else {
    console.error('[RelayLink] API returned non-200 status:', response.status)
    console.error('[RelayLink] Response data:', response.data)
    return undefined
  }
}
