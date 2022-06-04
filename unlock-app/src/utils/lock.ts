import { durationsAsTextFromSeconds } from '../utils/durations'
import {
  lockKeysAvailable,
  numberOfAvailableKeys,
  convertedKeyPrice,
  formattedKeyPrice,
} from '../utils/checkoutLockUtils'

/**
 * Given a lock, returns its symbol's currency
 * @param {*} lock
 * @param {*} config
 */
export const currencySymbol = (lock: any, defaultERC20: any) => {
  let currency = ''
  if (lock.currencySymbol) {
    currency = lock.currencySymbol
  } else if (lock.currencyContractAddress) {
    currency = 'ERC20' // Default for ERC20 without symbol
  }
  return currency
}

export const getLockProps = (
  lock: any,
  network: number,
  baseCurrencySymbol: string,
  name: string,
  numberOfRecipients = 1
) => {
  return {
    cardEnabled: lock?.fiatPricing?.creditCardEnabled,
    formattedDuration: durationsAsTextFromSeconds(lock.expirationDuration),
    formattedKeyPrice: formattedKeyPrice(
      lock,
      baseCurrencySymbol,
      numberOfRecipients
    ),
    convertedKeyPrice: convertedKeyPrice(lock, numberOfRecipients),
    formattedKeysAvailable: lockKeysAvailable(lock),
    name: name || lock.name,
    address: lock.address,
    network,
    prepend: numberOfRecipients > 1 ? `${numberOfRecipients} x ` : '',
    isSoldOut: numberOfAvailableKeys(lock) <= 0,
  }
}
