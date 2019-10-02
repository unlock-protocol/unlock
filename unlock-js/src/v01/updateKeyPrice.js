import utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'

/**
 *
 * @param {object} params
 * - {PropTypes.address} lock : address of the lock for which we update the price
 * - {string} price : new price for the lock
 */
export default async function({ lockAddress, price }) {
  const lockContract = await this.getLockContract(lockAddress)
  let transactionPromise
  try {
    transactionPromise = lockContract['updateKeyPrice(uint256)'](
      utils.toWei(price, 'ether'),
      {
        gasLimit: GAS_AMOUNTS.updateKeyPrice,
      }
    )
    const ret = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.UPDATE_KEY_PRICE
    )
    return ret
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_UPDATE_KEY_PRICE))
  }
}
