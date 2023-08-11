import { ZERO } from '../constants'
import { getErc20Decimals } from '../erc20'
import ethersUtils from '../utils'

/**
 * Returns the key price in its currency, rather than its decimal representation (Ether vs. Wei for example)
 * @param {*} currencyContractAddress
 * @param {*} lock
 * @param {*} provider
 */
export async function _getKeyPrice(lock: any, provider: any) {
  const currencyContractAddress = lock.currencyContractAddress || ZERO
  if (typeof lock.keyPrice === 'number') {
    lock.keyPrice = lock.keyPrice.toString()
  }
  if (currencyContractAddress !== ZERO) {
    // We need to get the decimal value
    const erc20Decimals = await getErc20Decimals(
      currencyContractAddress,
      provider
    )
    return ethersUtils.toDecimal(lock.keyPrice, erc20Decimals)
  }
  return ethersUtils.toWei(lock.keyPrice, 'ether')
}
