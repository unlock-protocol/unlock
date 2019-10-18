import utils from '../utils'
import { GAS_AMOUNTS, ZERO } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'
import { getErc20Decimals } from '../erc20'

/**
 * Changes the price of keys on a given lock
 * @param {object} params
 * - {PropTypes.address} lockAddress : address of the lock for which we update the price
 * - {string} keyPrice : new price for the lock, as a string (as wei)
 * - {string} decimals : Optional number of decimals (read from contract if unset)
 * - {string} erc20Address : Optional address of ERC20, to retrieve decimals (read from contract if unset)
 */
export default async function({
  lockAddress,
  keyPrice,
  decimals,
  erc20Address,
}) {
  const lockContract = await this.getLockContract(lockAddress)

  if (decimals == null) {
    // Get the decimals address from the contract
    if (!erc20Address) {
      erc20Address = await lockContract.tokenAddress()
    }

    if (erc20Address && erc20Address !== ZERO) {
      decimals = await getErc20Decimals(erc20Address, this.provider)
    } else {
      decimals = 18
    }
  }
  const actualAmount = utils.toDecimal(keyPrice, decimals)

  let transactionPromise
  try {
    transactionPromise = lockContract['updateKeyPrice(uint256)'](actualAmount, {
      gasLimit: GAS_AMOUNTS.updateKeyPrice,
    })
    const hash = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.UPDATE_KEY_PRICE
    )
    // Let's now wait for the keyPrice to have been changed before we return it
    const receipt = await this.provider.waitForTransaction(hash)
    const parser = lockContract.interface

    const priceChangedEvent = receipt.logs
      .map(log => {
        return parser.parseLog(log)
      })
      .filter(event => {
        return event.name === 'PriceChanged'
      })[0]
    if (priceChangedEvent) {
      return utils.fromDecimal(priceChangedEvent.values.keyPrice, decimals)
    } else {
      // There was no NewEvent log (transaction failed?)
      return null
    }
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_UPDATE_KEY_PRICE))
  }
}
