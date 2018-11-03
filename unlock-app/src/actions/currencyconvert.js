export const SET_ETHER_CONVERSION_RATE = 'SET_ETHER_CONVERSION_RATE'

export function setConversionRate(currency, rateFor1Eth) {
  return {
    type: SET_ETHER_CONVERSION_RATE,
    rateFor1Eth: +rateFor1Eth,
    currency,
  }
}
