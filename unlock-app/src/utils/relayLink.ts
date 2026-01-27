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

  // support renewals
  if (renew && tokenId) {
    const lockContract = await web3Service.lockContract(
      lock.address,
      lock.network
    )
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

  const keyPrices = prices.map((price) => {
    const priceParsed = ethers.parseUnits(
      price.amount.toString(),
      price.decimals
    )
    return priceParsed.toString()
  })

  // This is a purchase
  const transactions = await web3Service.purchaseKeys({
    lockAddress: lock.address,
    network: lock.network,
    params: {
      lockAddress: lock.address,
      owners: recipients,
      keyPrices,
      data: purchaseData,
      referrers,
      keyManagers,
    },
  })
  const purchaseTransaction = transactions[transactions.length - 1]

  return {
    callData: purchaseTransaction.data,
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

  const response = await axios.post(baseUrl, request).catch(function (error) {
    console.error(error)
  })
  if (response?.status === 200) {
    const { data } = response
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
  }
  return undefined
}
