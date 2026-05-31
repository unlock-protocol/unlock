import { ethers } from 'ethers'

type CrossChainRoutePayment = {
  currency?: string
  symbol?: string
  tokenPayment: {
    amount: bigint | string | number
    decimals: number
    isNative?: boolean
    symbol?: string
  }
}

export const getCrossChainRoutePayment = (route: CrossChainRoutePayment) => {
  const symbol = route.tokenPayment.isNative
    ? route.currency
    : route.tokenPayment.symbol || route.symbol

  if (!symbol) {
    return null
  }

  return {
    amount: ethers.formatUnits(
      route.tokenPayment.amount,
      route.tokenPayment.decimals
    ),
    symbol,
  }
}
