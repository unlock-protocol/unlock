import { Currencies } from '@unlock-protocol/core'

export function getCurrencySymbol(currency?: string) {
  return (
    Currencies.find(
      (item) => item?.currency?.toLowerCase() === currency?.toLowerCase()
    )?.symbol ||
    currency?.toUpperCase() ||
    '$'
  )
}
